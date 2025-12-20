import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../auth/useAuth';
import { IconText } from './IconText';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <Link to="/dashboard" style={{ color: 'var(--color-text-inverse)', textDecoration: 'none' }}>
          <h1 style={{ margin: 0 }}>きゃらまね</h1>
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'var(--color-text-inverse)', textDecoration: 'none' }}>
            <IconText icon={<FiHome />}>マイページ</IconText>
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'color-mix(in srgb, var(--color-primary) 75%, black)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <IconText icon={<FiLogOut />}>ログアウト</IconText>
          </button>
        </nav>
      </header>
      <main style={{ flex: 1, padding: '2rem', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};

