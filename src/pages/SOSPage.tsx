import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertTriangle, Phone, MapPin, Clock, CheckCircle } from 'lucide-react';

export function SOSPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState<'confirm' | 'sending' | 'sent'>('confirm');
  const [notes, setNotes] = useState('');

  const handleSendSOS = async () => {
    if (!profile?.id) {
      alert('로그인이 필요합니다.');
      navigate(-1);
      return;
    }

    setStep('sending');

    try {
      // Create a priority help request
      const { data, error } = await supabase
        .from('help_requests')
        .insert({
          requester_id: profile.id,
          title: '긴급 도움 요청',
          description: notes || '긴급한 도움이 필요합니다. 즉시 연락 바랍니다.',
          category: '기타',
          urgency: 'urgent',
          time_cost: 1,
          status: 'open',
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      // In a real app, this would trigger push notifications to nearby users
      setStep('sent');
    } catch (error) {
      console.error('Error sending SOS:', error);
      alert('긴급 요청 전송에 실패했습니다. 직접 전화로 도움을 요청하세요.');
      setStep('confirm');
    }
  };

  const emergencyContacts = [
    { name: '응급센터', number: '119', color: 'bg-red-500' },
    { name: '경찰', number: '112', color: 'bg-blue-500' },
    { name: '소방', number: '119', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-8 mt-4">
          <AlertTriangle className="w-12 h-12 text-red-500 animate-pulse" />
        </div>

        {step === 'confirm' && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-senior-xl font-bold text-red-600 mb-4">
                긴급 도움 요청
              </h1>
              <p className="text-senior text-neutral-700">
                긴급 도움 요청을 보내면 이웃들에게 알림이 전송됩니다.
              </p>
            </div>

            {/* Notes */}
            <div className="card mb-6">
              <label className="label-text">상황 설명 (선택사항)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="현재 상황을 간단히 설명해주세요"
                className="input-field min-h-[100px] resize-none mt-2"
              />
            </div>

            {/* SOS Button */}
            <button
              onClick={handleSendSOS}
              className="w-full min-h-touch-lg bg-red-500 text-white text-senior-xl font-bold
                         rounded-2xl shadow-lg hover:bg-red-600 active:bg-red-700
                         transition-colors mb-6 flex items-center justify-center gap-3"
            >
              <AlertTriangle className="w-8 h-8" />
              긴급 요청 보내기
            </button>

            {/* Emergency Contacts */}
            <div className="card">
              <h2 className="text-senior-lg font-semibold mb-4">긴급 전화</h2>
              <div className="space-y-3">
                {emergencyContacts.map((contact) => (
                  <a
                    key={contact.number}
                    href={`tel:${contact.number}`}
                    className={`flex items-center justify-between p-4 ${contact.color}
                               text-white rounded-xl hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-6 h-6" />
                      <span className="text-senior font-semibold">{contact.name}</span>
                    </div>
                    <span className="text-senior-xl font-bold">{contact.number}</span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'sending' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-red-200
                            border-t-red-500 animate-spin" />
            <p className="text-senior-xl font-semibold text-red-600">
              긴급 요청 전송 중...
            </p>
          </div>
        )}

        {step === 'sent' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100
                           flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-senior-xl font-bold text-green-600 mb-4">
              긴급 요청이 전송되었습니다
            </h2>
            <p className="text-senior text-neutral-700 mb-6">
              이웃들에게 알림이 갔습니다. 잠시만 기다려주세요.
            </p>
            <div className="card mb-6">
              <div className="flex items-center gap-3 text-neutral-600">
                <Clock className="w-6 h-6" />
                <span className="text-senior">평균 응답 시간: 30분 이내</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/activity')}
              className="btn-primary w-full"
            >
              내 요청 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
