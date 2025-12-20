import type { ReactNode } from 'react';

interface IconTextProps {
  icon: ReactNode;
  children: ReactNode;
}

export const IconText = ({ icon, children }: IconTextProps) => {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span aria-hidden style={{ display: 'inline-flex' }}>
        {icon}
      </span>
      <span>{children}</span>
    </span>
  );
};

