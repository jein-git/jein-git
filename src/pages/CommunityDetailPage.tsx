import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { CommunityPost } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { ChevronLeft, Loader2, AlertCircle, Megaphone, MessageSquare, Home } from 'lucide-react';

// 날짜 전체 표시: "2026년 6월 19일 오후 2:30"
function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// 게시글 타입 뱃지 스타일
const POST_TYPE_CONFIG = {
  notice: { label: '공지사항', className: 'bg-warn-light text-warn', icon: Megaphone },
  review: { label: '돌봄 후기', className: 'bg-success-light text-success', icon: MessageSquare },
};

export function CommunityDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('잘못된 접근입니다.');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      const { data, error: dbError } = await supabase
        .from('community_posts')
        .select('id, author_id, post_type, title, content, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (dbError || !data) {
        setError('게시글을 찾을 수 없습니다.');
      } else {
        setPost(data as CommunityPost);
      }

      setLoading(false);
    };

    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-surface-base border-b border-line
                         flex items-center px-4 h-[72px]">
        <button
          onClick={() => navigate(-1)}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </button>
        <h1 className="text-h3 font-bold text-ink">게시글 상세</h1>
        <button
          onClick={() => navigate('/')}
          className="ml-auto min-h-touch min-w-touch flex items-center justify-center
                     rounded-full hover:bg-surface-muted transition-colors"
          aria-label="홈으로 가기"
        >
          <Home className="w-7 h-7 text-primary" />
        </button>
      </header>

      {/* 본문 */}
      <main className="flex-1 px-6 py-6">
        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-body-lg text-ink-muted">불러오는 중...</p>
          </div>
        )}

        {/* 오류 */}
        {!loading && (error || !post) && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-warn mb-4" />
            <p className="text-h3 font-bold text-ink mb-2">
              {error ?? '게시글을 찾을 수 없습니다'}
            </p>
            <button
              onClick={() => navigate('/community')}
              className="mt-6 text-body-lg text-primary font-semibold"
            >
              목록으로 돌아가기
            </button>
          </div>
        )}

        {/* 게시글 내용 */}
        {!loading && post && (() => {
          const config = POST_TYPE_CONFIG[post.post_type] ?? POST_TYPE_CONFIG.review;
          const Icon = config.icon;

          return (
            <div className="space-y-5">
              {/* 타입 뱃지 + 날짜 */}
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-body font-semibold
                                 px-3 py-1.5 rounded-full ${config.className}`}>
                  <Icon className="w-5 h-5" />
                  {config.label}
                </span>
                <span className="text-caption text-ink-subtle">
                  {formatFullDate(post.created_at)}
                </span>
              </div>

              {/* 제목 */}
              <h2 className="text-h1 font-bold text-ink leading-snug">
                {post.title}
              </h2>

              {/* 구분선 */}
              <div className="border-t border-line" />

              {/* 내용 */}
              <Card variant="muted">
                <p className="text-body-lg text-ink leading-relaxed whitespace-pre-wrap">
                  {post.content || '내용이 없습니다.'}
                </p>
              </Card>

              {/* 하단 버튼 */}
              <div className="flex flex-col gap-3 pt-2 pb-6">
                <button
                  onClick={() => navigate('/community')}
                  className="w-full min-h-touch-lg rounded-xl border-2 border-line
                             text-ink font-semibold text-body-lg active:scale-[0.98] transition-transform"
                >
                  목록으로 돌아가기
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full min-h-touch-lg rounded-xl bg-primary text-white
                             font-semibold text-body-lg active:scale-[0.98] transition-transform"
                >
                  홈으로 가기
                </button>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
