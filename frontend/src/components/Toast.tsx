import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const backgroundColor =
    type === 'success' ? 'var(--color-success)' :
    type === 'error' ? 'var(--color-danger)' :
    type === 'warning' ? 'var(--color-warning)' :
    'var(--color-info)';

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        backgroundColor,
        color: 'var(--color-text-inverse)',
        padding: '1rem 1.5rem',
        borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 'var(--z-toast)',
        minWidth: '250px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-inverse)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

