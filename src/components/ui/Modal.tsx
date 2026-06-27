import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showClose?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  showClose = true,
  size = 'md',
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-surface-card rounded-2xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-auto shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showClose) && (
          <div className="flex items-center justify-between p-6 border-b border-line">
            {title && <h2 className="text-h2 font-bold text-ink">{title}</h2>}
            {showClose && (
              <button
                onClick={onClose}
                className="min-h-touch min-w-touch rounded-full hover:bg-surface-muted
                           flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6 text-ink-muted" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
