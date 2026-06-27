import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2, CheckCircle, AlertCircle, Megaphone, MessageSquare } from 'lucide-react';

export function CommunityWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();

  // URL ?type=review 또는 ?type=notice 에서 게시글 타입 결정
  const rawType = searchParams.get('type');
  const postType: 'review' | 'notice' =
    rawType === 'notice' ? 'notice' : 'review';

  const isAdmin = profile?.role === 'admin';

  // 공지 작성은 관리자만 가능
  const isUnauthorized = postType === 'notice' && !isAdmin;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: dbError } = await supabase
      .from('community_posts')
      .insert({
        author_id: user.id,
        post_type: postType,
        title: title.trim(),
        content: content.trim(),
      });

    setSubmitting(false);

    if (dbError) {
      // RLS 위반 시 권한 오류로 처리
      if (dbError.code === '42501' || dbError.message.includes('violates row-level security')) {
        setError('이 글을 작성할 권한이 없습니다.');
      } else {
        setError('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      return;
    }

    setSuccess(true);
  };

  // ── 성공 화면 ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <header className="px-4 h-[72px] flex items-center border-b border-line">
          <span className="text-h3 font-bold text-primary">품터</span>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-success-light flex items-center justify-center">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h1 className="text-h1 font-bold text-ink mb-3">
            {postType === 'review' ? '후기가 등록되었습니다.' : '공지가 등록되었습니다.'}
          </h1>
          <p className="text-body-lg text-ink-muted mb-10">
            이웃들이 글을 볼 수 있습니다.
          </p>
          <div className="flex flex-col w-full gap-3">
            <button
              onClick={() => navigate('/community')}
              className="w-full min-h-touch-lg rounded-xl bg-primary text-white
                         font-semibold text-body-lg active:scale-[0.98] transition-transform"
            >
              목록으로 가기
            </button>
            <button
              onClick={() => { setSuccess(false); setTitle(''); setContent(''); }}
              className="w-full min-h-touch-lg rounded-xl border-2 border-line
                         text-ink font-semibold text-body-lg active:scale-[0.98] transition-transform"
            >
              또 쓰기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 권한 없음 화면 ──────────────────────────────────────
  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-surface-base flex flex-col">
        <header className="sticky top-0 z-10 bg-surface-base border-b border-line
                           flex items-center px-4 h-[72px]">
          <button
            onClick={() => navigate(-1)}
            className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                       hover:bg-surface-muted transition-colors mr-2"
          >
            <ChevronLeft className="w-8 h-8 text-ink" />
          </button>
          <h1 className="text-h3 font-bold text-ink">공지 작성</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <AlertCircle className="w-16 h-16 text-warn mb-4" />
          <p className="text-h3 font-bold text-ink mb-2">관리자만 공지를 작성할 수 있습니다.</p>
          <button
            onClick={() => navigate('/community')}
            className="mt-6 text-body-lg text-primary font-semibold"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 작성 폼 ────────────────────────────────────────────
  const TypeIcon = postType === 'notice' ? Megaphone : MessageSquare;
  const typeLabel = postType === 'notice' ? '공지 작성' : '후기 작성';
  const titlePlaceholder = postType === 'notice' ? '공지 제목을 입력하세요' : '후기 제목을 입력하세요';
  const contentPlaceholder =
    postType === 'review'
      ? '어떤 도움을 주고받으셨나요? 경험을 나눠주세요.'
      : '공지 내용을 입력하세요.';

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
        <div className="flex items-center gap-2">
          <TypeIcon className="w-6 h-6 text-primary" />
          <h1 className="text-h3 font-bold text-ink">{typeLabel}</h1>
        </div>
      </header>

      {/* 폼 */}
      <main className="flex-1 px-6 py-6 pb-32 space-y-5">
        {/* 오류 메시지 */}
        {error && (
          <div className="p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl
                          flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{error}</p>
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-body-lg font-semibold text-ink mb-2">
            제목 <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholder}
            maxLength={100}
            className="w-full border-2 border-line rounded-xl px-4 py-3 text-body-lg
                       text-ink placeholder:text-ink-subtle focus:outline-none
                       focus:border-primary transition-colors"
          />
          <p className="text-caption text-ink-subtle mt-1 text-right">
            {title.length}/100
          </p>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-body-lg font-semibold text-ink mb-2">
            내용 <span className="text-accent">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={contentPlaceholder}
            rows={10}
            className="w-full border-2 border-line rounded-xl px-4 py-3 text-body-lg
                       text-ink placeholder:text-ink-subtle focus:outline-none
                       focus:border-primary transition-colors resize-none"
          />
        </div>
      </main>

      {/* 고정 하단: 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-base border-t border-line
                      px-6 py-4 safe-bottom">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full min-h-touch-lg rounded-xl bg-primary text-white
                     font-semibold text-body-lg flex items-center justify-center gap-2
                     active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed
                     transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              저장 중...
            </>
          ) : (
            typeLabel
          )}
        </button>
      </div>
    </div>
  );
}
