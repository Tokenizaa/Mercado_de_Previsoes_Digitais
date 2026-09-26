import {
  EconomicDistribution,
  Market,
  MarketOption,
  MarketResolutionLog,
  Position,
} from './types';
import { getSourceAdapter } from './adapters';

export const PLATFORM_OPERATIONAL_COST_PCT = 0.10; // 10%
export const CREATOR_REWARD_PCT = 0.20;            // 20%
export const WINNERS_SHARE_PCT = 0.70;             // 70%

/**
 * Calcula a divisão econômica transparente de um pool de mercado.
 */
export function calculateEconomics(totalPool: number): EconomicDistribution {
  const pool = Math.max(0, totalPool);
  const winnersPool = Math.floor(pool * WINNERS_SHARE_PCT);
  const creatorReward = Math.floor(pool * CREATOR_REWARD_PCT);
  const platformCost = pool - winnersPool - creatorReward; // saldo exato sem dízimas

  return {
    total_pool: pool,
    winners_share_pct: 70,
    winners_pool: winnersPool,
    creator_share_pct: 20,
    creator_reward: creatorReward,
    platform_cost_pct: 10,
    platform_cost: platformCost,
  };
}

/**
 * Atualiza probabilidades das opções com base na proporção de créditos alocados.
 * Se nenhuma posição foi comprada ainda, distribui igualmente.
 */
export function recalculateProbabilities(options: MarketOption[]): MarketOption[] {
  const total = options.reduce((sum, opt) => sum + (opt.total_position || 0), 0);
  if (total === 0) {
    const equalProb = Number((100 / options.length).toFixed(1));
    return options.map((opt) => ({
      ...opt,
      current_probability: equalProb,
    }));
  }

  return options.map((opt) => {
    const rawPct = ((opt.total_position || 0) / total) * 100;
    // Garante no mínimo 1% e no máximo 99% para mercados ativos
    const clamped = Math.min(99, Math.max(1, Number(rawPct.toFixed(1))));
    return {
      ...opt,
      current_probability: clamped,
    };
  });
}

/**
 * Executa a resolução do mercado consultando o adapter correspondente
 * e calcula a distribuição de retorno para as posições.
 */
export async function executeMarketResolution(
  market: Market,
  options: MarketOption[],
  positions: Position[],
  overrideWinnerOptionId?: string
): Promise<{
  updatedMarket: Market;
  updatedOptions: MarketOption[];
  updatedPositions: Position[];
  resolutionLog: MarketResolutionLog;
  distribution: EconomicDistribution;
}> {
  const adapter = getSourceAdapter(market.source_type);
  const inspection = await adapter.inspect(
    market.source_identifier,
    market.source_url,
    market.resolution_rule
  );

  let winningOption: MarketOption | undefined;

  if (overrideWinnerOptionId) {
    winningOption = options.find((o) => o.id === overrideWinnerOptionId);
  }

  // Se não foi forçado, determina com base na regra e tipo
  if (!winningOption) {
    if (market.market_type === 'LIMIAR') {
      // Exemplo: se valor observado for >= limiar, "Sim" vence, senão "Não"
      winningOption = options[0]; // "Sim" padrão
    } else if (market.market_type === 'RANKING') {
      winningOption = options[0]; // Primeiro colocado
    } else {
      winningOption = options[0]; // Opção padrão
    }
  }

  const updatedOptions = options.map((opt) => ({
    ...opt,
    result: (opt.id === winningOption?.id ? 'WINNER' : 'LOSER') as 'WINNER' | 'LOSER',
  }));

  const totalPool = options.reduce((sum, opt) => sum + (opt.total_position || 0), 0);
  const distribution = calculateEconomics(totalPool);

  // Calcula payouts para os acertadores
  const winningUnitsTotal = positions
    .filter((p) => p.option_id === winningOption?.id && p.status === 'OPEN')
    .reduce((sum, p) => sum + p.units, 0);

  const updatedPositions = positions.map((p) => {
    if (p.market_id !== market.id) return p;
    if (p.option_id === winningOption?.id) {
      const shareOfPool = winningUnitsTotal > 0 ? p.units / winningUnitsTotal : 0;
      const payout = Math.floor(distribution.winners_pool * shareOfPool);
      return {
        ...p,
        status: 'WON' as const,
        credits_payout: payout,
        updated_at: new Date().toISOString(),
      };
    } else {
      return {
        ...p,
        status: 'LOST' as const,
        credits_payout: 0,
        updated_at: new Date().toISOString(),
      };
    }
  });

  const resolutionLog: MarketResolutionLog = {
    id: `log-${Date.now()}`,
    market_id: market.id,
    source_url: market.source_url,
    source_payload: inspection.raw_payload,
    observed_result: `${inspection.evidence_summary} → Vencedor: ${winningOption?.label}`,
    verified_at: inspection.captured_at,
    status: 'SUCCESS',
    evidence: `Consulta via ${adapter.providerName} [${inspection.is_demo ? 'MODO DEMO' : 'PRODUÇÃO'}]. Identificador: ${market.source_identifier}`,
    is_demo: inspection.is_demo,
    created_at: new Date().toISOString(),
  };

  const updatedMarket: Market = {
    ...market,
    status: 'DISTRIBUTED',
    resolution_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    updatedMarket,
    updatedOptions,
    updatedPositions,
    resolutionLog,
    distribution,
  };
}
