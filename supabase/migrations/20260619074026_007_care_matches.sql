-- ============================================================
-- care_matches 테이블: 도움 요청 수락 매칭 정보 저장
-- ============================================================
CREATE TABLE IF NOT EXISTS public.care_matches (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid        NOT NULL REFERENCES public.care_requests(id) ON DELETE CASCADE,
  requester_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        text        NOT NULL DEFAULT 'matched',
  completed_at  timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT care_matches_status_check CHECK (status IN ('matched', 'completed', 'cancelled'))
);

ALTER TABLE public.care_matches ENABLE ROW LEVEL SECURITY;

-- 요청자 또는 제공자만 자신의 매칭 조회 가능
CREATE POLICY "care_matches_select"
  ON public.care_matches FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id OR auth.uid() = requester_id);

-- INSERT/UPDATE는 아래 SECURITY DEFINER 함수에서만 처리
-- (별도 정책 없음 → 클라이언트 직접 삽입·수정 차단)

-- 성능용 인덱스
CREATE INDEX IF NOT EXISTS idx_care_matches_provider   ON public.care_matches(provider_id);
CREATE INDEX IF NOT EXISTS idx_care_matches_requester  ON public.care_matches(requester_id);
CREATE INDEX IF NOT EXISTS idx_care_matches_request    ON public.care_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_care_matches_status     ON public.care_matches(status);


-- ============================================================
-- RPC: 도움 요청 수락 (원자적 처리, 동시 중복 방지)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_accept_care_request(p_request_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request         care_requests;
  v_match_id        uuid;
  v_current_user_id uuid;
BEGIN
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '로그인이 필요합니다.');
  END IF;

  -- FOR UPDATE로 행 잠금: 동시에 두 명이 같은 요청을 수락하는 상황 방지
  SELECT * INTO v_request
  FROM care_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '요청을 찾을 수 없습니다.');
  END IF;

  -- 이미 매칭/완료된 요청은 수락 불가
  IF v_request.status != 'open' THEN
    RETURN json_build_object('success', false, 'error', '이미 매칭되었거나 완료된 요청입니다.');
  END IF;

  -- 본인이 등록한 요청은 본인이 수락 불가
  IF v_request.requester_id = v_current_user_id THEN
    RETURN json_build_object('success', false, 'error', '본인의 요청은 수락할 수 없습니다.');
  END IF;

  -- 동일 사용자 중복 수락 방지
  IF EXISTS (
    SELECT 1 FROM care_matches
    WHERE request_id = p_request_id AND provider_id = v_current_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', '이미 수락한 요청입니다.');
  END IF;

  -- 매칭 데이터 생성
  INSERT INTO care_matches (request_id, requester_id, provider_id, status)
  VALUES (p_request_id, v_request.requester_id, v_current_user_id, 'matched')
  RETURNING id INTO v_match_id;

  -- 요청 상태를 matched로 변경
  UPDATE care_requests
  SET status = 'matched', updated_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object('success', true, 'match_id', v_match_id);
END;
$$;


-- ============================================================
-- RPC: 도움 활동 완료 처리
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_complete_care_match(p_match_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match           care_matches;
  v_current_user_id uuid;
BEGIN
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '로그인이 필요합니다.');
  END IF;

  SELECT * INTO v_match
  FROM care_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '매칭을 찾을 수 없습니다.');
  END IF;

  -- 요청자 또는 제공자만 완료 처리 가능
  IF v_match.provider_id != v_current_user_id AND v_match.requester_id != v_current_user_id THEN
    RETURN json_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 이미 완료/취소된 매칭은 처리 불가
  IF v_match.status != 'matched' THEN
    RETURN json_build_object('success', false, 'error', '이미 완료되었거나 취소된 매칭입니다.');
  END IF;

  -- 매칭 완료 처리
  UPDATE care_matches
  SET status = 'completed', completed_at = now(), updated_at = now()
  WHERE id = p_match_id;

  -- 요청 상태도 completed로 변경
  UPDATE care_requests
  SET status = 'completed', updated_at = now()
  WHERE id = v_match.request_id;

  -- 주: 시간 적립·차감(time_transactions)은 8주차에 연결 예정

  RETURN json_build_object('success', true);
END;
$$;
