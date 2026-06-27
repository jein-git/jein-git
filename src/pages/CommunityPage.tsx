import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { CommunityPost } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Loader2, AlertCircle, Megaphone, MessageSquare, PenLine } from 'lucide-react';

// 탭 옵션: 전체 / 공지 / 후기
type Tab = 'all' | 'notice' | 'review';

// 날짜 상대 포맷
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
}

// 게시글 타입 뱃지 스타일
const POST_TYPE_CONFIG = {
  notice: { label: '공지', className: 'bg-warn-light text-warn', icon: Megaphone },
  review: { label: '후기', className: 'bg-success-light text-success', icon: MessageSquare },
};

export function CommunityPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 관리자 여부
  const isAdmin = profile?.role === 'admin';

  // 탭이 바뀔 때마다 게시글 다시 조회
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('community_posts')
      .select('id, author_id, post_type, title, content, created_at, updated_at')
      .order('created_at', { ascending: false });

    // 탭 필터: 전체이면 조건 없음
    if (activeTab !== 'all') {
      query = query.eq('post_type', activeTab);
    }

    const { data, error: dbError } = await query;

    if (dbError) {
      setError('게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setPosts((data as CommunityPost[]) ?? []);
    }

    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all',    label: '전체' },
    { key: 'notice', label: '공지' },
    { key: 'review', label: '후기' },
  ];

  return (
    <div className="px-6 py-4 pb-6">
      {/* ── 탭 바 ──────────────────────────────────────── */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-h-touch flex items-center justify-center rounded-xl
                        font-semibold text-body-lg transition-colors
                        ${activeTab === tab.key
                          ? 'bg-primary text-white'
                          : 'bg-surface-card border border-line text-ink-muted'
                        }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 작성 버튼 영역 ──────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        {/* 후기 쓰기: 모든 사용자 */}
        <button
          onClick={() => navigate('/community/write?type=review')}
          className="flex-1 min-h-touch flex items-center justify-center gap-2
                     rounded-xl border-2 border-primary bg-primary-light
                     text-primary-dark font-semibold text-body-lg
                     active:scale-[0.97] transition-transform"
        >
          <PenLine className="w-5 h-5" />
          후기 쓰기
        </button>

        {/* 공지 쓰기: 관리자만 표시 */}
        {isAdmin && (
          <button
            onClick={() => navigate('/community/write?type=notice')}
            className="flex-1 min-h-touch flex items-center justify-center gap-2
                       rounded-xl border-2 border-warn bg-warn-light
                       text-warn font-semibold text-body-lg
                       active:scale-[0.97] transition-transform"
          >
            <Megaphone className="w-5 h-5" />
            공지 쓰기
          </button>
        )}
      </div>

      {/* ── 로딩 ────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-body-lg text-ink-muted">불러오는 중...</p>
        </div>
      )}

      {/* ── 오류 ────────────────────────────────────────── */}
      {!loading && error && (
        <Card variant="muted" className="flex items-start gap-3 py-5">
          <AlertCircle className="w-6 h-6 text-warn flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-semibold text-ink mb-1">불러오기 실패</p>
            <p className="text-body text-ink-muted">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-3 text-body-lg text-primary font-semibold"
            >
              다시 시도
            </button>
          </div>
        </Card>
      )}

      {/* ── 빈 상태 ─────────────────────────────────────── */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="w-16 h-16 text-ink-subtle mb-5" />
          <p className="text-h3 font-bold text-ink mb-2">게시글이 없습니다</p>
          <p className="text-body-lg text-ink-muted">
            {activeTab === 'notice' && '아직 공지사항이 없습니다.'}
            {activeTab === 'review' && '첫 번째 후기를 작성해보세요!'}
            {activeTab === 'all'    && '아직 등록된 글이 없습니다.'}
          </p>
        </div>
      )}

      {/* ── 게시글 목록 ─────────────────────────────────── */}
      {!loading && !error && posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => {
            const config = POST_TYPE_CONFIG[post.post_type];
            const Icon = config.icon;

            return (
              <button
                key={post.id}
                onClick={() => navigate(`/community/${post.id}`)}
                className="w-full text-left active:scale-[0.98] transition-transform"
              >
                <Card className="space-y-3">
                  {/* 타입 뱃지 + 날짜 */}
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 text-caption font-semibold
                                     px-2.5 py-1 rounded-full ${config.className}`}>
                      <Icon className="w-4 h-4" />
                      {config.label}
                    </span>
                    <span className="text-caption text-ink-subtle">
                      {timeAgo(post.created_at)}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-h3 font-bold text-ink leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  {/* 내용 미리보기 */}
                  {post.content && (
                    <p className="text-body text-ink-muted line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
