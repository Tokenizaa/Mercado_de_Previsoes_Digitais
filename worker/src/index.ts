/**
 * Cloudflare Worker API para o Mercado de Previsões Digitais
 * Executa as rotas de API, consulta de fontes e motor de resolução.
 */

import { executeMarketResolution, calculateEconomics } from './engine';
import { ADAPTER_REGISTRY } from './adapters';

export interface Env {
  ENVIRONMENT?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers para chamadas do frontend
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Health check
      if (path === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'mercado-previsoes-worker',
            timestamp: new Date().toISOString(),
            adapters_count: Object.keys(ADAPTER_REGISTRY).length,
          }),
          { headers: corsHeaders }
        );
      }

      // 2. Provedores de fontes de dados auditáveis
      if (path === '/api/sources' && request.method === 'GET') {
        const sources = [
          {
            name: 'YouTube Data API v3',
            slug: 'youtube',
            category: 'video',
            source_type: 'api',
            api_available: true,
            automated_resolution_supported: true,
            active: true,
          },
          {
            name: 'Spotify Web Charts',
            slug: 'spotify',
            category: 'musica',
            source_type: 'api',
            api_available: true,
            automated_resolution_supported: true,
            active: true,
          },
          {
            name: 'Google Trends BR',
            slug: 'google-trends',
            category: 'pesquisa',
            source_type: 'web',
            api_available: true,
            automated_resolution_supported: false,
            active: true,
          },
          {
            name: 'TikTok Creator Insights',
            slug: 'tiktok',
            category: 'video_curto',
            source_type: 'api',
            api_available: true,
            automated_resolution_supported: false,
            active: true,
          },
          {
            name: 'Instagram Graph API',
            slug: 'meta',
            category: 'social',
            source_type: 'api',
            api_available: true,
            automated_resolution_supported: false,
            active: true,
          },
          {
            name: 'Súmulas Oficiais de Eventos',
            slug: 'official-events',
            category: 'esportes',
            source_type: 'oficial',
            api_available: false,
            automated_resolution_supported: false,
            active: true,
          },
        ];
        return new Response(JSON.stringify({ data: sources }), { headers: corsHeaders });
      }

      // 3. Resolução de Mercado (Endpoint DEMO auditável)
      const resolveMatch = path.match(/^\/api\/markets\/([^/]+)\/resolve$/);
      if (resolveMatch && request.method === 'POST') {
        const marketId = resolveMatch[1];
        const body = (await request.json().catch(() => ({}))) as any;

        return new Response(
          JSON.stringify({
            success: true,
            message: `Mercado ${marketId} resolvido em modo auditável`,
            market_id: marketId,
            override_winner: body.winner_option_id,
            timestamp: new Date().toISOString(),
          }),
          { headers: corsHeaders }
        );
      }

      // 4. Compra de Posição
      const positionMatch = path.match(/^\/api\/markets\/([^/]+)\/positions$/);
      if (positionMatch && request.method === 'POST') {
        const marketId = positionMatch[1];
        const body = (await request.json().catch(() => ({}))) as any;
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Posição registrada com sucesso',
            market_id: marketId,
            credits_spent: body.credits_spent,
            units: body.units,
          }),
          { headers: corsHeaders }
        );
      }

      // 5. Venda de Posição
      const sellMatch = path.match(/^\/api\/markets\/([^/]+)\/sell$/);
      if (sellMatch && request.method === 'POST') {
        const marketId = sellMatch[1];
        const body = (await request.json().catch(() => ({}))) as any;
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Posição vendida com sucesso',
            market_id: marketId,
            credits_returned: body.credits_returned,
          }),
          { headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Endpoint não encontrado', path }),
        { status: 404, headers: corsHeaders }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: 'Erro interno no Worker', message: err.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
