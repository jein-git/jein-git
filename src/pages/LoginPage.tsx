import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, mapAuthError } from '../context/AuthContext';
import { Clock, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
