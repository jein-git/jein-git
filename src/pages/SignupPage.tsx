import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, mapAuthError } from '../context/AuthContext';
import {
  Clock,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!name.trim()) return '이름을 입력해주세요.';
    if (!email.trim()) return '이메일을 입력해주세요.';
    if (!password) return '비밀번호를 입력해주세요.';
    if (password.length < 6) return '비밀번호는 6자 이상이어야 합니다.';
    if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(
      email.trim(),
      password,
      name.trim(),
      phone.trim() || undefined,
      address.trim() || undefined
    );
    setLoading(false);

    if (authError) {
      setError(mapAuthError(authError.message));
      return;
    }

    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center px-4 h-[72px] border-b border-line bg-surface-base">
        <Link
          to="/login"
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-h3 font-bold text-ink">회원가입</h1>
        </div>
      </header>

      {/* 폼 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-body-lg text-ink-muted mb-6">
          아래 정보를 입력하시면 가입이 완료됩니다.
        </p>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-5 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body text-accent">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이름 (필수) */}
          <div>
            <label className="label-text">
              이름 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="input-field pl-12"
                autoComplete="name"
              />
            </div>
          </div>

          {/* 이메일 (필수) */}
          <div>
            <label className="label-text">
              이메일 <span className="text-accent">*</span>
            </label>
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

          {/* 비밀번호 (필수) */}
          <div>
            <label className="label-text">
              비밀번호 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력해주세요"
                className="input-field pl-12"
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* 비밀번호 확인 (필수) */}
          <div>
            <label className="label-text">
              비밀번호 확인 <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 한 번 더 입력해주세요"
                className="input-field pl-12"
                autoComplete="new-password"
              />
            </div>
            {passwordConfirm && password !== passwordConfirm && (
              <p className="text-body text-accent mt-2">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-line" />
            <span className="text-caption text-ink-subtle">선택 정보</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          {/* 연락처 */}
          <div>
            <label className="label-text">연락처</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="input-field pl-12"
                autoComplete="tel"
                inputMode="tel"
              />
            </div>
          </div>

          {/* 거주 지역 */}
          <div>
            <label className="label-text">거주 지역</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 서울시 마포구 망원동"
                className="input-field pl-12"
                autoComplete="street-address"
              />
            </div>
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                가입 중...
              </>
            ) : (
              '가입 완료'
            )}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="mt-6 text-center pb-6">
          <p className="text-body text-ink-muted">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold underline underline-offset-2"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
