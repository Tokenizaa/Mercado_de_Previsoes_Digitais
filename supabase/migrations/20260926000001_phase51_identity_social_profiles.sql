-- ============================================================================
-- MERCADO DE PREVISÕES DIGITAIS - FASE 5.1
-- IDENTIDADE + PERFIL SOCIAL
-- Migração canônica: supabase/migrations
-- ============================================================================

-- 1. Campos sociais e papel do perfil.
ALTER TABLE public.prediction_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'USER';

-- Não permitir que usuários comuns se promovam a ADMIN/MODERATOR.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_prediction_profiles_role'
  ) THEN
    ALTER TABLE public.prediction_profiles
      ADD CONSTRAINT chk_prediction_profiles_role
      CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));
  END IF;
END $$;

-- 2. Username canônico.
-- Regras públicas: 3-20 caracteres, letras/números/underscore, case-insensitive.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_prediction_profiles_username_format'
  ) THEN
    ALTER TABLE public.prediction_profiles
      ADD CONSTRAINT chk_prediction_profiles_username_format
      CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_prediction_profiles_reserved_usernames'
  ) THEN
    ALTER TABLE public.prediction_profiles
      ADD CONSTRAINT chk_prediction_profiles_reserved_usernames
      CHECK (
        LOWER(username) NOT IN (
          'admin', 'administrador', 'suporte', 'api', 'system', 'sistema',
          'oficial', 'official', 'root', 'palpites', 'ajuda', 'mod',
          'moderador', 'login', 'cadastro', 'perfil', 'meus-palpites'
        )
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_prediction_profiles_username_lower
  ON public.prediction_profiles (LOWER(username));

-- 3. RLS de perfil.
ALTER TABLE public.prediction_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prediction_profiles_public_read" ON public.prediction_profiles;
CREATE POLICY "prediction_profiles_public_read"
  ON public.prediction_profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "prediction_profiles_user_insert" ON public.prediction_profiles;
CREATE POLICY "prediction_profiles_user_insert"
  ON public.prediction_profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR auth.role() = 'service_role'
  );

DROP POLICY IF EXISTS "prediction_profiles_user_update" ON public.prediction_profiles;
CREATE POLICY "prediction_profiles_user_update"
  ON public.prediction_profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid() = id OR auth.role() = 'service_role'
  );

-- 4. Proteção de saldo e role.
-- O saldo continua sendo controlado pelo fluxo server-side/Ledger.
-- O usuário pode editar apenas os campos do próprio perfil, nunca credits_balance/role.
CREATE OR REPLACE FUNCTION public.prevent_profile_balance_tampering()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    NEW.credits_balance := OLD.credits_balance;
    NEW.role := OLD.role;
  END IF;

  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_balance
  ON public.prediction_profiles;

CREATE TRIGGER trg_protect_profile_balance
  BEFORE UPDATE ON public.prediction_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_balance_tampering();

-- 5. Criação automática do perfil quando um usuário nasce no Supabase Auth.
-- Username informado pelo cadastro é preservado quando válido e disponível.
-- Caso contrário, gera-se um username determinístico baseado no UUID.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  desired_username TEXT;
  clean_username TEXT;
  full_name TEXT;
  candidate TEXT;
  suffix TEXT;
  attempt INTEGER := 0;
BEGIN
  full_name := LEFT(
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
      'Participante'
    ),
    120
  );

  desired_username := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    'user_' || substr(NEW.id::text, 1, 8)
  );

  clean_username := LOWER(
    regexp_replace(desired_username, '[^a-zA-Z0-9_]', '_', 'g')
  );

  clean_username := regexp_replace(clean_username, '_+', '_', 'g');
  clean_username := trim(both '_' from clean_username);

  IF length(clean_username) < 3 THEN
    clean_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  clean_username := LEFT(clean_username, 20);

  -- Evita nomes reservados e colisões sem falhar o cadastro.
  candidate := clean_username;
  suffix := substr(replace(NEW.id::text, '-', ''), 1, 6);

  WHILE EXISTS (
    SELECT 1
    FROM public.prediction_profiles p
    WHERE LOWER(p.username) = LOWER(candidate)
  )
  OR LOWER(candidate) IN (
    'admin', 'administrador', 'suporte', 'api', 'system', 'sistema',
    'oficial', 'official', 'root', 'palpites', 'ajuda', 'mod',
    'moderador', 'login', 'cadastro', 'perfil', 'meus-palpites'
  )
  LOOP
    attempt := attempt + 1;
    candidate := LEFT(clean_username, 13) || '_' || suffix || attempt::text;

    IF length(candidate) > 20 THEN
      candidate := LEFT(candidate, 20);
    END IF;

    IF attempt > 20 THEN
      candidate := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 16);
      EXIT;
    END IF;
  END LOOP;

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
  )
  VALUES (
    NEW.id,
    full_name,
    candidate,
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    10000,
    'USER',
    timezone('utc', now()),
    timezone('utc', now())
  )
  ON CONFLICT (id) DO NOTHING;

  -- O saldo inicial é registrado uma única vez.
  INSERT INTO public.prediction_credit_ledger (
    user_id,
    type,
    amount,
    balance_after,
    description,
    created_at
  )
  SELECT
    NEW.id,
    'INITIAL_BALANCE',
    10000,
    10000,
    'Saldo inicial de boas-vindas da plataforma de palpites',
    timezone('utc', now())
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.prediction_credit_ledger l
    WHERE l.user_id = NEW.id
      AND l.type = 'INITIAL_BALANCE'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- 6. Storage de avatares.
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

-- Arquivos ficam em <user_id>/<arquivo>.
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
CREATE POLICY "avatars_user_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
