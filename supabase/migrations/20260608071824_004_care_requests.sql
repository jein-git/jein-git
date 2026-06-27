/*
  care_requests 테이블
  - 도움 주기 화면에서 status = 'open' 인 요청 목록 표시용
  - 기존 help_requests와 별도로, 더 상세한 위치/일시 정보 포함
*/
CREATE TABLE IF NOT EXISTS care_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  location text DEFAULT '',
  requested_date date,
  requested_hours numeric(4,1) NOT NULL DEFAULT 1.0,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE care_requests ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 모두 open 요청을 볼 수 있음
CREATE POLICY "care_requests_select"
  ON care_requests FOR SELECT
  TO authenticated
  USING (true);

-- 본인만 등록
CREATE POLICY "care_requests_insert"
  ON care_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

-- 본인만 수정
CREATE POLICY "care_requests_update"
  ON care_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

-- 본인만 삭제
CREATE POLICY "care_requests_delete"
  ON care_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id);

CREATE INDEX IF NOT EXISTS idx_care_requests_status ON care_requests(status);
CREATE INDEX IF NOT EXISTS idx_care_requests_requester ON care_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_care_requests_date ON care_requests(requested_date);
