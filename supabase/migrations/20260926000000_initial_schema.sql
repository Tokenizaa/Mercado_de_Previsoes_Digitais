-- ============================================================================
-- MERCADO DE PREVISÕES DIGITAIS - MIGRATION INICIAL SUPABASE POSTGRESQL
-- ============================================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    credits_balance BIGINT NOT NULL DEFAULT 10000 CHECK (credits_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. SOURCE_PROVIDERS (Catálogo de fontes auditáveis)
CREATE TABLE IF NOT EXISTS public.source_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    source_type TEXT NOT NULL,
    api_available BOOLEAN NOT NULL DEFAULT true,
    automated_resolution_supported BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. MARKETS
CREATE TABLE IF NOT EXISTS public.markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('internet_creators', 'esportes', 'musica', 'entretenimento')),
    market_type TEXT NOT NULL CHECK (market_type IN ('RESULTADO', 'RANKING', 'METRICA', 'LIMIAR')),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'AWAITING_RESULT', 'RESULT_FOUND', 'RESOLVED', 'DISTRIBUTED')),
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    close_at TIMESTAMPTZ NOT NULL,
    resolution_at TIMESTAMPTZ,
    resolution_rule TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    source_identifier TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MARKET_OPTIONS
CREATE TABLE IF NOT EXISTS public.market_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    slug TEXT NOT NULL,
    current_probability NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    total_position BIGINT NOT NULL DEFAULT 0,
    result TEXT DEFAULT NULL CHECK (result IN (NULL, 'WINNER', 'LOSER', 'VOID')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(market_id, slug)
);

-- 5. POSITIONS
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.market_options(id) ON DELETE CASCADE,
    credits_spent BIGINT NOT NULL CHECK (credits_spent > 0),
    units NUMERIC(10, 4) NOT NULL CHECK (units > 0),
    average_price NUMERIC(6, 4) NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'WON', 'LOST', 'REFUNDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. MARKET_ACTIVITY
CREATE TABLE IF NOT EXISTS public.market_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL', 'RESOLVE', 'DISTRIBUTE')),
    option_id UUID REFERENCES public.market_options(id) ON DELETE SET NULL,
    credits BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. MARKET_RESOLUTION_LOGS (Auditabilidade de evidência)
CREATE TABLE IF NOT EXISTS public.market_resolution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    observed_result TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'DISPUTED')),
    evidence TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. CREATOR_MARKETS
CREATE TABLE IF NOT EXISTS public.creator_markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES public.markets(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    creation_plan TEXT NOT NULL CHECK (creation_plan IN ('pequeno', 'medio', 'grande', 'maior')),
    contract_capacity INTEGER NOT NULL CHECK (contract_capacity > 0),
    creator_reward BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_resolution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_markets ENABLE ROW LEVEL SECURITY;

-- POLICIES PÚBLICAS DE LEITURA (Navegação pública sem obrigar login)
CREATE POLICY "Leitura pública de usuários" ON public.users FOR SELECT USING (true);
CREATE POLICY "Leitura pública de provedores de fontes" ON public.source_providers FOR SELECT USING (true);
CREATE POLICY "Leitura pública de mercados" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Leitura pública de opções" ON public.market_options FOR SELECT USING (true);
CREATE POLICY "Leitura pública de atividades" ON public.market_activity FOR SELECT USING (true);
CREATE POLICY "Leitura pública de evidências de resolução" ON public.market_resolution_logs FOR SELECT USING (true);
CREATE POLICY "Leitura pública de planos de criadores" ON public.creator_markets FOR SELECT USING (true);

-- POLICIES DE POSIÇÕES (Apenas o próprio usuário pode ver e criar posições)
CREATE POLICY "Usuário consulta suas próprias posições" ON public.positions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário autenticado cria posições" ON public.positions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário autenticado atualiza suas posições" ON public.positions
    FOR UPDATE USING (auth.uid() = user_id);

-- POLICIES DE MERCADOS CRIADOS POR USUÁRIOS
CREATE POLICY "Criador autenticado insere mercado" ON public.markets
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- ============================================================================
-- SEED DATA INICIAL
-- ============================================================================

-- Provedores de fontes
INSERT INTO public.source_providers (name, slug, category, source_type, api_available, automated_resolution_supported, active) VALUES
('YouTube Data API', 'youtube', 'video', 'api', true, true, true),
('Spotify Web Charts', 'spotify', 'musica', 'api', true, true, true),
('Google Trends BR', 'google-trends', 'pesquisa', 'web', true, false, true),
('TikTok Creator Portal', 'tiktok', 'video_curto', 'api', true, false, true),
('Instagram Graph API', 'meta', 'social', 'api', true, false, true),
('Fight Music Show Oficial', 'official-fms', 'esportes', 'oficial', false, false, true),
('CazéTV Transmissão Oficial', 'cazetv', 'streaming', 'oficial', true, false, true)
ON CONFLICT (slug) DO NOTHING;
