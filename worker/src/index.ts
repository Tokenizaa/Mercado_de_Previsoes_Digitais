/**
 * Cloudflare Worker API para o Mercado de Previsões Digitais
 * Integração Canônica com Supabase PostgreSQL (project_ref = qyjoegombkgkgbvcjvhu)
 * Namespace: prediction_*
 */

import {
  getSupabase,
  getAuthenticatedProfile,
  getMarketsFromSupabase,
  getMarketBySlugFromSupabase,
  getSourcesFromSupabase,
  createMarketInSupabase,
  buyPositionInSupabase,
  sellPositionInSupabase,
  resolveMarketInSupabase,
  getPortfolioFromSupabase,
  getProfileByUsernameFromSupabase,
  updateOwnProfileInSupabase,
} from './supabase';
import { ADAPTER_REGISTRY } from './adapters';

export interface Env {
  ENVIRONMENT?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const authHeader = request.headers.get('Authorization');

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

    const supabase = getSupabase(env, authHeader);

    try {
      // 1. Health check
      if (path === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'mercado-previsoes-worker',
            database: 'supabase-postgresql',
            project_ref: 'qyjoegombkgkgbvcjvhu',
            namespace: 'prediction_*',
            timestamp: new Date().toISOString(),
            adapters_count: Object.keys(ADAPTER_REGISTRY).length,
          }),
          { headers: corsHeaders }
        );
      }

      // 2. GET /api/sources - Provedores de fontes de dados auditáveis
      if (path === '/api/sources' && request.method === 'GET') {
        const sources = await getSourcesFromSupabase(supabase);
        return new Response(JSON.stringify({ data: sources }), { headers: corsHeaders });
      }

      // 3. GET /api/activity - Atividades públicas recentes
      if (path === '/api/activity' && request.method === 'GET') {
        const { data: activity } = await supabase
          .from('prediction_activity')
          .select('*, user:prediction_profiles(name, username), market:prediction_markets(title, slug)')
          .order('created_at', { ascending: false })
          .limit(30);

        return new Response(JSON.stringify({ data: activity || [] }), { headers: corsHeaders });
      }

      // 4. GET /api/portfolio - Portfólio do usuário autenticado no banco real
      if (path === '/api/portfolio' && request.method === 'GET') {
        const profile = await getAuthenticatedProfile(supabase, authHeader);
        const portfolio = await getPortfolioFromSupabase(supabase, profile.id);
        return new Response(JSON.stringify({ data: portfolio }), { headers: corsHeaders });
      }

      // 5. GET /api/profile/:username - Perfil público
      const profileMatch = path.match(/^\/api\/profile\/([^/]+)$/);
      if (profileMatch && request.method === 'GET') {
        const username = decodeURIComponent(profileMatch[1]);
        const profile = await getProfileByUsernameFromSupabase(supabase, username);
        if (!profile) return new Response(JSON.stringify({ error: 'Perfil não encontrado' }), { status: 404, headers: corsHeaders });
        return new Response(JSON.stringify({ data: profile }), { headers: corsHeaders });
      }

      // 6. PATCH /api/profile - Perfil do usuário autenticado
      if (path === '/api/profile' && request.method === 'PATCH') {
        const profile = await getAuthenticatedProfile(supabase, authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'Autenticação obrigatória' }), { status: 401, headers: corsHeaders });
        const body = (await request.json().catch(() => ({}))) as any;
        const result = await updateOwnProfileInSupabase(supabase, profile.id, {
          display_name: body.display_name,
          bio: body.bio,
          username: body.username,
          avatar_url: body.avatar_url,
        });
        if (!result.success) return new Response(JSON.stringify({ error: result.error }), { status: 400, headers: corsHeaders });
        return new Response(JSON.stringify({ success: true, data: result.profile }), { headers: corsHeaders });
      }

      // 5. GET /api/markets - Lista de mercados publicáveis
      if (path === '/api/markets' && request.method === 'GET') {
        const markets = await getMarketsFromSupabase(supabase);
        return new Response(JSON.stringify({ data: markets }), { headers: corsHeaders });
      }

      // 6. GET /api/markets/:slug - Detalhes do mercado
      const slugMatch = path.match(/^\/api\/markets\/([^/]+)$/);
      if (slugMatch && request.method === 'GET') {
        const slug = slugMatch[1];
        const market = await getMarketBySlugFromSupabase(supabase, slug);
        if (!market) {
          return new Response(
            JSON.stringify({ error: 'Mercado não encontrado', slug }),
            { status: 404, headers: corsHeaders }
          );
        }
        return new Response(JSON.stringify({ data: market }), { headers: corsHeaders });
      }

      // 7. POST /api/markets - Criação de novo mercado
      if (path === '/api/markets' && request.method === 'POST') {
        const body = (await request.json().catch(() => ({}))) as any;

        // Validações estritas
        if (!body.title || body.title.trim().length < 10) {
          return new Response(
            JSON.stringify({ error: 'Título deve possuir pelo menos 10 caracteres' }),
            { status: 400, headers: corsHeaders }
          );
        }
        if (!body.source_url || !body.resolution_rule || !body.source_identifier) {
          return new Response(
            JSON.stringify({ error: 'Auditabilidade obrigatória: informe fonte, URL e regra de resolução' }),
            { status: 400, headers: corsHeaders }
          );
        }
        if (!body.options || !Array.isArray(body.options) || body.options.length < 2) {
          return new Response(
            JSON.stringify({ error: 'Defina pelo menos duas opções para o mercado' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const profile = await getAuthenticatedProfile(supabase, authHeader);
        const result = await createMarketInSupabase(supabase, body, profile.id);

        if (!result.success) {
          return new Response(
            JSON.stringify({ error: result.error || 'Falha ao criar mercado' }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data: result.market }),
          { status: 201, headers: corsHeaders }
        );
      }

      // 8. POST /api/markets/:id/positions - Compra de posição consistente com Ledger
      const positionMatch = path.match(/^\/api\/markets\/([^/]+)\/positions$/);
      if (positionMatch && request.method === 'POST') {
        const marketId = positionMatch[1];
        const body = (await request.json().catch(() => ({}))) as any;
        const profile = await getAuthenticatedProfile(supabase, authHeader);

        const result = await buyPositionInSupabase(
          supabase,
          profile.id,
          marketId,
          body.option_id,
          Number(body.credits_spent)
        );

        if (!result.success) {
          return new Response(
            JSON.stringify({ error: result.error }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Posição registrada e persistida no Supabase',
            data: result.position,
          }),
          { status: 201, headers: corsHeaders }
        );
      }

      // 9. POST /api/markets/:id/sell - Venda/Liquidação de posição
      const sellMatch = path.match(/^\/api\/markets\/([^/]+)\/sell$/);
      if (sellMatch && request.method === 'POST') {
        const body = (await request.json().catch(() => ({}))) as any;
        const profile = await getAuthenticatedProfile(supabase, authHeader);

        const result = await sellPositionInSupabase(
          supabase,
          profile.id,
          body.position_id,
          body.units ? Number(body.units) : undefined
        );

        if (!result.success) {
          return new Response(
            JSON.stringify({ error: result.error }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Posição liquidada com sucesso',
            credits_returned: result.creditsReturned,
          }),
          { headers: corsHeaders }
        );
      }

      // 10. POST /api/markets/:id/resolve - Resolução real e auditável de mercado
      // NUNCA aceita simplesmente winner enviado pelo cliente.
      const resolveMatch = path.match(/^\/api\/markets\/([^/]+)\/resolve$/);
      if (resolveMatch && request.method === 'POST') {
        const marketId = resolveMatch[1];
        const result = await resolveMarketInSupabase(supabase, marketId);

        if (!result.success) {
          return new Response(
            JSON.stringify({ error: result.error }),
            { status: 400, headers: corsHeaders }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Mercado ${marketId} resolvido determinísticamente com registro de evidência`,
            data: result.resolutionLog,
          }),
          { headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Endpoint não encontrado', path }),
        { status: 404, headers: corsHeaders }
      );
    } catch (err: any) {
      console.error('[Worker Exception]:', err);
      return new Response(
        JSON.stringify({ error: 'Erro interno no Worker', message: err.message }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
