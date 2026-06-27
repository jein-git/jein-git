import { useState, useEffect } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { mockHub } from '../../data/mock';

export function PhoneHelpModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-phone-help', handler);
    return () => window.removeEventListener('open-phone-help', handler);
  }, []);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
    setIsOpen(false);
  };

  const coordinator = mockHub.coordinator;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      showClose={false}
      size="sm"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-light
                       flex items-center justify-center">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-h2 font-bold text-ink mb-2">전화 도움</h2>
        <p className="text-body text-ink-muted">
          누르면 바로 전화가 연결됩니다
        </p>
      </div>

      <div className="space-y-3">
        {coordinator ? (
          <Button
            variant="primary"
            size="lg"
            className="min-h-touch-xl"
            onClick={() => handleCall(coordinator.phone)}
          >
            <Phone className="w-6 h-6" />
            코디네이터 {coordinator.name}님께 전화
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="min-h-touch-xl"
            onClick={() => handleCall(mockHub.coordinator.phone)}
          >
            <Phone className="w-6 h-6" />
            마을 거점에 전화
          </Button>
        )}

        <Button
          variant="danger"
          size="lg"
          className="min-h-touch-xl"
          onClick={() => handleCall('119')}
        >
            <AlertTriangle className="w-6 h-6" />
            119 응급전화
          </Button>

        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          취소
        </Button>
      </div>
    </Modal>
  );
}
