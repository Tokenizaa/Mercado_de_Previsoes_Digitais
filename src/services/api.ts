/**
 * Cliente de Integração com o Cloudflare Worker
 * 
 * Em ambiente de desenvolvimento local ou pré-visualização,
 * caso o Worker externo ainda não esteja com deploy ativo,
 * as operações utilizam o motor reativo local com o mesmo contrato de dados.
 */

import { Market, MarketResolutionLog, SourceProvider } from '../types/market';
import { marketStore } from './store';

const WORKER_API_BASE = import.meta.env.VITE_WORKER_API_URL || '/api';

export const workerApi = {
  async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch(`${WORKER_API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return { status: 'ok', service: 'mercado-previsoes-engine-local' };
  },

  async getSources(): Promise<SourceProvider[]> {
    try {
      const res = await fetch(`${WORKER_API_BASE}/sources`);
      if (res.ok) {
        const data = await res.json();
        return data.data;
      }
    } catch (_) {}
    return marketStore.getSources();
  },

  async buyPosition(marketId: string, optionId: string, credits: number) {
    // Registra na store reativa local (sincronizada com localStorage)
    return marketStore.buyPosition(marketId, optionId, credits);
  },

  async sellPosition(positionId: string, units?: number) {
    return marketStore.sellPosition(positionId, units);
  },

  async resolveMarket(marketId: string, winnerOptionId?: string): Promise<{ success: boolean; log?: MarketResolutionLog }> {
    try {
      // Dispara chamada para o endpoint do Worker
      const res = await fetch(`${WORKER_API_BASE}/markets/${marketId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_option_id: winnerOptionId }),
      });
      if (res.ok) {
        console.log('[Worker] Resolução registrada no Worker remoto');
      }
    } catch (_) {}

    // Executa e registra auditoria completa na engine local
    return marketStore.resolveMarketDemo(marketId, winnerOptionId);
  }
};
