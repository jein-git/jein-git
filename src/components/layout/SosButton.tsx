import { useState } from 'react';
import { AlertCircle, Phone } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { mockHub } from '../../data/mock';

export function SosButton() {
  const [showModal, setShowModal] = useState(false);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-10 h-10 rounded-full bg-accent
                   flex items-center justify-center shadow-lg
                   hover:scale-105 active:scale-95 transition-transform"
        aria-label="긴급 도움 SOS"
      >
        <AlertCircle className="w-5 h-5 text-white" />
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} showClose={false} size="sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-light
                         flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-h2 font-bold text-ink mb-2">긴급 도움이 필요하세요?</h2>
          <p className="text-body text-ink-muted">
            누르면 바로 전화가 연결됩니다
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="min-h-touch-xl"
            onClick={() => handleCall(mockHub.coordinator.phone)}
          >
            <Phone className="w-6 h-6" />
            코디네이터 {mockHub.coordinator.name}님께 전화
          </Button>

          <Button
            variant="danger"
            size="lg"
            className="min-h-touch-xl"
            onClick={() => handleCall('119')}
          >
            <Phone className="w-6 h-6" />
            119 응급실
          </Button>

          <Button variant="ghost" onClick={() => setShowModal(false)}>
            취소
          </Button>
        </div>
      </Modal>
    </>
  );
}
