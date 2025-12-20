import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/useAuth';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CharacterCreate } from './pages/CharacterCreate';
import { CharacterDetail } from './pages/CharacterDetail';
import { CharacterEdit } from './pages/CharacterEdit';
import { SharedCharacter } from './pages/SharedCharacter';
import { Landing } from './pages/Landing';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingSpinner } from './components/LoadingSpinner';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="認証状態を確認中..." />;
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
      <Route path="/" element={<Landing />} />
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

export default App;
