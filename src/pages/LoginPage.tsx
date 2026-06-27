import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, mapAuthError } from '../context/AuthContext';
import { Clock, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLoginButton } from '../components/ui/GoogleLoginButton';
import { supabase } from '../lib/supabase';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // OAuth 콜백 파라미터 확인 (디버깅)
    const hash = window.location.hash;
    const search = window.location.search;
    if (hash.includes('access_token') || search.includes('code=')) {
      console.log('[LoginPage] OAuth 파라미터 감지:', { hash, search });
    }

    // 세션이 이미 있으면 홈으로 이동
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[LoginPage] getSession 결과:', session);
      if (session) {
        navigate('/', { replace: true });
      }
    });

    // 세션 변화 실시간 감지 (OAuth 콜백 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[LoginPage] onAuthStateChange:', event, session);
      if (session) {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email.trim(), password);
    setLoading(false);

    if (authError) {
      setError(mapAuthError(authError.message));
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 앱 로고 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-20 h-20 mb-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Clock className="w-11 h-11 text-white" />
        </div>
        <h1 className="text-h1 font-bold text-primary-dark mb-2">돌봄타임뱅크</h1>
        <p className="text-body-lg text-ink-muted text-center">
          이웃과 나누는 따뜻한 시간
        </p>
      </div>

      {/* 로그인 폼 */}
      <div className="bg-surface-card rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-h2 font-bold text-ink mb-2">로그인</h2>
        <p className="text-body text-ink-muted mb-6">등록된 이메일로 로그인하세요.</p>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-5 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="label-text">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: hong@example.com"
                className="input-field pl-12"
                autoComplete="email"
                inputMode="email"
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="label-text">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="input-field pl-12"
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* 로그인 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        {/* 구분선 */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#e0e0e0]" />
          <span className="text-sm text-ink-muted">또는</span>
          <div className="flex-1 h-px bg-[#e0e0e0]" />
        </div>

        {/* 구글 로그인 버튼 */}
        <GoogleLoginButton />

        {/* 회원가입 링크 */}
        <div className="mt-6 text-center">
          <p className="text-body text-ink-muted">
            아직 계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold underline underline-offset-2"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
