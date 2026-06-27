/*
  # 시니어 돌봄 타임뱅크 초기 스키마

  1. 새 테이블
    - `profiles` - 사용자 프로필 (시간 잔액, 이름, 연락처 등)
    - `services` - 사용자가 제공할 수 있는 서비스 목록
    - `help_requests` - 도움 요청 게시물
    - `transactions` - 타임뱅크 거래 내역
    - `thank_you_messages` - 감사 메시지 (별점 대신)
    - `notifications` - 알림

  2. 보안
    - 모든 테이블에 RLS 활성화
    - 인증된 사용자만 자신의 데이터에 접근 가능
    - 서비스와 도움 요청은 모든 인증 사용자가 볼 수 있음

  3. 중요 사항
    - 모든 타임스탬프는 한국 시간대(timestamptz) 사용
    - UUID를 기본 키로 사용
    - 외래 키 제약조건으로 데이터 무결성 보장
*/

-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  address text,
  profile_image_url text,
  time_balance integer DEFAULT 10,
  intro text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 서비스 테이블
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  time_cost integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 도움 요청 테이블
CREATE TABLE IF NOT EXISTS help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  urgency text DEFAULT 'normal',
  time_cost integer NOT NULL DEFAULT 1,
  status text DEFAULT 'open',
  matched_provider_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 거래 내역 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES profiles(id),
  requester_id uuid NOT NULL REFERENCES profiles(id),
  service_id uuid REFERENCES services(id),
  help_request_id uuid REFERENCES help_requests(id),
  time_amount integer NOT NULL,
  status text DEFAULT 'completed',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 감사 메시지 테이블
CREATE TABLE IF NOT EXISTS thank_you_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id),
  receiver_id uuid NOT NULL REFERENCES profiles(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE thank_you_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles 정책
CREATE POLICY "사용자는 자신의 프로필을 볼 수 있음"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 생성할 수 있음"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 수정할 수 있음"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- services 정책
CREATE POLICY "모든 사용자가 서비스를 볼 수 있음"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "제공자가 자신의 서비스를 등록할 수 있음"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "제공자가 자신의 서비스를 수정할 수 있음"
  ON services FOR UPDATE
  TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "제공자가 자신의 서비스를 삭제할 수 있음"
  ON services FOR DELETE
  TO authenticated
  USING (auth.uid() = provider_id);

-- help_requests 정책
CREATE POLICY "모든 사용자가 도움 요청을 볼 수 있음"
  ON help_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "사용자가 도움 요청을 등록할 수 있음"
  ON help_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "사용자가 자신의 도움 요청을 수정할 수 있음"
  ON help_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "사용자가 자신의 도움 요청을 삭제할 수 있음"
  ON help_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = requester_id);

-- transactions 정책
CREATE POLICY "거래 당사자가 거래 내역을 볼 수 있음"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id OR auth.uid() = requester_id);

CREATE POLICY "거래 생성 (시스템에서 처리)"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- thank_you_messages 정책
CREATE POLICY "거래 당사자가 감사 메시지를 볼 수 있음"
  ON thank_you_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "거래 당사자가 감사 메시지를 보낼 수 있음"
  ON thank_you_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- notifications 정책
CREATE POLICY "사용자가 자신의 알림을 볼 수 있음"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "사용자가 자신의 알림을 읽음 처리할 수 있음"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_help_requests_requester ON help_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_help_requests_status ON help_requests(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider_id);
CREATE INDEX IF NOT EXISTS idx_transactions_requester ON transactions(requester_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);