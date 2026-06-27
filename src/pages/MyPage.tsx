import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Edit2, LogOut, AlertCircle, CheckCircle } from 'lucide-react';

export function MyPage() {
  const { profile, updateProfile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [intro, setIntro] = useState(profile?.intro || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        intro: intro.trim(),
      });

      if (error) throw error;

      setMessage({ type: 'success', text: '저장되었습니다.' });
      setEditing(false);
      refreshProfile();
    } catch (error) {
      setMessage({ type: 'error', text: '저장에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(profile?.name || '');
    setPhone(profile?.phone || '');
    setAddress(profile?.address || '');
    setIntro(profile?.intro || '');
    setEditing(false);
    setMessage(null);
  };

  const handleSignOut = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await signOut();
    }
  };

  if (!profile) {
    return (
      <div className="p-4">
        <div className="card text-center py-12">
          <p className="text-senior text-neutral-600">로그인이 필요합니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Profile Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-500" />
            )}
          </div>
          <div>
            <h2 className="text-senior-xl font-bold">{profile.name}</h2>
            <p className="text-senior text-neutral-600">타임뱅크 회원</p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="label-text">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label className="label-text">전화번호</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="연락처를 입력하세요"
              />
            </div>

            <div>
              <label className="label-text">주소</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-field"
                placeholder="주소를 입력하세요"
              />
            </div>

            <div>
              <label className="label-text">자기소개</label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="간단한 자기소개를 입력하세요"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? '저장 중...' : '저장'}
              </button>
              <button onClick={handleCancel} className="btn-secondary">
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <InfoRow label="이름" value={profile.name} />
            {profile.phone && <InfoRow label="전화번호" value={profile.phone} />}
            {profile.address && <InfoRow label="주소" value={profile.address} />}
            {profile.intro && <InfoRow label="자기소개" value={profile.intro} />}

            <button
              onClick={() => setEditing(true)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              정보 수정
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="card mb-6">
        <h3 className="text-senior-lg font-semibold mb-4">내 활동 통계</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary-50 rounded-xl">
            <p className="text-3xl font-bold text-primary-600">{profile.time_balance}</p>
            <p className="text-senior text-neutral-600 mt-1">시간 잔액</p>
          </div>
          <div className="text-center p-4 bg-accent-sage/10 rounded-xl">
            <p className="text-3xl font-bold text-accent-sage">0</p>
            <p className="text-senior text-neutral-600 mt-1">감사 메시지</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={handleSignOut}
        className="card w-full text-left hover:bg-red-50 group"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-6 h-6 text-red-500" />
          <span className="text-senior font-medium text-red-600">로그아웃</span>
        </div>
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-senior text-neutral-500 mb-1">{label}</p>
      <p className="text-senior font-medium">{value}</p>
    </div>
  );
}
