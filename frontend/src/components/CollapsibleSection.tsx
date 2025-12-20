import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection = ({ title, children, defaultOpen = true }: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{
      marginBottom: '1.5rem',
      border: '1px solid var(--color-border)',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '1rem',
          backgroundColor: 'var(--color-surface-muted)',
          border: 'none',
          borderBottom: isOpen ? '1px solid var(--color-border)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '1.125rem',
          fontWeight: 'bold',
          color: 'var(--color-text)',
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '1.5rem', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};






