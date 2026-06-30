import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, mapAuthError } from '../context/AuthContext';
import { Clock, Check, ChevronLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

type SignupState = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

const TERMS_CONTENT = {
  terms: {
    title: '서비스 이용약관',
    body: `제1조 (목적)
본 약관은 돌봄타임뱅크(이하 "서비스")의 이용에 관한 기본적인 사항을 규정합니다.

제2조 (서비스 이용)
회원은 서비스를 통해 이웃 간 돌봄 활동을 시간 단위로 교환할 수 있습니다. 회원은 서비스가 제공하는 기능을 통해 도움 요청 및 제공, 시간 거래 등의 활동을 할 수 있습니다.

제3조 (회원의 의무)
회원은 타인을 존중하고 서비스를 선의로 이용해야 하며, 부정 이용 시 서비스 이용이 제한될 수 있습니다.

제4조 (서비스 변경 및 중단)
운영 상 불가피한 사유 발생 시 서비스 내용을 변경하거나 중단할 수 있으며, 이를 사전에 공지합니다.

이 약관은 2026년 1월 1일부터 시행됩니다.`,
  },
  privacy: {
    title: '개인정보 수집 및 이용',
    body: `돌봄타임뱅크는 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.

■ 수집 항목
이름, 이메일 주소, 전화번호, 거주지 주소

■ 수집 목적
- 회원 식별 및 서비스 제공
- 도움 요청·제공 매칭
- 시간 거래 내역 관리
- 고객 문의 응대

■ 보유 및 이용 기간
회원 탈퇴 후 30일까지 보관 후 즉시 삭제합니다.
단, 관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.

■ 동의 거부 권리
개인정보 수집·이용에 동의하지 않으실 수 있으나, 서비스 이용이 불가합니다.`,
  },
  marketing: {
    title: '마케팅 정보 수신',
    body: `돌봄타임뱅크의 새로운 서비스, 이벤트, 혜택 정보를 수신하실 수 있습니다.

■ 수신 채널
문자(SMS), 이메일, 앱 푸시 알림

■ 수신 내용
- 신규 기능 및 서비스 안내
- 이벤트 및 프로모션 정보
- 지역 돌봄 활동 소식

■ 수신 거부
언제든지 마이페이지 > 설정에서 수신을 거부하실 수 있습니다.
수신에 동의하지 않으셔도 기본 서비스 이용에는 제한이 없습니다.`,
  },
} as const;

type ModalKey = keyof typeof TERMS_CONTENT;

export function TermsAgreementPage() {
  const { user, signUp, updateProfile, saveUserConsents } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state as SignupState | null;

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 비로그인 + 폼 데이터 없음: 회원가입으로 (구글 OAuth 로그인 유저는 해당 없음)
  if (!user && !signupData) {
    navigate('/signup', { replace: true });
    return null;
  }

  const allAgreed = termsAgreed && privacyAgreed && marketingAgreed;

  const handleAllAgreed = () => {
    const next = !allAgreed;
    setTermsAgreed(next);
    setPrivacyAgreed(next);
    setMarketingAgreed(next);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!termsAgreed || !privacyAgreed) {
      setError('필수 약관에 동의해야 회원가입을 진행할 수 있습니다.');
      return;
    }

    setLoading(true);

    if (user) {
      // 구글 OAuth 등 이미 로그인된 유저: profiles + user_consents 에 저장
      const { error: updateError } = await updateProfile({
        terms_agreed: true,
        privacy_agreed: true,
        marketing_agreed: marketingAgreed,
        agreed_at: new Date().toISOString(),
      });
      if (updateError) {
        setLoading(false);
        setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }

      const { error: consentError } = await saveUserConsents({
        userId: user.id,
        marketingAgreed,
      });
      setLoading(false);
      if (consentError) {
        setError(consentError.message);
        return;
      }

      // AppRoutes가 terms 게이트 해제 후 phone/address 유무에 따라 자동 분기
      navigate('/');
    } else {
      // 이메일 회원가입 플로우
      const { error: authError } = await signUp(
        signupData!.email,
        signupData!.password,
        signupData!.name,
        signupData!.phone || undefined,
        signupData!.address || undefined,
        true,
        true,
        marketingAgreed,
      );
      setLoading(false);
      if (authError) {
        setError(mapAuthError(authError.message));
        return;
      }
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center px-4 h-[72px] border-b border-line bg-surface-base shrink-0">
        <button
          type="button"
          onClick={() => navigate('/signup', { state: signupData })}
          className="min-h-touch min-w-touch flex items-center justify-center rounded-full
                     hover:bg-surface-muted transition-colors mr-2"
        >
          <ChevronLeft className="w-8 h-8 text-ink" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-h3 font-bold text-ink">회원가입</h1>
        </div>
      </header>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-12">
        {/* 안내 문구 */}
        <h2 className="text-h2 font-bold text-ink mb-8 leading-snug">
          돌봄타임뱅크 이용을 위해<br />약관에 동의해주세요
        </h2>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-[#FFF0F0] border border-[#FFCACA] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-body-lg text-accent">{error}</p>
          </div>
        )}

        {/* 모두 동의하기 */}
        <button
          type="button"
          onClick={handleAllAgreed}
          className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-colors mb-5 ${
            allAgreed ? 'bg-primary-light border-primary' : 'bg-white border-line'
          }`}
        >
          <CheckBox checked={allAgreed} />
          <span className="text-h3 font-bold text-ink">모두 동의하기</span>
        </button>

        {/* 구분선 */}
        <div className="h-px bg-line mb-5" />

        {/* 개별 약관 항목 */}
        <div className="space-y-3">
          <TermItem
            checked={termsAgreed}
            onChange={setTermsAgreed}
            required
            label="서비스 이용약관 동의"
            onView={() => setActiveModal('terms')}
          />
          <TermItem
            checked={privacyAgreed}
            onChange={setPrivacyAgreed}
            required
            label="개인정보 수집 및 이용 동의"
            onView={() => setActiveModal('privacy')}
          />
          <TermItem
            checked={marketingAgreed}
            onChange={setMarketingAgreed}
            required={false}
            label="마케팅 정보 수신 동의"
            onView={() => setActiveModal('marketing')}
          />
        </div>

        {/* 가입 완료 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !termsAgreed || !privacyAgreed}
          className="btn-primary mt-10 disabled:opacity-40 flex items-center justify-center gap-2"
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
      </div>

      {/* 약관 모달 */}
      {(Object.keys(TERMS_CONTENT) as ModalKey[]).map((key) => (
        <Modal
          key={key}
          isOpen={activeModal === key}
          onClose={() => setActiveModal(null)}
          title={TERMS_CONTENT[key].title}
          size="lg"
        >
          <p className="text-body text-ink-muted whitespace-pre-line leading-loose">
            {TERMS_CONTENT[key].body}
          </p>
        </Modal>
      ))}
    </div>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div
      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-white border-line'
      }`}
    >
      {checked && <Check className="w-6 h-6 text-white" />}
    </div>
  );
}

function TermItem({
  checked,
  onChange,
  required,
  label,
  onView,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  required: boolean;
  label: string;
  onView: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-1">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-primary border-primary' : 'bg-white border-line'
        }`}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && <Check className="w-6 h-6 text-white" />}
      </button>

      <div className="flex-1 flex flex-wrap items-center gap-2 min-w-0">
        <span className="text-h3 text-ink break-keep">{label}</span>
        <span
          className={`text-caption font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
            required
              ? 'bg-accent-light text-accent'
              : 'bg-surface-muted text-ink-muted'
          }`}
        >
          {required ? '필수' : '선택'}
        </span>
      </div>

      <button
        type="button"
        onClick={onView}
        className="shrink-0 min-h-touch px-3 flex items-center text-primary text-body-lg
                   font-medium underline underline-offset-2"
      >
        보기
      </button>
    </div>
  );
}
