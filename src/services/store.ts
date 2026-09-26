import {
  Category,
  Market,
  MarketActivity,
  MarketOption,
  MarketResolutionLog,
  Position,
  SourceProvider,
  User,
} from '../types/market';
import { SEED_MARKETS, SEED_USERS, SOURCE_PROVIDERS_LIST } from '../data/seedMarkets';
import { getSourceAdapter } from '../../worker/src/adapters';
import { calculateEconomics } from '../../worker/src/engine';

const STORAGE_KEY_MARKETS = 'mpd_markets_v1';
const STORAGE_KEY_USER = 'mpd_current_user_v1';
const STORAGE_KEY_USERS = 'mpd_all_users_v1';
const STORAGE_KEY_POSITIONS = 'mpd_positions_v1';
const STORAGE_KEY_ACTIVITY = 'mpd_activity_v1';
const STORAGE_KEY_LOGS = 'mpd_resolution_logs_v1';

class MarketStore {
  private markets: Market[] = [];
  private users: User[] = [];
  private currentUser: User = SEED_USERS[0];
  private positions: Position[] = [];
  private activity: MarketActivity[] = [];
  private logs: MarketResolutionLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedMarkets = localStorage.getItem(STORAGE_KEY_MARKETS);
      this.markets = savedMarkets ? JSON.parse(savedMarkets) : SEED_MARKETS;

      const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      this.users = savedUsers ? JSON.parse(savedUsers) : SEED_USERS;

      const savedCurrentUser = localStorage.getItem(STORAGE_KEY_USER);
      this.currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) : this.users[0];

      const savedPositions = localStorage.getItem(STORAGE_KEY_POSITIONS);
      this.positions = savedPositions ? JSON.parse(savedPositions) : this.getInitialDemoPositions();

      const savedActivity = localStorage.getItem(STORAGE_KEY_ACTIVITY);
      this.activity = savedActivity ? JSON.parse(savedActivity) : this.getInitialDemoActivity();

      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      this.logs = savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      this.markets = SEED_MARKETS;
      this.users = SEED_USERS;
      this.currentUser = SEED_USERS[0];
      this.positions = [];
      this.activity = [];
      this.logs = [];
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(this.markets));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEY_POSITIONS, JSON.stringify(this.positions));
      localStorage.setItem(STORAGE_KEY_ACTIVITY, JSON.stringify(this.activity));
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Falha ao persistir no localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Getters ---
  public getMarkets(): Market[] {
    return [...this.markets];
  }

  public getMarketBySlug(slug: string): Market | undefined {
    return this.markets.find((m) => m.slug === slug);
  }

  public getMarketById(id: string): Market | undefined {
    return this.markets.find((m) => m.id === id);
  }

  public getCurrentUser(): User {
    return { ...this.currentUser };
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getSources(): SourceProvider[] {
    return SOURCE_PROVIDERS_LIST;
  }

  public getUserPositions(userId?: string): Position[] {
    const targetId = userId || this.currentUser.id;
    return this.positions.filter((p) => p.user_id === targetId);
  }

  public getMarketActivity(marketId?: string): MarketActivity[] {
    if (marketId) {
      return this.activity.filter((a) => a.market_id === marketId).slice(0, 15);
    }
    return this.activity.slice(0, 20);
  }

  public getResolutionLogs(marketId?: string): MarketResolutionLog[] {
    if (marketId) {
      return this.logs.filter((l) => l.market_id === marketId);
    }
    return this.logs;
  }

  // --- Actions ---

  public switchUser(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.persist();
    }
  }

  public buyPosition(marketId: string, optionId: string, creditsAmount: number): { success: boolean; message?: string } {
    if (creditsAmount <= 0) return { success: false, message: 'Quantidade inválida' };
    if (this.currentUser.credits_balance < creditsAmount) {
      return { success: false, message: 'Saldo insuficiente de Créditos' };
    }

    const marketIndex = this.markets.findIndex((m) => m.id === marketId);
    if (marketIndex === -1) return { success: false, message: 'Mercado não encontrado' };

    const market = this.markets[marketIndex];
    if (market.status !== 'OPEN') {
      return { success: false, message: 'Mercado fechado para novas posições' };
    }

    const option = market.options.find((o) => o.id === optionId);
    if (!option) return { success: false, message: 'Opção não encontrada' };

    // Deduz créditos do usuário
    this.currentUser.credits_balance -= creditsAmount;
    const userIdx = this.users.findIndex((u) => u.id === this.currentUser.id);
    if (userIdx !== -1) {
      this.users[userIdx].credits_balance = this.currentUser.credits_balance;
    }

    // Preço estimado da unidade baseado na probabilidade atual (1 unidade = 100 créditos x prob)
    const probDecimal = Math.max(0.05, option.current_probability / 100);
    const unitsBought = Number((creditsAmount / (probDecimal * 100)).toFixed(4));

    // Atualiza opções e pool
    option.total_position = (option.total_position || 0) + creditsAmount;
    market.total_pool = (market.total_pool || 0) + creditsAmount;

    // Recalcula probabilidades de todas as opções
    const totalPos = market.options.reduce((sum, o) => sum + (o.total_position || 0), 0);
    market.options = market.options.map((opt) => ({
      ...opt,
      current_probability: Math.min(99, Math.max(1, Math.round(((opt.total_position || 0) / totalPos) * 100))),
    }));

    // Registra ou atualiza posição do usuário
    const existingPos = this.positions.find(
      (p) => p.user_id === this.currentUser.id && p.market_id === marketId && p.option_id === optionId && p.status === 'OPEN'
    );

    if (existingPos) {
      existingPos.credits_spent += creditsAmount;
      existingPos.units += unitsBought;
      existingPos.average_price = Number((existingPos.credits_spent / existingPos.units).toFixed(2));
      existingPos.updated_at = new Date().toISOString();
    } else {
      const newPos: Position = {
        id: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: this.currentUser.id,
        market_id: marketId,
        market_title: market.title,
        market_slug: market.slug,
        option_id: optionId,
        option_label: option.label,
        credits_spent: creditsAmount,
        units: unitsBought,
        average_price: Number((creditsAmount / unitsBought).toFixed(2)),
        status: 'OPEN',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.positions.unshift(newPos);
    }

    // Registra atividade recente
    this.activity.unshift({
      id: `act-${Date.now()}`,
      market_id: marketId,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name,
      type: 'BUY',
      option_id: optionId,
      option_label: option.label,
      credits: creditsAmount,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true };
  }

  public sellPosition(positionId: string, unitsToSell?: number): { success: boolean; message?: string } {
    const pos = this.positions.find((p) => p.id === positionId && p.user_id === this.currentUser.id);
    if (!pos || pos.status !== 'OPEN') {
      return { success: false, message: 'Posição ativa não encontrada' };
    }

    const market = this.markets.find((m) => m.id === pos.market_id);
    if (!market || market.status !== 'OPEN') {
      return { success: false, message: 'Mercado não permite venda no momento' };
    }

    const option = market.options.find((o) => o.id === pos.option_id);
    const probDecimal = option ? option.current_probability / 100 : 0.5;

    // Valor de liquidação estimado
    const units = unitsToSell && unitsToSell <= pos.units ? unitsToSell : pos.units;
    const creditsReturned = Math.floor(units * probDecimal * 100 * 0.95); // 5% spread de saída

    this.currentUser.credits_balance += creditsReturned;
    const userIdx = this.users.findIndex((u) => u.id === this.currentUser.id);
    if (userIdx !== -1) {
      this.users[userIdx].credits_balance = this.currentUser.credits_balance;
    }

    if (units >= pos.units) {
      pos.status = 'CLOSED';
      pos.credits_payout = creditsReturned;
    } else {
      pos.units -= units;
      pos.credits_spent = Math.max(0, pos.credits_spent - creditsReturned);
    }
    pos.updated_at = new Date().toISOString();

    this.activity.unshift({
      id: `act-${Date.now()}`,
      market_id: pos.market_id,
      user_id: this.currentUser.id,
      user_name: this.currentUser.name,
      type: 'SELL',
      option_id: pos.option_id,
      option_label: pos.option_label,
      credits: creditsReturned,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true };
  }

  public createMarket(data: {
    title: string;
    description: string;
    category: Category;
    market_type: Market['market_type'];
    close_at: string;
    resolution_rule: string;
    source_type: string;
    source_url: string;
    source_identifier: string;
    options: string[];
    creation_plan: 'pequeno' | 'medio' | 'grande' | 'maior';
    image_url?: string;
  }): { success: boolean; market?: Market; message?: string } {
    if (!data.title || data.title.length < 10) {
      return { success: false, message: 'A pergunta deve ter pelo menos 10 caracteres' };
    }
    if (!data.source_url || !data.resolution_rule) {
      return { success: false, message: 'Auditabilidade obrigatória: especifique a fonte e regra' };
    }
    if (data.options.length < 2) {
      return { success: false, message: 'Defina ao menos duas opções para o mercado' };
    }

    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const marketId = `m-${Date.now()}`;
    const initialProb = Math.round(100 / data.options.length);

    const options: MarketOption[] = data.options.map((label, idx) => ({
      id: `opt-${marketId}-${idx}`,
      market_id: marketId,
      label,
      slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      current_probability: initialProb,
      total_position: 100, // semente inicial
    }));

    const source = SOURCE_PROVIDERS_LIST.find((s) => s.slug === data.source_type);

    const newMarket: Market = {
      id: marketId,
      slug,
      title: data.title,
      description: data.description,
      category: data.category,
      market_type: data.market_type,
      status: 'OPEN',
      creator_id: this.currentUser.id,
      creator_name: this.currentUser.name,
      creator_username: this.currentUser.username,
      close_at: data.close_at,
      resolution_rule: data.resolution_rule,
      source_type: data.source_type,
      source_name: source?.name || 'Fonte Verificada',
      source_url: data.source_url,
      source_identifier: data.source_identifier,
      image_url: data.image_url || '/src/assets/images/event_creator_studio_1790456788037.jpg',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options,
      total_pool: 100 * data.options.length,
    };

    this.markets.unshift(newMarket);
    this.persist();
    return { success: true, market: newMarket };
  }

  public async resolveMarketDemo(
    marketId: string,
    winnerOptionId?: string
  ): Promise<{ success: boolean; log?: MarketResolutionLog; message?: string }> {
    const market = this.markets.find((m) => m.id === marketId);
    if (!market) return { success: false, message: 'Mercado não encontrado' };

    const adapter = getSourceAdapter(market.source_type);
    const inspection = await adapter.inspect(
      market.source_identifier,
      market.source_url,
      market.resolution_rule
    );

    // Identifica vencedora
    const winningOption = winnerOptionId
      ? market.options.find((o) => o.id === winnerOptionId) || market.options[0]
      : market.options[0];

    market.options = market.options.map((opt) => ({
      ...opt,
      result: (opt.id === winningOption.id ? 'WINNER' : 'LOSER') as 'WINNER' | 'LOSER',
    }));

    market.status = 'DISTRIBUTED';
    market.resolution_at = new Date().toISOString();
    market.updated_at = new Date().toISOString();

    const totalPool = market.options.reduce((sum, o) => sum + (o.total_position || 0), 0);
    const distribution = calculateEconomics(totalPool);

    // Posições vencedoras
    const winningPositions = this.positions.filter(
      (p) => p.market_id === marketId && p.option_id === winningOption.id && p.status === 'OPEN'
    );
    const totalWinningUnits = winningPositions.reduce((sum, p) => sum + p.units, 0);

    // Atualiza posições e credita usuários
    this.positions = this.positions.map((p) => {
      if (p.market_id !== marketId || p.status !== 'OPEN') return p;
      if (p.option_id === winningOption.id) {
        const share = totalWinningUnits > 0 ? p.units / totalWinningUnits : 0;
        const payout = Math.floor(distribution.winners_pool * share);
        
        // Se for o usuário atual ou outro, credita
        if (p.user_id === this.currentUser.id) {
          this.currentUser.credits_balance += payout;
        }
        const u = this.users.find((x) => x.id === p.user_id);
        if (u && p.user_id !== this.currentUser.id) {
          u.credits_balance += payout;
        }

        return {
          ...p,
          status: 'WON',
          credits_payout: payout,
          updated_at: new Date().toISOString(),
        };
      } else {
        return {
          ...p,
          status: 'LOST',
          credits_payout: 0,
          updated_at: new Date().toISOString(),
        };
      }
    });

    // Credita criador (20% do pool)
    const creator = this.users.find((u) => u.id === market.creator_id);
    if (creator) {
      creator.credits_balance += distribution.creator_reward;
      if (creator.id === this.currentUser.id) {
        this.currentUser.credits_balance = creator.credits_balance;
      }
    }

    const log: MarketResolutionLog = {
      id: `log-${Date.now()}`,
      market_id: market.id,
      source_url: market.source_url,
      source_payload: inspection.raw_payload,
      observed_result: `${inspection.evidence_summary} → Opção Vencedora: ${winningOption.label}`,
      verified_at: inspection.captured_at,
      status: 'SUCCESS',
      evidence: `Consulta realizada via ${adapter.providerName} [${inspection.is_demo ? 'MODO DEMO AUDITÁVEL' : 'PRODUÇÃO'}]. Identificador: ${market.source_identifier}`,
      created_at: new Date().toISOString(),
    };

    this.logs.unshift(log);

    this.activity.unshift({
      id: `act-${Date.now()}`,
      market_id: market.id,
      user_id: 'system',
      user_name: 'Motor de Resolução',
      type: 'DISTRIBUTE',
      option_id: winningOption.id,
      option_label: winningOption.label,
      credits: distribution.winners_pool,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true, log };
  }

  public resetToDefaults() {
    this.markets = SEED_MARKETS;
    this.users = SEED_USERS;
    this.currentUser = SEED_USERS[0];
    this.positions = this.getInitialDemoPositions();
    this.activity = this.getInitialDemoActivity();
    this.logs = [];
    this.persist();
  }

  private getInitialDemoPositions(): Position[] {
    return [
      {
        id: 'pos-seed-1',
        user_id: 'user-lucas',
        market_id: 'm-res-1',
        market_title: 'Quem vence a luta principal do Fight Music Show 11?',
        market_slug: 'quem-vence-combate-principal-fms-11',
        option_id: 'opt-popo',
        option_label: 'Acelino Popó Freitas',
        credits_spent: 1200,
        units: 16.6,
        average_price: 72.28,
        status: 'OPEN',
        created_at: '2026-09-21T14:30:00Z',
        updated_at: '2026-09-21T14:30:00Z',
      },
      {
        id: 'pos-seed-2',
        user_id: 'user-lucas',
        market_id: 'm-lim-1',
        market_title: 'O vídeo de colaboração de MrBeast no Brasil ultrapassará 10 milhões de views em 48h?',
        market_slug: 'novo-video-mrbeast-brasil-10-milhoes-views-48h',
        option_id: 'opt-lim-1-yes',
        option_label: 'Sim (≥ 10 milhões de views)',
        credits_spent: 800,
        units: 11.7,
        average_price: 68.37,
        status: 'OPEN',
        created_at: '2026-09-22T09:15:00Z',
        updated_at: '2026-09-22T09:15:00Z',
      },
    ];
  }

  private getInitialDemoActivity(): MarketActivity[] {
    return [
      {
        id: 'act-1',
        market_id: 'm-lim-1',
        user_id: 'user-mariana',
        user_name: 'Mariana Duarte',
        type: 'BUY',
        option_label: 'Sim (≥ 10 milhões de views)',
        credits: 1500,
        created_at: '2026-09-26T12:40:00Z',
      },
      {
        id: 'act-2',
        market_id: 'm-res-1',
        user_id: 'user-lucas',
        user_name: 'Lucas Brandão',
        type: 'BUY',
        option_label: 'Acelino Popó Freitas',
        credits: 1200,
        created_at: '2026-09-26T11:20:00Z',
      },
      {
        id: 'act-3',
        market_id: 'm-ran-1',
        user_id: 'user-felipe',
        user_name: 'Felipe Podcaster',
        type: 'BUY',
        option_label: 'Menos É Mais & Convidados',
        credits: 950,
        created_at: '2026-09-26T09:10:00Z',
      },
    ];
  }
}

export const marketStore = new MarketStore();
