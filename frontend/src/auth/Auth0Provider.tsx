import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { AppState } from '@auth0/auth0-react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
const redirectUri = window.location.origin;

export const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
  const navigate = useNavigate();

  if (!domain || !clientId) {
    return <div>Auth0設定が正しくありません。環境変数を確認してください。</div>;
  }

  const onRedirectCallback = (appState?: AppState) => {
    // ログイン後のリダイレクト先を処理
    navigate(appState?.returnTo || '/dashboard', { replace: true });
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email', // emailスコープを追加
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

