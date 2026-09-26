-- ============================================================================
-- MERCADO DE PREVISÕES DIGITAIS - MIGRATION CANÔNICA (NAMESPACE: prediction_*)
-- Banco: Supabase PostgreSQL (project_ref = qyjoegombkgkgbvcjvhu)
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PREDICTION_PROFILES (Perfis de usuários atrelados ao auth.users ou UUID standalone)
CREATE TABLE IF NOT EXISTS public.prediction_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    credits_balance BIGINT NOT NULL DEFAULT 10000 CHECK (credits_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PREDICTION_SOURCE_PROVIDERS (Catálogo de fontes de dados auditáveis)
CREATE TABLE IF NOT EXISTS public.prediction_source_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    source_type TEXT NOT NULL,
    api_available BOOLEAN NOT NULL DEFAULT true,
    automated_resolution_supported BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PREDICTION_MARKETS (Mercados de previsão pública com fontes auditáveis)
CREATE TABLE IF NOT EXISTS public.prediction_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('internet_creators', 'esportes', 'musica', 'entretenimento')),
    market_type TEXT NOT NULL CHECK (market_type IN ('RESULTADO', 'RANKING', 'METRICA', 'LIMIAR')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'AWAITING_RESULT', 'RESULT_FOUND', 'RESOLVED', 'DISTRIBUTED')),
    creator_id UUID REFERENCES public.prediction_profiles(id) ON DELETE SET NULL,
    close_at TIMESTAMPTZ NOT NULL,
    resolution_at TIMESTAMPTZ,
    resolution_rule TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_provider_id UUID REFERENCES public.prediction_source_providers(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    source_identifier TEXT NOT NULL,
    image_url TEXT,
    total_pool BIGINT NOT NULL DEFAULT 0 CHECK (total_pool >= 0),
    featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PREDICTION_MARKET_OPTIONS (Opções de previsão de cada mercado)
CREATE TABLE IF NOT EXISTS public.prediction_market_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    slug TEXT NOT NULL,
    current_probability NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    total_position BIGINT NOT NULL DEFAULT 0 CHECK (total_position >= 0),
    result TEXT DEFAULT NULL CHECK (result IN (NULL, 'WINNER', 'LOSER', 'VOID')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(market_id, slug)
);

-- 5. PREDICTION_POSITIONS (Posições assumidas pelos usuários em Créditos)
CREATE TABLE IF NOT EXISTS public.prediction_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.prediction_profiles(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.prediction_market_options(id) ON DELETE CASCADE,
    credits_spent BIGINT NOT NULL CHECK (credits_spent > 0),
    units NUMERIC(12, 4) NOT NULL CHECK (units > 0),
    average_price NUMERIC(8, 4) NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'WON', 'LOST', 'REFUNDED')),
    credits_payout BIGINT DEFAULT 0 CHECK (credits_payout >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PREDICTION_ACTIVITY (Feed de atividades públicas nos mercados)
CREATE TABLE IF NOT EXISTS public.prediction_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.prediction_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'RESOLVE', 'DISTRIBUTE')),
    option_id UUID REFERENCES public.prediction_market_options(id) ON DELETE SET NULL,
    credits BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. PREDICTION_RESOLUTION_LOGS (Auditabilidade e evidência de resolução)
CREATE TABLE IF NOT EXISTS public.prediction_resolution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    observed_result TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'DISPUTED')),
    evidence TEXT NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PREDICTION_CREATOR_MARKETS (Metadados dos planos de criadores e contratos)
CREATE TABLE IF NOT EXISTS public.prediction_creator_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.prediction_markets(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.prediction_profiles(id) ON DELETE CASCADE,
    creation_plan TEXT NOT NULL CHECK (creation_plan IN ('pequeno', 'medio', 'grande', 'maior')),
    contract_capacity INTEGER NOT NULL CHECK (contract_capacity > 0),
    creator_reward BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. PREDICTION_CREDIT_LEDGER (Livro-razão financeiro oficial de Créditos)
CREATE TABLE IF NOT EXISTS public.prediction_credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.prediction_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('INITIAL_BALANCE', 'BUY', 'SELL', 'WINNINGS', 'CREATOR_REWARD', 'PLATFORM_COST', 'REFUND', 'ADJUSTMENT')),
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL CHECK (balance_after >= 0),
    market_id UUID REFERENCES public.prediction_markets(id) ON DELETE SET NULL,
    position_id UUID REFERENCES public.prediction_positions(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_prediction_markets_slug ON public.prediction_markets(slug);
CREATE INDEX IF NOT EXISTS idx_prediction_markets_status ON public.prediction_markets(status);
CREATE INDEX IF NOT EXISTS idx_prediction_markets_category ON public.prediction_markets(category);
CREATE INDEX IF NOT EXISTS idx_prediction_markets_close_at ON public.prediction_markets(close_at);
CREATE INDEX IF NOT EXISTS idx_prediction_options_market ON public.prediction_market_options(market_id);
CREATE INDEX IF NOT EXISTS idx_prediction_positions_user ON public.prediction_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_positions_market ON public.prediction_positions(market_id);
CREATE INDEX IF NOT EXISTS idx_prediction_activity_market ON public.prediction_activity(market_id);
CREATE INDEX IF NOT EXISTS idx_prediction_ledger_user ON public.prediction_credit_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_prediction_resolution_market ON public.prediction_resolution_logs(market_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.prediction_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_source_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_market_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_resolution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_creator_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_credit_ledger ENABLE ROW LEVEL SECURITY;

-- POLICIES PÚBLICAS DE LEITURA (Navegação pública)
CREATE POLICY "prediction_profiles_public_read" ON public.prediction_profiles FOR SELECT USING (true);
CREATE POLICY "prediction_source_providers_public_read" ON public.prediction_source_providers FOR SELECT USING (true);
CREATE POLICY "prediction_markets_public_read" ON public.prediction_markets FOR SELECT USING (true);
CREATE POLICY "prediction_options_public_read" ON public.prediction_market_options FOR SELECT USING (true);
CREATE POLICY "prediction_activity_public_read" ON public.prediction_activity FOR SELECT USING (true);
CREATE POLICY "prediction_resolution_logs_public_read" ON public.prediction_resolution_logs FOR SELECT USING (true);
CREATE POLICY "prediction_creator_markets_public_read" ON public.prediction_creator_markets FOR SELECT USING (true);

-- POLICIES DE POSIÇÕES (Apenas o próprio usuário acessa suas posições)
CREATE POLICY "prediction_positions_user_select" ON public.prediction_positions
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "prediction_positions_user_insert" ON public.prediction_positions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "prediction_positions_user_update" ON public.prediction_positions
    FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- POLICIES DO LIVRO-RAZÃO (LEDGER)
CREATE POLICY "prediction_ledger_user_select" ON public.prediction_credit_ledger
    FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- POLICIES DE CRIAÇÃO DE MERCADOS
CREATE POLICY "prediction_markets_creator_insert" ON public.prediction_markets
    FOR INSERT WITH CHECK (auth.uid() = creator_id OR auth.role() = 'service_role');

-- ============================================================================
-- SEED DATA INICIAL: PROVEDORES DE FONTES AUDITÁVEIS
-- ============================================================================
INSERT INTO public.prediction_source_providers (name, slug, category, source_type, api_available, automated_resolution_supported, active, description)
VALUES
('YouTube Data API v3', 'youtube', 'video', 'api', true, true, true, 'Leitura objetiva de viewCount, likeCount e contagem pública de inscritos.'),
('Spotify Web Charts', 'spotify', 'musica', 'api', true, true, true, 'Paradas diárias e semanais oficiais publicadas em charts.spotify.com.'),
('Google Trends BR', 'google-trends', 'pesquisa', 'web', true, false, true, 'Índice de interesse relativo (0 a 100) no território Brasil em janela de 7 dias.'),
('TikTok Creator Portal', 'tiktok', 'video_curto', 'api', true, false, true, 'Contagem pública de vídeos gerados com áudio ou hashtag oficial.'),
('Instagram Graph API', 'meta', 'social', 'api', true, false, true, 'Métricas públicas auditadas de perfis de criadores de conteúdo.'),
('Súmulas Oficiais de Eventos', 'official-events', 'esportes', 'oficial', false, false, true, 'Súmula oficial esportiva e declaração oficial de juízes e organizações.'),
('CazéTV Transmissão Oficial', 'cazetv', 'streaming', 'oficial', true, false, true, 'Pico e contagem de aparelhos conectados auditados na transmissão.')
ON CONFLICT (slug) DO NOTHING;
