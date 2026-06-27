-- ================================================================
-- RPC: 시작 시간 이전에 매칭 취소
--   care_matches.status  → 'cancelled'
--   care_requests.status → 'open'  (다른 사람이 다시 수락 가능)
--   time_transactions 변동 없음 (완료 전 취소이므로)
-- ================================================================
CREATE OR REPLACE FUNCTION public.cancel_care_match_before_start(
  p_match_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match    public.care_matches%ROWTYPE;
  v_request  public.care_requests%ROWTYPE;
  v_now_kst  timestamp without time zone;
  v_start_dt timestamp without time zone;
BEGIN
  -- KST 현재 시각
  v_now_kst := (now() AT TIME ZONE 'Asia/Seoul')::timestamp without time zone;

  -- 1. 매칭 조회 (행 잠금으로 동시 처리 방지)
  SELECT * INTO v_match
  FROM public.care_matches
  WHERE id = p_match_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', '매칭 정보를 찾을 수 없습니다.');
  END IF;

  -- 2. 권한 체크: 요청자 또는 제공자만 취소 가능
  IF auth.uid() IS NULL
     OR (auth.uid() != v_match.requester_id AND auth.uid() != v_match.provider_id)
  THEN
    RETURN jsonb_build_object('success', false, 'error', '취소 권한이 없습니다.');
  END IF;

  -- 3. 상태 체크: matched 상태만 취소 가능
  IF v_match.status != 'matched' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', '이미 완료되었거나 취소된 도움입니다.'
    );
  END IF;

  -- 4. 요청 정보 조회
  SELECT * INTO v_request
  FROM public.care_requests
  WHERE id = v_match.request_id;

  -- 5. 시작 시간 이전 여부 확인
  IF v_request.requested_date IS NOT NULL THEN
    IF v_request.start_time IS NOT NULL THEN
      v_start_dt := (v_request.requested_date::text || ' ' || v_request.start_time::text)::timestamp;
    ELSE
      -- 시작 시간 없으면 해당 날짜 자정 기준 (같은 날도 취소 허용)
      v_start_dt := v_request.requested_date::timestamp;
    END IF;

    IF v_now_kst >= v_start_dt THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', '시작 시간이 지나 취소할 수 없습니다.'
      );
    END IF;
  END IF;

  -- 6. 취소 처리
  UPDATE public.care_matches
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_match_id;

  UPDATE public.care_requests
  SET status = 'open', updated_at = now()
  WHERE id = v_match.request_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
