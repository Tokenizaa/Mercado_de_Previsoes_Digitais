/**
 * Store do Frontend com Integração com o Cloudflare Worker
 * 
 * Fonte Oficial da Verdade:
 * Supabase PostgreSQL (namespace prediction_*)
 * 
 * Camada de API / Backend:
 * Cloudflare Worker (/api/*)
 */

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
import { workerApi } from './api';

class MarketStore {
  private markets: Market[] = SEED_MARKETS;
  private users: User[] = SEED_USERS;
  private currentUser: User = SEED_USERS[0];
  private positions: Position[] = [];
  private activity: MarketActivity[] = [];
  private logs: MarketResolutionLog[] = [];
  private sources: SourceProvider[] = SOURCE_PROVIDERS_LIST;
  private listeners: Set<() => void> = new Set();
  private isBackendConnected: boolean = false;

  constructor() {
    this.loadCachedState();
    this.syncWithWorker();
  }

  /**
   * Sincronização em segundo plano com o Cloudflare Worker / Supabase
   */
  public async syncWithWorker() {
    try {
      const health = await workerApi.checkHealth();
      if (health.status === 'ok') {
        this.isBackendConnected = true;

        // 1. Busca mercados reais
        const remoteMarkets = await workerApi.getMarkets();
        if (remoteMarkets && remoteMarkets.length > 0) {
          this.markets = remoteMarkets.map((rm) => ({
            id: rm.id,
            slug: rm.slug,
            title: rm.title,
            description: rm.description,
            category: rm.category,
            market_type: rm.market_type,
            status: rm.status,
            creator_id: rm.creator_id,
            creator_name: rm.creator?.name,
            creator_username: rm.creator?.username,
            close_at: rm.close_at,
            resolution_at: rm.resolution_at || undefined,
            resolution_rule: rm.resolution_rule,
            source_type: rm.source_type,
            source_name: rm.source_provider?.name || rm.source_type,
            source_url: rm.source_url,
            source_identifier: rm.source_identifier,
            image_url: rm.image_url || undefined,
            total_pool: rm.total_pool || 0,
            featured: rm.featured,
            created_at: rm.created_at,
            updated_at: rm.updated_at,
            options: (rm.options || []).map((ro) => ({
              id: ro.id,
              market_id: ro.market_id,
              label: ro.label,
              slug: ro.slug,
              current_probability: Number(ro.current_probability),
              total_position: Number(ro.total_position || 0),
              result: ro.result,
              created_at: ro.created_at,
            })),
          }));
        }

        // 2. Busca fontes ativas
        const remoteSources = await workerApi.getSources();
        if (remoteSources && remoteSources.length > 0) {
          this.sources = remoteSources.map((rs) => ({
            id: rs.id,
            name: rs.name,
            slug: rs.slug,
            category: rs.category,
            source_type: rs.source_type,
            api_available: rs.api_available,
            automated_resolution_supported: rs.automated_resolution_supported,
            active: rs.active,
            description: rs.description || '',
          }));
        }

        // 3. Busca atividades públicas
        const remoteActivity = await workerApi.getActivity();
        if (remoteActivity && remoteActivity.length > 0) {
          this.activity = remoteActivity.map((ra: any) => ({
            id: ra.id,
            market_id: ra.market_id,
            user_id: ra.user_id,
            user_name: ra.user?.name || 'Participante',
            type: ra.type,
            option_id: ra.option_id,
            credits: ra.credits,
            created_at: ra.created_at,
          }));
        }

        // 4. Busca portfólio oficial do banco
        try {
          const portfolio = await workerApi.getPortfolio();
          if (portfolio && portfolio.profile) {
            this.currentUser = {
              id: portfolio.profile.id,
              name: portfolio.profile.name,
              username: portfolio.profile.username,
              avatar_url: portfolio.profile.avatar_url || undefined,
              credits_balance: portfolio.profile.credits_balance,
              created_at: portfolio.profile.created_at,
            };

            this.positions = portfolio.openPositions.concat(portfolio.closedPositions).map((p) => ({
              id: p.id,
              user_id: p.user_id,
              market_id: p.market_id,
              market_title: p.market_title,
              market_slug: p.market_slug,
              option_id: p.option_id,
              option_label: p.option_label,
              credits_spent: p.credits_spent,
              units: p.units,
              average_price: p.average_price,
              status: p.status,
              credits_payout: p.credits_payout,
              created_at: p.created_at,
              updated_at: p.updated_at,
            }));
          }
        } catch (_) {}

        this.notify();
      }
    } catch (e) {
      console.warn('[Store] Executando com dados semente locais devido à indisponibilidade de rede temporária');
    }
  }

  private loadCachedState() {
    try {
      const cachedMarkets = localStorage.getItem('mpd_markets_cache');
      if (cachedMarkets) {
        this.markets = JSON.parse(cachedMarkets);
      }
    } catch (_) {}
  }

  private persistCache() {
    try {
      localStorage.setItem('mpd_markets_cache', JSON.stringify(this.markets));
    } catch (_) {}
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
    return [...this.sources];
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

  // --- Actions Conectadas com a API ---

  public switchUser(userId: string) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.notify();
    }
  }

  public async buyPosition(
    marketId: string,
    optionId: string,
    creditsAmount: number
  ): Promise<{ success: boolean; message?: string }> {
    if (creditsAmount <= 0) return { success: false, message: 'Quantidade inválida' };

    // Dispara para o Worker / Supabase
    const res = await workerApi.buyPosition(marketId, optionId, creditsAmount);

    if (res.success) {
      // Sincroniza estado atualizado
      await this.syncWithWorker();
      return { success: true };
    }

    // Se a API retornou erro do banco (ex: saldo insuficiente)
    if (res.error) {
      return { success: false, message: res.error };
    }

    return { success: true };
  }

  public async sellPosition(
    positionId: string,
    unitsToSell?: number
  ): Promise<{ success: boolean; message?: string }> {
    const pos = this.positions.find((p) => p.id === positionId);
    if (!pos) return { success: false, message: 'Posição não encontrada' };

    const res = await workerApi.sellPosition(pos.market_id, positionId, unitsToSell);

    if (res.success) {
      await this.syncWithWorker();
      return { success: true };
    }

    return { success: false, message: res.error || 'Erro ao vender posição' };
  }

  public async createMarket(data: {
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
  }): Promise<{ success: boolean; market?: Market; message?: string }> {
    const res = await workerApi.createMarket(data);

    if (res.success && res.data) {
      await this.syncWithWorker();
      const created = this.markets.find((m) => m.id === res.data?.id) || {
        ...res.data,
        options: (res.data.options || []).map((o) => ({
          ...o,
          current_probability: Number(o.current_probability),
          total_position: Number(o.total_position || 0),
        })),
      };
      return { success: true, market: created as Market };
    }

    return { success: false, message: res.error || 'Erro ao criar mercado' };
  }

  public async resolveMarketDemo(
    marketId: string,
    winnerOptionId?: string
  ): Promise<{ success: boolean; log?: MarketResolutionLog; message?: string }> {
    const res = await workerApi.resolveMarket(marketId);

    if (res.success && res.data) {
      await this.syncWithWorker();
      return { success: true, log: res.data as MarketResolutionLog };
    }

    return { success: false, message: res.error || 'Falha ao resolver mercado' };
  }

  public resetToDefaults() {
    this.markets = SEED_MARKETS;
    this.users = SEED_USERS;
    this.currentUser = SEED_USERS[0];
    this.positions = [];
    this.activity = [];
    this.logs = [];
    this.persistCache();
  }
}

export const marketStore = new MarketStore();
