-- care_requests 테이블에 시작/종료 시간 컬럼 추가
-- 기존 행에는 NULL이 허용되어 데이터 손실 없음
ALTER TABLE public.care_requests
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time;
