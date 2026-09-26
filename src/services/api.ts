/**
 * Cliente de Integração com a API do Cloudflare Worker
 * 
 * Arquitetura Canônica:
 * Frontend (React) ──► Cloudflare Worker (/api/*) ──► Supabase PostgreSQL (prediction_*)
 * 
 * O Worker é a camada autoritativa de API e regras de negócio.
 * O Supabase é a fonte de verdade para persistência.
 */

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL || 'https://qyjoegombkgkgbvcjvhu.supabase.co', import.meta.env.VITE_SUPABASE_ANON_KEY || 'missing-anon-key');

import {
  PredictionMarket,
  PredictionPosition,
  PredictionSourceProvider,
  PredictionActivity,
  PredictionResolutionLog,
  PredictionProfile,
  PredictionCreditLedger,
} from '../../worker/src/types';

let authToken: string | null = null;
export function setAuthToken(token: string | null) { authToken = token; }
export function getAuthToken() { return authToken; }

export async function syncAuthSession() {
  const { data } = await supabase.auth.getSession();
  setAuthToken(data.session?.access_token ?? null);
  return data.session;
}

supabase.auth.onAuthStateChange((_event, session) => {
  setAuthToken(session?.access_token ?? null);
});

const API_BASE = import.meta.env.VITE_WORKER_API_URL || '/api';

function getAuthHeader(): Record<string, string> {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

export const workerApi = {
  /**
   * Health check do Cloudflare Worker e status do banco
   */
  async checkHealth(): Promise<{ status: string; service: string; database?: string; namespace?: string }> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        headers: getAuthHeader(),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('[API] Falha no health check do Worker:', e);
    }
    return { status: 'offline', service: 'mercado-previsoes-worker' };
  },

  /**
   * Consulta lista de mercados publicáveis do Supabase via Worker
   */
  async getMarkets(): Promise<PredictionMarket[]> {
    const res = await fetch(`${API_BASE}/markets`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error(`Falha ao buscar mercados: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Consulta detalhes do mercado por slug
   */
  async getMarketBySlug(slug: string): Promise<PredictionMarket | null> {
    const res = await fetch(`${API_BASE}/markets/${slug}`, {
      headers: getAuthHeader(),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Falha ao buscar mercado ${slug}: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || null;
  },

  /**
   * Consulta provedores de fontes auditáveis
   */
  async getSources(): Promise<PredictionSourceProvider[]> {
    const res = await fetch(`${API_BASE}/sources`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error(`Falha ao buscar fontes: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Consulta atividades públicas recentes
   */
  async getActivity(): Promise<PredictionActivity[]> {
    const res = await fetch(`${API_BASE}/activity`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  },

  /**
   * Consulta portfólio completo do usuário no banco oficial
   */
  async getPortfolio(): Promise<{
    profile: PredictionProfile;
    openPositions: PredictionPosition[];
    closedPositions: PredictionPosition[];
    recentLedger: PredictionCreditLedger[];
  }> {
    const res = await fetch(`${API_BASE}/portfolio`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) {
      throw new Error(`Falha ao buscar portfólio: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Criação de novo mercado com validação de auditabilidade
   */
  async createMarket(marketData: {
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
  }): Promise<{ success: boolean; data?: PredictionMarket; error?: string }> {
    const res = await fetch(`${API_BASE}/markets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(marketData),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || 'Falha ao criar mercado' };
    }
    return { success: true, data: json.data };
  },

  /**
   * Compra atômica de posição com registro no Ledger
   */
  async buyPosition(
    marketId: string,
    optionId: string,
    creditsSpent: number
  ): Promise<{ success: boolean; data?: PredictionPosition; error?: string }> {
    const res = await fetch(`${API_BASE}/markets/${marketId}/positions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        option_id: optionId,
        credits_spent: creditsSpent,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || 'Falha ao comprar posição' };
    }
    return { success: true, data: json.data };
  },

  /**
   * Venda/Liquidação de posição com crédito no perfil e Ledger
   */
  async sellPosition(
    marketId: string,
    positionId: string,
    units?: number
  ): Promise<{ success: boolean; creditsReturned?: number; error?: string }> {
    const res = await fetch(`${API_BASE}/markets/${marketId}/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        position_id: positionId,
        units,
      }),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || 'Falha ao vender posição' };
    }
    return { success: true, creditsReturned: json.credits_returned };
  },

  /**
   * Resolução real de mercado consultando adapter e gravando evidência
   */
  async resolveMarket(
    marketId: string
  ): Promise<{ success: boolean; data?: PredictionResolutionLog; error?: string }> {
    const res = await fetch(`${API_BASE}/markets/${marketId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({}),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json.error || 'Falha na resolução do mercado' };
    }
    return { success: true, data: json.data };
  },
};
