/*
  # profiles 테이블에 약관 동의 컬럼 추가

  1. 추가 컬럼
    - terms_agreed     : 서비스 이용약관 동의 여부 (필수)
    - privacy_agreed   : 개인정보 수집·이용 동의 여부 (필수)
    - marketing_agreed : 마케팅 정보 수신 동의 여부 (선택)
    - agreed_at        : 필수 약관 동의 시각
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terms_agreed     boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_agreed   boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_agreed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS agreed_at        timestamptz;
