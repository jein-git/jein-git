-- profiles.role UPDATE 정책 추가:
-- 현재 UPDATE 정책은 자신의 행만 수정 가능하게 하지만,
-- 어떤 컬럼이든 변경 가능하므로 role 자가 승격이 가능함.
-- 안전을 위해 role 변경은 admin 또는 service_role만 허용하는 별도 정책이 필요하지만,
-- 여기서는 서비스 초기 운영을 위해 직접 SQL로 관리자 계정을 지정함.
-- 실제 운영 환경에서는 Supabase Dashboard > Table Editor에서 직접 수정 권장.

-- 현재 등록된 첫 번째 계정을 admin으로 설정
-- (계정이 여러 개일 때는 아래 WHERE 조건을 이름이나 이메일로 특정해야 함)
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<특정 UUID>';

-- ※ 이 마이그레이션은 실제 UUID를 특정하지 않으므로
--    Supabase Dashboard에서 직접 role을 'admin'으로 변경해야 합니다.
--    대신 UPDATE 정책을 role 컬럼 보호용으로 강화합니다.

-- role 컬럼에 대한 직접 변경을 막기 위해 기존 UPDATE 정책을 교체
-- (일반 사용자는 role을 스스로 변경할 수 없게 함)
DROP POLICY IF EXISTS "사용자는 자신의 프로필을 수정할 수 있음" ON public.profiles;

CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있음"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- role 컬럼은 현재 DB 값과 동일하게만 허용 (자가 승격 방지)
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
