-- ============================================================
-- 1. profiles 테이블에 role 컬럼 추가
--    기본값 'user', 관리자는 'admin'으로 직접 지정
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));


-- ============================================================
-- 2. community_posts 테이블: 공지사항·돌봄 후기 저장
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_type   text        NOT NULL CHECK (post_type IN ('notice', 'review')),
  title       text        NOT NULL,
  content     text        NOT NULL DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 모든 인증 사용자가 게시글 목록·상세 조회 가능
CREATE POLICY "community_posts_select"
  ON public.community_posts FOR SELECT
  TO authenticated
  USING (true);

-- 일반 사용자: 본인 후기(review)만 작성 가능
CREATE POLICY "community_posts_insert_review"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'review'
  );

-- 관리자(admin): 본인 공지(notice)만 작성 가능
CREATE POLICY "community_posts_insert_notice"
  ON public.community_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND post_type = 'notice'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 조회 성능용 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_type    ON public.community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_author  ON public.community_posts(author_id);


-- ============================================================
-- 3. get_admin_dashboard_stats: 관리자 전용 통계 조회 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id uuid;
  v_is_admin        boolean;
BEGIN
  v_current_user_id := auth.uid();

  IF v_current_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', '로그인이 필요합니다.');
  END IF;

  -- 관리자 권한 확인
  SELECT (role = 'admin') INTO v_is_admin
  FROM profiles WHERE id = v_current_user_id;

  IF v_is_admin IS NOT TRUE THEN
    RETURN json_build_object('success', false, 'error', '관리자만 접근할 수 있습니다.');
  END IF;

  -- 통계 집계 후 반환
  RETURN json_build_object(
    'success',              true,
    'total_members',        (SELECT COUNT(*) FROM profiles),
    'open_requests',        (SELECT COUNT(*) FROM care_requests WHERE status = 'open'),
    'matched_count',        (SELECT COUNT(*) FROM care_requests WHERE status = 'matched'),
    'completed_count',      (SELECT COUNT(*) FROM care_requests WHERE status = 'completed'),
    'this_month_completed', (
      SELECT COUNT(*) FROM care_matches
      WHERE status = 'completed'
        AND DATE_TRUNC('month', completed_at) = DATE_TRUNC('month', now())
    ),
    'total_earned', COALESCE(
      (SELECT SUM(amount) FROM time_transactions WHERE type = 'earn'), 0
    ),
    'total_spent', COALESCE(
      (SELECT SUM(amount) FROM time_transactions WHERE type = 'spend'), 0
    )
  );
END;
$$;
