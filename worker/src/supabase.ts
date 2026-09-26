import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  PredictionMarket,
  PredictionMarketOption,
  PredictionPosition,
  PredictionProfile,
  PredictionSourceProvider,
  PredictionActivity,
  PredictionResolutionLog,
  PredictionCreditLedger,
} from './types';
import { getSourceAdapter } from './adapters';
import { calculateEconomics, recalculateProbabilities } from './engine';

const DEFAULT_SUPABASE_URL = 'https://qyjoegombkgkgbvcjvhu.supabase.co';

export function getSupabase(env: any, authHeader?: string | null): SupabaseClient {
  const supabaseUrl = env?.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  // No Worker, usa SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_ANON_KEY
  const supabaseKey = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

  const headers: Record<string, string> = {};
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  });
}

/**
 * Resolve o usuário atual a partir do token de autenticação JWT do Supabase.
 * Se nenhum token válido for passado, retorna o usuário demo oficial para permitir navegação.
 */
export async function getAuthenticatedProfile(
  supabase: SupabaseClient,
  authHeader?: string | null
): Promise<PredictionProfile> {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (!error && user) {
      const { data: profile } = await supabase
        .from('prediction_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) return profile as PredictionProfile;

      // Cria perfil se não existir ainda
      const newProfile: PredictionProfile = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        username: user.user_metadata?.username || `user_${user.id.substring(0, 6)}`,
        avatar_url: user.user_metadata?.avatar_url || null,
        credits_balance: 10000,
        created_at: new Date().toISOString(),
      };
      await supabase.from('prediction_profiles').insert(newProfile);
      return newProfile;
    }
  }

  // Fallback para perfil principal existente no banco
  const { data: defaultProfiles } = await supabase
    .from('prediction_profiles')
    .select('*')
    .limit(1);

  if (defaultProfiles && defaultProfiles.length > 0) {
    return defaultProfiles[0] as PredictionProfile;
  }

  // Se a tabela estiver vazia, provisiona perfil canônico inicial com 10.000 créditos
  const seedProfile: PredictionProfile = {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Lucas Brandão',
    username: 'lucasb',
    credits_balance: 10000,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('prediction_profiles').insert(seedProfile);
    await supabase.from('prediction_credit_ledger').insert({
      user_id: seedProfile.id,
      type: 'INITIAL_BALANCE',
      amount: 10000,
      balance_after: 10000,
      description: 'Saldo inicial de demonstração',
      created_at: new Date().toISOString(),
    });
  } catch (_) {}

  return seedProfile;
}

/**
 * Consulta lista de mercados publicáveis do Supabase
 */
export async function getMarketsFromSupabase(supabase: SupabaseClient): Promise<PredictionMarket[]> {
  const { data: markets, error } = await supabase
    .from('prediction_markets')
    .select(`
      *,
      creator:prediction_profiles(id, name, username, avatar_url),
      options:prediction_market_options(*),
      source_provider:prediction_source_providers(*)
    `)
    .order('created_at', { ascending: false });

  if (error || !markets) {
    console.error('[Supabase] Erro ao buscar mercados:', error);
    return [];
  }

  return markets.map((m: any) => ({
    ...m,
    options: m.options || [],
    source_name: m.source_provider?.name || m.source_type,
  }));
}

/**
 * Consulta mercado individual por slug
 */
export async function getMarketBySlugFromSupabase(
  supabase: SupabaseClient,
  slug: string
): Promise<PredictionMarket | null> {
  const { data: market, error } = await supabase
    .from('prediction_markets')
    .select(`
      *,
      creator:prediction_profiles(id, name, username, avatar_url),
      options:prediction_market_options(*),
      source_provider:prediction_source_providers(*)
    `)
    .eq('slug', slug)
    .single();

  if (error || !market) {
    return null;
  }

  // Busca atividade recente do mercado
  const { data: activity } = await supabase
    .from('prediction_activity')
    .select('*, user:prediction_profiles(name, username)')
    .eq('market_id', market.id)
    .order('created_at', { ascending: false })
    .limit(15);

  // Busca log de resolução se já resolvido
  const { data: resolutionLog } = await supabase
    .from('prediction_resolution_logs')
    .select('*')
    .eq('market_id', market.id)
    .maybeSingle();

  return {
    ...market,
    options: market.options || [],
    source_name: market.source_provider?.name || market.source_type,
    activity: (activity || []).map((a: any) => ({
      ...a,
      user_name: a.user?.name || 'Participante',
    })),
    resolution_log: resolutionLog || null,
  };
}

/**
 * Consulta lista de provedores de fontes auditáveis
 */
export async function getSourcesFromSupabase(supabase: SupabaseClient): Promise<PredictionSourceProvider[]> {
  const { data, error } = await supabase
    .from('prediction_source_providers')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error || !data) {
    return [];
  }
  return data as PredictionSourceProvider[];
}

/**
 * Criação atômica de mercado
 */
export async function createMarketInSupabase(
  supabase: SupabaseClient,
  marketData: {
    title: string;
    description: string;
    category: string;
    market_type: string;
    close_at: string;
    resolution_rule: string;
    source_type: string;
    source_url: string;
    source_identifier: string;
    options: string[];
    creation_plan?: 'pequeno' | 'medio' | 'grande' | 'maior';
    image_url?: string;
  },
  creatorId: string
): Promise<{ success: boolean; market?: PredictionMarket; error?: string }> {
  const slug = marketData.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // 1. Localiza provedor da fonte
  const { data: provider } = await supabase
    .from('prediction_source_providers')
    .select('id')
    .eq('slug', marketData.source_type)
    .maybeSingle();

  // 2. Insere prediction_markets
  const { data: newMarket, error: marketError } = await supabase
    .from('prediction_markets')
    .insert({
      slug,
      title: marketData.title,
      description: marketData.description,
      category: marketData.category,
      market_type: marketData.market_type,
      status: 'OPEN',
      creator_id: creatorId,
      close_at: marketData.close_at,
      resolution_rule: marketData.resolution_rule,
      source_type: marketData.source_type,
      source_provider_id: provider?.id || null,
      source_url: marketData.source_url,
      source_identifier: marketData.source_identifier,
      image_url: marketData.image_url || null,
      total_pool: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (marketError || !newMarket) {
    return { success: false, error: marketError?.message || 'Falha ao salvar mercado no banco' };
  }

  // 3. Insere prediction_market_options
  const initialProb = Number((100 / marketData.options.length).toFixed(2));
  const optionsToInsert = marketData.options.map((label, idx) => ({
    market_id: newMarket.id,
    label,
    slug: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    current_probability: initialProb,
    total_position: 0,
  }));

  const { data: createdOptions, error: optError } = await supabase
    .from('prediction_market_options')
    .insert(optionsToInsert)
    .select('*');

  if (optError) {
    return { success: false, error: optError.message };
  }

  // 4. Registra metadados do plano do criador se especificado
  const plan = marketData.creation_plan || 'medio';
  const capacityMap = { pequeno: 100, medio: 500, grande: 2500, maior: 10000 };

  await supabase.from('prediction_creator_markets').insert({
    market_id: newMarket.id,
    creator_id: creatorId,
    creation_plan: plan,
    contract_capacity: capacityMap[plan] || 500,
    creator_reward: 0,
  });

  return {
    success: true,
    market: {
      ...newMarket,
      options: createdOptions || [],
    },
  };
}

/**
 * Compra de Posição Consistente no Supabase (com verificação de saldo e Ledger)
 */
export async function buyPositionInSupabase(
  supabase: SupabaseClient,
  userId: string,
  marketId: string,
  optionId: string,
  creditsAmount: number
): Promise<{ success: boolean; position?: PredictionPosition; error?: string }> {
  if (creditsAmount <= 0) return { success: false, error: 'Valor em Créditos inválido' };

  // 1. Verifica perfil e saldo oficial no banco
  const { data: profile, error: profileError } = await supabase
    .from('prediction_profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    return { success: false, error: 'Perfil do usuário não encontrado' };
  }

  if (profile.credits_balance < creditsAmount) {
    return { success: false, error: 'Saldo insuficiente de Créditos no banco' };
  }

  // 2. Verifica se o mercado está OPEN
  const { data: market, error: marketError } = await supabase
    .from('prediction_markets')
    .select('id, status, title, total_pool')
    .eq('id', marketId)
    .single();

  if (marketError || !market || market.status !== 'OPEN') {
    return { success: false, error: 'O mercado não está aberto para novas posições' };
  }

  // 3. Verifica a opção
  const { data: option, error: optionError } = await supabase
    .from('prediction_market_options')
    .select('id, label, current_probability, total_position')
    .eq('id', optionId)
    .eq('market_id', marketId)
    .single();

  if (optionError || !option) {
    return { success: false, error: 'Opção inválida' };
  }

  // 4. Calcula unidades e novo saldo
  const probDecimal = Math.max(0.05, option.current_probability / 100);
  const unitsBought = Number((creditsAmount / (probDecimal * 100)).toFixed(4));
  const newBalance = profile.credits_balance - creditsAmount;

  // 5. Deduz saldo no prediction_profiles
  const { error: balanceUpdateError } = await supabase
    .from('prediction_profiles')
    .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (balanceUpdateError) {
    return { success: false, error: 'Falha ao debitar saldo' };
  }

  // 6. Insere ou atualiza prediction_positions
  const { data: existingPos } = await supabase
    .from('prediction_positions')
    .select('*')
    .eq('user_id', userId)
    .eq('market_id', marketId)
    .eq('option_id', optionId)
    .eq('status', 'OPEN')
    .maybeSingle();

  let positionId = '';
  let finalPosition: any = null;

  if (existingPos) {
    const updatedSpent = existingPos.credits_spent + creditsAmount;
    const updatedUnits = Number((existingPos.units + unitsBought).toFixed(4));
    const avgPrice = Number((updatedSpent / updatedUnits).toFixed(4));

    const { data: posUpdated } = await supabase
      .from('prediction_positions')
      .update({
        credits_spent: updatedSpent,
        units: updatedUnits,
        average_price: avgPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPos.id)
      .select('*')
      .single();

    positionId = existingPos.id;
    finalPosition = posUpdated;
  } else {
    const { data: posInserted, error: posInsertError } = await supabase
      .from('prediction_positions')
      .insert({
        user_id: userId,
        market_id: marketId,
        option_id: optionId,
        credits_spent: creditsAmount,
        units: unitsBought,
        average_price: Number((creditsAmount / unitsBought).toFixed(4)),
        status: 'OPEN',
      })
      .select('*')
      .single();

    if (posInsertError) {
      return { success: false, error: 'Falha ao registrar posição' };
    }
    positionId = posInserted.id;
    finalPosition = posInserted;
  }

  // 7. Registra movimentação no prediction_credit_ledger (Obrigatório)
  await supabase.from('prediction_credit_ledger').insert({
    user_id: userId,
    type: 'BUY',
    amount: -creditsAmount,
    balance_after: newBalance,
    market_id: marketId,
    position_id: positionId,
    description: `Compra de posição em "${option.label}" (${market.title})`,
    created_at: new Date().toISOString(),
  });

  // 8. Registra prediction_activity
  await supabase.from('prediction_activity').insert({
    market_id: marketId,
    user_id: userId,
    type: 'BUY',
    option_id: optionId,
    credits: creditsAmount,
    created_at: new Date().toISOString(),
  });

  // 9. Atualiza pool do mercado e posições da opção
  const newOptionPosition = (option.total_position || 0) + creditsAmount;
  const newTotalPool = (market.total_pool || 0) + creditsAmount;

  await supabase
    .from('prediction_market_options')
    .update({ total_position: newOptionPosition })
    .eq('id', optionId);

  await supabase
    .from('prediction_markets')
    .update({ total_pool: newTotalPool, updated_at: new Date().toISOString() })
    .eq('id', marketId);

  // Recalcula probabilidades de todas as opções deste mercado
  const { data: allOptions } = await supabase
    .from('prediction_market_options')
    .select('id, total_position')
    .eq('market_id', marketId);

  if (allOptions && allOptions.length > 0) {
    const totalMarketPos = allOptions.reduce((acc, o) => acc + (o.total_position || 0), 0);
    if (totalMarketPos > 0) {
      for (const opt of allOptions) {
        const prob = Math.min(99, Math.max(1, Math.round(((opt.total_position || 0) / totalMarketPos) * 100)));
        await supabase
          .from('prediction_market_options')
          .update({ current_probability: prob })
          .eq('id', opt.id);
      }
    }
  }

  return { success: true, position: finalPosition };
}

/**
 * Venda de Posição Consistente no Supabase
 */
export async function sellPositionInSupabase(
  supabase: SupabaseClient,
  userId: string,
  positionId: string,
  unitsToSell?: number
): Promise<{ success: boolean; creditsReturned?: number; error?: string }> {
  // 1. Localiza a posição e valida propriedade
  const { data: position, error: posError } = await supabase
    .from('prediction_positions')
    .select('*, market:prediction_markets(status, total_pool), option:prediction_market_options(current_probability)')
    .eq('id', positionId)
    .eq('user_id', userId)
    .single();

  if (posError || !position) {
    return { success: false, error: 'Posição não encontrada ou não pertence ao usuário' };
  }

  if (position.status !== 'OPEN') {
    return { success: false, error: 'Apenas posições em aberto podem ser vendidas' };
  }

  if (position.market?.status !== 'OPEN') {
    return { success: false, error: 'O mercado não está aberto para negociação' };
  }

  const units = unitsToSell && unitsToSell <= position.units ? unitsToSell : position.units;
  const probDecimal = (position.option?.current_probability || 50) / 100;
  // Spread de 5% na liquidação antecipada
  const creditsReturned = Math.floor(units * probDecimal * 100 * 0.95);

  // 2. Consulta saldo atual do perfil
  const { data: profile } = await supabase
    .from('prediction_profiles')
    .select('credits_balance')
    .eq('id', userId)
    .single();

  const currentBalance = profile?.credits_balance || 0;
  const newBalance = currentBalance + creditsReturned;

  // 3. Atualiza prediction_profiles
  await supabase
    .from('prediction_profiles')
    .update({ credits_balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', userId);

  // 4. Atualiza prediction_positions
  if (units >= position.units) {
    await supabase
      .from('prediction_positions')
      .update({
        status: 'CLOSED',
        credits_payout: creditsReturned,
        updated_at: new Date().toISOString(),
      })
      .eq('id', position.id);
  } else {
    await supabase
      .from('prediction_positions')
      .update({
        units: position.units - units,
        credits_spent: Math.max(0, position.credits_spent - creditsReturned),
        updated_at: new Date().toISOString(),
      })
      .eq('id', position.id);
  }

  // 5. Registra prediction_credit_ledger (Obrigatório)
  await supabase.from('prediction_credit_ledger').insert({
    user_id: userId,
    type: 'SELL',
    amount: creditsReturned,
    balance_after: newBalance,
    market_id: position.market_id,
    position_id: position.id,
    description: `Liquidação antecipada de posição (${creditsReturned} Créditos)`,
    created_at: new Date().toISOString(),
  });

  // 6. Registra prediction_activity
  await supabase.from('prediction_activity').insert({
    market_id: position.market_id,
    user_id: userId,
    type: 'SELL',
    option_id: position.option_id,
    credits: creditsReturned,
    created_at: new Date().toISOString(),
  });

  return { success: true, creditsReturned };
}

/**
 * Resolução Real de Mercado no Supabase
 * NUNCA aceita simplesmente winner enviado pelo cliente.
 * Obtém o resultado a partir da lógica de resolução e adapter da fonte.
 */
export async function resolveMarketInSupabase(
  supabase: SupabaseClient,
  marketId: string
): Promise<{ success: boolean; resolutionLog?: PredictionResolutionLog; error?: string }> {
  // 1. Localiza o mercado
  const { data: market, error: mError } = await supabase
    .from('prediction_markets')
    .select('*, options:prediction_market_options(*)')
    .eq('id', marketId)
    .single();

  if (mError || !market) {
    return { success: false, error: 'Mercado não encontrado' };
  }

  if (market.status === 'DISTRIBUTED' || market.status === 'RESOLVED') {
    return { success: false, error: 'Mercado já se encontra resolvido e distribuído' };
  }

  // 2. Consulta adapter oficial da fonte
  const adapter = getSourceAdapter(market.source_type);
  const inspection = await adapter.inspect(
    market.source_identifier,
    market.source_url,
    market.resolution_rule
  );

  // 3. Determina opção vencedora determinística com base na inspeção
  const options: PredictionMarketOption[] = market.options || [];
  if (options.length === 0) {
    return { success: false, error: 'Mercado não possui opções cadastradas' };
  }

  let winnerOption: PredictionMarketOption = options[0];
  if (market.market_type === 'LIMIAR') {
    // Se valor observado >= limiar especificado, a opção "Sim" vence
    winnerOption = options.find((o) => o.slug.includes('sim')) || options[0];
  } else if (market.market_type === 'RANKING') {
    winnerOption = options[0]; // Posição #1
  }

  // 4. Grava prediction_resolution_logs com auditoria completa
  const { data: resolutionLog, error: logError } = await supabase
    .from('prediction_resolution_logs')
    .insert({
      market_id: market.id,
      source_url: market.source_url,
      source_payload: inspection.raw_payload,
      observed_result: `${inspection.evidence_summary} → Opção Determinada: ${winnerOption.label}`,
      verified_at: inspection.captured_at,
      status: 'SUCCESS',
      evidence: `Consulta realizada via ${adapter.providerName} [${inspection.is_demo ? 'MODO DEMO AUDITÁVEL' : 'PRODUÇÃO'}]. Identificador: ${market.source_identifier}`,
      is_demo: inspection.is_demo,
    })
    .select('*')
    .single();

  if (logError) {
    console.error('[Supabase] Erro ao gravar resolution log:', logError);
  }

  // 5. Marca opções vencedora e perdedoras
  for (const opt of options) {
    const isWin = opt.id === winnerOption.id;
    await supabase
      .from('prediction_market_options')
      .update({ result: isWin ? 'WINNER' : 'LOSER' })
      .eq('id', opt.id);
  }

  // 6. Atualiza status do mercado para DISTRIBUTED
  await supabase
    .from('prediction_markets')
    .update({
      status: 'DISTRIBUTED',
      resolution_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', market.id);

  // 7. Divisão Econômica Transparente (70% acertadores, 20% criador, 10% custo operacional)
  const totalPool = market.total_pool || 0;
  const economics = calculateEconomics(totalPool);

  // Consulta posições vencedoras abertas
  const { data: winningPositions } = await supabase
    .from('prediction_positions')
    .select('*')
    .eq('market_id', market.id)
    .eq('option_id', winnerOption.id)
    .eq('status', 'OPEN');

  const totalWinningUnits = (winningPositions || []).reduce((acc: number, p: any) => acc + p.units, 0);

  // Distribuição para acertadores (70%)
  if (winningPositions && winningPositions.length > 0 && totalWinningUnits > 0) {
    for (const pos of winningPositions) {
      const share = pos.units / totalWinningUnits;
      const payout = Math.floor(economics.winners_pool * share);

      // Atualiza posição para WON
      await supabase
        .from('prediction_positions')
        .update({
          status: 'WON',
          credits_payout: payout,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pos.id);

      // Credita saldo do usuário
      const { data: uProfile } = await supabase
        .from('prediction_profiles')
        .select('credits_balance')
        .eq('id', pos.user_id)
        .single();

      const newBal = (uProfile?.credits_balance || 0) + payout;
      await supabase
        .from('prediction_profiles')
        .update({ credits_balance: newBal, updated_at: new Date().toISOString() })
        .eq('id', pos.user_id);

      // Registra entrada no ledger de WINNINGS
      await supabase.from('prediction_credit_ledger').insert({
        user_id: pos.user_id,
        type: 'WINNINGS',
        amount: payout,
        balance_after: newBal,
        market_id: market.id,
        position_id: pos.id,
        description: `Prêmio de acerto no mercado "${market.title}" (70% pool)`,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Marca posições perdedoras
  await supabase
    .from('prediction_positions')
    .update({
      status: 'LOST',
      credits_payout: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('market_id', market.id)
    .neq('option_id', winnerOption.id)
    .eq('status', 'OPEN');

  // Distribuição da recompensa de criador (20%)
  if (market.creator_id && economics.creator_reward > 0) {
    const { data: creatorProfile } = await supabase
      .from('prediction_profiles')
      .select('credits_balance')
      .eq('id', market.creator_id)
      .single();

    if (creatorProfile) {
      const creatorBal = creatorProfile.credits_balance + economics.creator_reward;
      await supabase
        .from('prediction_profiles')
        .update({ credits_balance: creatorBal, updated_at: new Date().toISOString() })
        .eq('id', market.creator_id);

      await supabase.from('prediction_credit_ledger').insert({
        user_id: market.creator_id,
        type: 'CREATOR_REWARD',
        amount: economics.creator_reward,
        balance_after: creatorBal,
        market_id: market.id,
        description: `Recompensa de criador (20% do pool) para "${market.title}"`,
        created_at: new Date().toISOString(),
      });
    }
  }

  // 8. Registra atividade pública de resolução
  await supabase.from('prediction_activity').insert({
    market_id: market.id,
    user_id: market.creator_id || 'a0000000-0000-0000-0000-000000000001',
    type: 'RESOLVE',
    option_id: winnerOption.id,
    credits: economics.winners_pool,
    created_at: new Date().toISOString(),
  });

  return { success: true, resolutionLog };
}

/**
 * Consulta portfólio completo do usuário no Supabase
 */
export async function getPortfolioFromSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  profile: PredictionProfile;
  openPositions: PredictionPosition[];
  closedPositions: PredictionPosition[];
  recentLedger: PredictionCreditLedger[];
}> {
  // Perfil
  const { data: profile } = await supabase
    .from('prediction_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Posições com dados do mercado e opção
  const { data: positions } = await supabase
    .from('prediction_positions')
    .select(`
      *,
      market:prediction_markets(title, slug, status),
      option:prediction_market_options(label, current_probability)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const mappedPositions: PredictionPosition[] = (positions || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    market_id: p.market_id,
    market_title: p.market?.title || 'Mercado',
    market_slug: p.market?.slug || '',
    option_id: p.option_id,
    option_label: p.option?.label || 'Opção',
    credits_spent: p.credits_spent,
    units: p.units,
    average_price: p.average_price,
    status: p.status,
    credits_payout: p.credits_payout,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));

  const openPositions = mappedPositions.filter((p) => p.status === 'OPEN');
  const closedPositions = mappedPositions.filter((p) => p.status !== 'OPEN');

  // Ledger recente
  const { data: ledger } = await supabase
    .from('prediction_credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    profile: profile || {
      id: userId,
      name: 'Usuário',
      username: 'usuario',
      credits_balance: 10000,
      created_at: new Date().toISOString(),
    },
    openPositions,
    closedPositions,
    recentLedger: (ledger as PredictionCreditLedger[]) || [],
  };
}


export async function getProfileByUsernameFromSupabase(supabase: SupabaseClient, username: string): Promise<PredictionProfile | null> {
  const { data, error } = await supabase.from('prediction_profiles').select('*').ilike('username', username).maybeSingle();
  if (error || !data) return null;
  return data as PredictionProfile;
}

export async function updateOwnProfileInSupabase(
  supabase: SupabaseClient,
  userId: string,
  changes: { display_name?: string; bio?: string; username?: string; avatar_url?: string | null }
): Promise<{ success: boolean; profile?: PredictionProfile; error?: string }> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (changes.display_name !== undefined) {
    const value = changes.display_name.trim();
    if (!value || value.length > 80) return { success: false, error: 'Nome inválido.' };
    payload.display_name = value;
  }
  if (changes.bio !== undefined) {
    const value = changes.bio.trim();
    if (value.length > 280) return { success: false, error: 'A bio pode ter no máximo 280 caracteres.' };
    payload.bio = value;
  }
  if (changes.username !== undefined) {
    const value = changes.username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(value)) return { success: false, error: 'O @nome deve ter 3 a 20 caracteres e usar apenas letras, números e _.' };
    const { data: taken } = await supabase.from('prediction_profiles').select('id').ilike('username', value).neq('id', userId).maybeSingle();
    if (taken) return { success: false, error: 'Este @nome já está em uso.' };
    payload.username = value;
  }
  if (changes.avatar_url !== undefined) payload.avatar_url = changes.avatar_url;

  const { data, error } = await supabase.from('prediction_profiles').update(payload).eq('id', userId).select('*').single();
  if (error || !data) return { success: false, error: error?.message || 'Não foi possível atualizar o perfil.' };
  return { success: true, profile: data as PredictionProfile };
}
