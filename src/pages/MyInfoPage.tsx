import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import {
  User,
  Settings,
  ChevronRight,
  LogOut,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

export function MyInfoPage() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 수정 폼 상태 (모달 열릴 때 현재 값으로 초기화)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const openEditModal = () => {
    setEditName(profile?.name || '');
    setEditPhone(profile?.phone || '');
    setEditAddress(profile?.address || '');
    setSaveError(null);
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      setSaveError('이름은 필수입니다.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const { error } = await updateProfile({
      name: editName.trim(),
      phone: editPhone.trim() || null,
      address: editAddress.trim() || null,
    });
    setSaving(false);
    if (error) {
      setSaveError('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }
    setShowEditModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-6 pb-10">
      {/* 프로필 카드 */}
      <Card className="mb-6 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
          <span className="text-h1 font-bold text-primary">
            {profile?.name?.charAt(0) || '회'}
          </span>
        </div>

        <h2 className="text-h2 font-bold text-ink mb-2">{profile?.name || '-'}</h2>

        {/* 연락처 */}
        {profile?.phone && (
          <div className="flex items-center justify-center gap-2 text-body text-ink-muted mb-1">
            <Phone className="w-4 h-4" />
            <span>{profile.phone}</span>
          </div>
        )}

        {/* 거주 지역 */}
        {profile?.address && (
          <div className="flex items-center justify-center gap-2 text-body text-ink-muted mb-3">
            <MapPin className="w-4 h-4" />
            <span>{profile.address}</span>
          </div>
        )}

        <p className="text-caption text-ink-subtle">
          가입일: {profile?.created_at ? formatDate(profile.created_at) : '-'}
        </p>
      </Card>

      {/* 메뉴 목록 */}
      <div className="space-y-3">
        <button
          onClick={openEditModal}
          className="card w-full text-left hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-ink-muted" />
            <span className="text-body-lg font-medium text-ink">내 프로필 수정</span>
          </div>
          <ChevronRight className="w-6 h-6 text-ink-subtle" />
        </button>

        <button
          onClick={() => navigate('/me/settings')}
          className="card w-full text-left hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-ink-muted" />
            <span className="text-body-lg font-medium text-ink">설정</span>
          </div>
          <ChevronRight className="w-6 h-6 text-ink-subtle" />
        </button>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="card w-full text-left bg-[#FFF0F0] border-[#FFCACA] hover:bg-[#FFE5E5]
                     transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-6 h-6 text-accent" />
            <span className="text-body-lg font-medium text-accent">로그아웃</span>
          </div>
          <ChevronRight className="w-6 h-6 text-accent" />
        </button>
      </div>

      {/* 프로필 수정 모달 */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="프로필 수정">
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 bg-[#FFF0F0] border border-[#FFCACA] rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <p className="text-body text-accent">{saveError}</p>
            </div>
          )}

          <div>
            <label className="label-text">
              이름 <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label className="label-text">연락처</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="input-field pl-12"
                placeholder="010-0000-0000"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="label-text">거주 지역</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="input-field pl-12"
                placeholder="예: 서울시 마포구 망원동"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={saving}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>

      {/* 로그아웃 확인 모달 */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        showClose={false}
        size="sm"
      >
        <div className="text-center py-4">
          <LogOut className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="text-h3 font-bold text-ink mb-2">로그아웃 하시겠어요?</h3>
          <p className="text-body text-ink-muted mb-6">언제든 다시 로그인할 수 있어요.</p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleLogout} className="flex-1">
              로그아웃
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
