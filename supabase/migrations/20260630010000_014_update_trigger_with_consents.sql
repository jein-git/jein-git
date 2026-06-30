/*
  # handle_new_user 트리거 업데이트

  기존 트리거에서 name, time_balance만 저장하던 것을
  phone, address, terms 필드 포함 저장으로 확장.

  email 회원가입 시 options.data에 약관 동의 정보를 담아 signUp을 호출하면
  이 트리거가 profiles + user_consents 양쪽에 자동 저장.
  Google OAuth 등 약관 데이터가 없는 경우 terms_agreed = false로 저장.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_terms_agreed    boolean;
  v_privacy_agreed  boolean;
  v_marketing_agreed boolean;
BEGIN
  v_terms_agreed     := COALESCE((NEW.raw_user_meta_data->>'terms_agreed')::boolean,  false);
  v_privacy_agreed   := COALESCE((NEW.raw_user_meta_data->>'privacy_agreed')::boolean, false);
  v_marketing_agreed := COALESCE((NEW.raw_user_meta_data->>'marketing_agreed')::boolean, false);

  INSERT INTO public.profiles (
    id, name, phone, address, time_balance,
    terms_agreed, privacy_agreed, marketing_agreed, agreed_at,
    created_at, updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'address', ''),
    10,
    v_terms_agreed,
    v_privacy_agreed,
    v_marketing_agreed,
    CASE WHEN v_terms_agreed THEN now() ELSE NULL END,
    now(),
    now()
  );

  -- 약관 동의한 경우 user_consents에도 저장
  IF v_terms_agreed THEN
    INSERT INTO public.user_consents (
      user_id,
      terms_agreed,
      privacy_agreed,
      marketing_agreed,
      terms_version,
      privacy_version,
      marketing_version,
      agreed_at
    )
    VALUES (
      NEW.id,
      true,
      v_privacy_agreed,
      v_marketing_agreed,
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'terms_version',    ''), ''),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'privacy_version',  ''), ''),
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'marketing_version',''), ''),
      now()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
