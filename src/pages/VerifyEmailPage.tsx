import { useLocation, Link } from 'react-router-dom';
import { Mail, Clock } from 'lucide-react';

type LocationState = { email?: string };

export function VerifyEmailPage() {
  const location = useLocation();
  const email = (location.state as LocationState)?.email;

  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 mb-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
        <Mail className="w-11 h-11 text-white" />
      </div>

      <div className="mb-1 flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <span className="text-body font-semibold text-primary">돌봄타임뱅크</span>
      </div>

      <h1 className="text-h1 font-bold text-ink mt-4 mb-3">인증 메일을 확인해주세요</h1>

      {email && (
        <p className="text-body-lg font-semibold text-ink mb-2">{email}</p>
      )}

      <p className="text-body text-ink-muted mb-10 leading-relaxed">
        가입하신 이메일로 인증 링크를 보냈습니다.<br />
        링크를 클릭하면 가입이 완료됩니다.
      </p>

      <Link to="/login" replace className="btn-primary w-full max-w-sm">
        로그인 화면으로 이동
      </Link>

      <p className="mt-5 text-caption text-ink-subtle">
        메일이 오지 않으면 스팸함을 확인해주세요.
      </p>
    </div>
  );
}
