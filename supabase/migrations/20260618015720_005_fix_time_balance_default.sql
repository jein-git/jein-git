-- time_balance 기본값을 10 → 0으로 변경 (신규 가입자는 0타임에서 시작)
ALTER TABLE public.profiles ALTER COLUMN time_balance SET DEFAULT 0;

-- 자동 프로필 생성 트리거도 0으로 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, time_balance, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    0,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;
