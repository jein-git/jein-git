-- ============================================================
-- 1. profiles.time_balance: integer → numeric(6,1)
--    (0.5타임 단위 적립·차감을 정확하게 저장하기 위해 타입 변경)
-- ============================================================
ALTER TABLE public.profiles
  ALTER COLUMN time_balance TYPE numeric(6,1)
  USING time_balance::numeric(6,1);

ALTER TABLE public.profiles
  ALTER COLUMN time_balance SET DEFAULT 0;


-- ============================================================
-- 2. time_transactions 테이블: 개별 시간 적립·차감 내역
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_transactions (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  care_match_id  uuid         REFERENCES public.care_matches(id) ON DELETE SET NULL,
  type           text         NOT NULL CHECK (type IN ('earn', 'spend')),
  amount         numeric(4,1) NOT NULL,       -- 항상 양수; type으로 적립·차감 방향 구분
  balance_after  numeric(6,1) NOT NULL,       -- 거래 직후 잔액
  description    text         DEFAULT '',
  created_at     timestamptz  DEFAULT now()
);

ALTER TABLE public.time_transactions ENABLE ROW LEVEL SECURITY;

-- 본인 거래 내역만 SELECT 가능
CREATE POLICY "time_transactions_select"
  ON public.time_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT는 SECURITY DEFINER 함수에서만 처리 (클라이언트 직접 삽입 차단)

-- 인덱스: 조회 성능
CREATE INDEX IF NOT EXISTS idx_time_tx_user    ON public.time_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tx_match   ON public.time_transactions(care_match_id);
CREATE INDEX IF NOT EXISTS idx_time_tx_created ON public.time_transactions(created_at DESC);


-- ============================================================
-- 3. complete_care_match_with_time: 완료 처리 + 시간 적립·차감
--    기존 fn_complete_care_match를 대체하는 통합 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.complete_care_match_with_time(p_match_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match             care_matches;
  v_request           care_requests;
  v_current_user_id   uuid;
  v_provider_balance  numeric(6,1);
  v_requester_balance numeric(6,1);
BEGIN
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '로그인이 필요합니다.');
  END IF;

  -- FOR UPDATE로 행 잠금: 동시 중복 완료 처리 방지
  SELECT * INTO v_match
  FROM care_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '매칭을 찾을 수 없습니다.');
  END IF;

  -- 권한 확인: 요청자 또는 제공자만 완료 처리 가능
  IF v_match.provider_id != v_current_user_id AND v_match.requester_id != v_current_user_id THEN
    RETURN json_build_object('success', false, 'error', '이 도움을 완료 처리할 권한이 없습니다.');
  END IF;

  -- 이미 완료된 매칭
  IF v_match.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', '이미 완료된 도움입니다.');
  END IF;

  -- 취소 또는 기타 비정상 상태
  IF v_match.status != 'matched' THEN
    RETURN json_build_object('success', false, 'error', '완료 처리할 수 없는 상태입니다.');
  END IF;

  -- 연결된 care_requests에서 시간·제목 정보 조회
  SELECT * INTO v_request FROM care_requests WHERE id = v_match.request_id;

  -- ── 매칭 완료 상태 업데이트 ─────────────────────────────
  UPDATE care_matches
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = p_match_id;

  UPDATE care_requests
  SET status = 'completed', updated_at = now()
  WHERE id = v_match.request_id;

  -- ── 제공자(provider): 시간 적립 ──────────────────────────
  UPDATE profiles
  SET time_balance = time_balance + v_request.requested_hours,
      updated_at   = now()
  WHERE id = v_match.provider_id
  RETURNING time_balance INTO v_provider_balance;

  INSERT INTO time_transactions (user_id, care_match_id, type, amount, balance_after, description)
  VALUES (
    v_match.provider_id,
    p_match_id,
    'earn',
    v_request.requested_hours,
    v_provider_balance,
    COALESCE(v_request.title, '도움 활동') || ' - 도움 제공'
  );

  -- ── 요청자(requester): 시간 차감 ──────────────────────────
  UPDATE profiles
  SET time_balance = time_balance - v_request.requested_hours,
      updated_at   = now()
  WHERE id = v_match.requester_id
  RETURNING time_balance INTO v_requester_balance;

  INSERT INTO time_transactions (user_id, care_match_id, type, amount, balance_after, description)
  VALUES (
    v_match.requester_id,
    p_match_id,
    'spend',
    v_request.requested_hours,
    v_requester_balance,
    COALESCE(v_request.title, '도움 활동') || ' - 도움 받음'
  );

  RETURN json_build_object('success', true);
END;
$$;
