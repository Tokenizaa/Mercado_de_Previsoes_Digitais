-- ============================================================================
-- MERCADO DE PREVISÕES DIGITAIS - FASE 5.1: IDENTIDADE + PERFIL SOCIAL
-- Migração Canônica: Perfis Sociais, Restrições de Username, RLS e Storage
-- ============================================================================

-- 1. Ampliação da tabela prediction_profiles com campos sociais
ALTER TABLE public.prediction_profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- 2. Restrições e Validações de Username Canônicas:
-- Regras:
-- - Entre 3 e 20 caracteres
-- - Apenas letras, números e sublinhado (^[a-zA-Z0-9_]{3,20}$)
-- - Sem espaços
-- - Case-insensitive
-- - Usernames reservados bloqueados

-- Índice de unicidade case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS idx_prediction_profiles_username_lower 
  ON public.prediction_profiles (LOWER(username));

-- Constraint de formato de username
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_prediction_profiles_username_format'
  ) THEN
    ALTER TABLE public.prediction_profiles 
      ADD CONSTRAINT chk_prediction_profiles_username_format 
      CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');
  END IF;
END $$;

-- Constraint de usernames reservados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_prediction_profiles_reserved_usernames'
  ) THEN
    ALTER TABLE public.prediction_profiles 
      ADD CONSTRAINT chk_prediction_profiles_reserved_usernames 
      CHECK (LOWER(username) NOT IN (
        'admin', 'administrador', 'suporte', 'api', 'system', 'sistema', 
        'oficial', 'official', 'root', 'palpites', 'ajuda', 'mod', 'moderador'
      ));
  END IF;
END $$;

-- 3. Políticas de Segurança RLS Refinadas para a Fase 5.1
ALTER TABLE public.prediction_profiles ENABLE ROW LEVEL SECURITY;

-- Usuários e visitantes públicos podem visualizar perfis (dados sociais: nome, username, bio, avatar, created_at)
-- Obs: A política de leitura pública já foi criada na migração canônica inicial:
-- CREATE POLICY "prediction_profiles_public_read" ON public.prediction_profiles FOR SELECT USING (true);

-- Usuário autenticado pode inserir seu próprio perfil
DROP POLICY IF EXISTS "prediction_profiles_user_insert" ON public.prediction_profiles;
CREATE POLICY "prediction_profiles_user_insert" ON public.prediction_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR auth.role() = 'service_role'
  );

-- Usuário autenticado pode atualizar apenas o seu próprio perfil
DROP POLICY IF EXISTS "prediction_profiles_user_update" ON public.prediction_profiles;
CREATE POLICY "prediction_profiles_user_update" ON public.prediction_profiles
  FOR UPDATE USING (
    auth.uid() = id OR auth.role() = 'service_role'
  ) WITH CHECK (
    auth.uid() = id OR auth.role() = 'service_role'
  );

-- 4. Função e Trigger para proteger credits_balance de edições manuais no perfil pelo usuário comum
CREATE OR REPLACE FUNCTION public.prevent_profile_balance_tampering()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a alteração não for via service_role e o saldo de créditos tiver sido alterado pelo UPDATE de perfil comum
  IF (auth.role() != 'service_role' AND OLD.credits_balance IS DISTINCT FROM NEW.credits_balance) THEN
    -- Mantém o saldo anterior intacto (o saldo só pode ser alterado via Worker/Ledger)
    NEW.credits_balance := OLD.credits_balance;
  END IF;
  
  -- Se o papel (role) tiver sido alterado por usuário comum
  IF (auth.role() != 'service_role' AND OLD.role IS DISTINCT FROM NEW.role) THEN
    NEW.role := OLD.role;
  END IF;

  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_balance ON public.prediction_profiles;
CREATE TRIGGER trg_protect_profile_balance
  BEFORE UPDATE ON public.prediction_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_balance_tampering();

-- 5. Função e Trigger automática para criar perfil social no cadastro do Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  desired_username TEXT;
  clean_username TEXT;
  full_name TEXT;
BEGIN
  full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Participante');
  desired_username := COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8));
  
  -- Limpeza básica de username
  clean_username := regexp_replace(desired_username, '[^a-zA-Z0-9_]', '_', 'g');
  IF length(clean_username) < 3 THEN
    clean_username := clean_username || '_' || substr(NEW.id::text, 1, 4);
  END IF;
  clean_username := substr(clean_username, 1, 20);

  INSERT INTO public.prediction_profiles (
    id,
    name,
    username,
    avatar_url,
    bio,
    credits_balance,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    full_name,
    clean_username,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    10000, -- Saldo inicial de 10.000 créditos virtuais
    'USER',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO NOTHING;

  -- Registra no ledger o saldo inicial
  INSERT INTO public.prediction_credit_ledger (
    user_id,
    type,
    amount,
    balance_after,
    description,
    created_at
  ) VALUES (
    NEW.id,
    'INITIAL_BALANCE',
    10000,
    10000,
    'Saldo inicial de boas-vindas da plataforma de palpites',
    timezone('utc'::text, now())
  )
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparada na tabela auth.users (quando disponível no Supabase)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users'
  ) THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
  END IF;
END $$;

-- 6. Configuração do bucket de Storage de Avatares (se a extensão storage estiver instalada)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars', 
      'avatars', 
      true, 
      2097152, -- 2MB
      ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  END IF;
END $$;
