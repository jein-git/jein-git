/*
  # 자동 프로필 생성 트리거

  1. 새 함수
    - `handle_new_user` - 새 사용자 등록 시 자동으로 profiles 테이블에 레코드 생성
  
  2. 트리거
    - auth.users 테이블에 INSERT 후 실행
    - 프로필 자동 생성 (기본 시간 잔액: 10시간)

  3. 중요 사항
    - 이메일에서 이름 추출 (첫 부분)
    - 회원가입 시 자동으로 프로필이 생성됨
*/

-- Function to handle new user creation
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
    10,
    now(),
    now()
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();