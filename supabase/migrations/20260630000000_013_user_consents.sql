/*
  # user_consents 테이블 생성

  약관 동의 이력을 별도 테이블로 관리.
  user_id 기준 upsert 지원을 위해 UNIQUE 제약 설정.
*/

CREATE TABLE IF NOT EXISTS public.user_consents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_agreed     boolean NOT NULL DEFAULT false,
  privacy_agreed   boolean NOT NULL DEFAULT false,
  marketing_agreed boolean NOT NULL DEFAULT false,
  terms_version    text,
  privacy_version  text,
  marketing_version text,
  agreed_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_consents_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회 가능
CREATE POLICY "user_consents_select_own"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- 본인 데이터만 삽입 가능
CREATE POLICY "user_consents_insert_own"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인 데이터만 수정 가능
CREATE POLICY "user_consents_update_own"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id);
