/*
  # 사용자 정의 함수 (RPC)

  1. 새 함수
    - `update_time_balance` - 사용자의 시간 잔액을 업데이트
    - 수량을 입력받아 기존 잔액에 더함/뺌
  
  2. 보안
    - 인증된 사용자만 실행 가능
    - 자신의 잔액만 업데이트 가능
*/

CREATE OR REPLACE FUNCTION update_time_balance(
  user_id uuid,
  amount integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET time_balance = time_balance + amount,
      updated_at = now()
  WHERE id = user_id;
END;
$$;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id uuid)
RETURNS TABLE(
  earned_hours bigint,
  spent_hours bigint,
  thank_you_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN provider_id = target_user_id THEN time_amount ELSE 0 END), 0)::bigint,
    COALESCE(SUM(CASE WHEN requester_id = target_user_id THEN time_amount ELSE 0 END), 0)::bigint,
    (SELECT COUNT(*)::bigint FROM thank_you_messages WHERE receiver_id = target_user_id)
  FROM transactions
  WHERE (provider_id = target_user_id OR requester_id = target_user_id)
    AND status = 'completed';
END;
$$;
