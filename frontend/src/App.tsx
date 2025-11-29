import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CharacterCreate } from './pages/CharacterCreate';
import { CharacterDetail } from './pages/CharacterDetail';
import { CharacterEdit } from './pages/CharacterEdit';
import { SharedCharacter } from './pages/SharedCharacter';
import { ToastProvider } from './contexts/ToastContext';
import './App.css';

function LoginPage() {
  const { isLoading, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 既に認証済みの場合はダッシュボードにリダイレクト
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return <div>リダイレクト中...</div>;
  }

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1>TRPGキャラクターシート保管・作成サービス</h1>
      <p style={{ marginBottom: '2rem' }}>ログインしてご利用ください</p>
      <button
        onClick={login}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1.125rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ログイン
      </button>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ToastProvider>
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters/new"
        element={
          <ProtectedRoute>
            <CharacterCreate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters/:id"
        element={
          <ProtectedRoute>
            <CharacterDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/characters/:id/edit"
        element={
          <ProtectedRoute>
            <CharacterEdit />
          </ProtectedRoute>
        }
      />
      <Route path="/share/:token" element={<SharedCharacter />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ToastProvider>
  );
}

export default App
