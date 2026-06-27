import { useState } from 'react';
import { HelpCircle, Phone } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { mockHub } from '../../data/mock';

export function FloatingHelp() {
  const [showModal, setShowModal] = useState(false);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-16 h-16 rounded-full bg-primary shadow-lg
                   flex flex-col items-center justify-center text-white
                   hover:scale-105 active:scale-95 transition-transform"
        aria-label="도움말"
      >
        <HelpCircle className="w-6 h-6" />
        <span className="text-caption font-medium">도움</span>
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="도움말">
        <div className="text-center mb-6">
          <p className="text-body-lg text-ink mb-4">
            현재 화면에서 도움이 필요하세요?
          </p>
          <p className="text-body text-ink-muted">
            코디네이터가 친절하게 도와드릴게요
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => handleCall(mockHub.coordinator.phone)}
          className="w-full"
        >
          <Phone className="w-6 h-6" />
          코디네이터에게 전화하기
        </Button>
      </Modal>
    </>
  );
}
