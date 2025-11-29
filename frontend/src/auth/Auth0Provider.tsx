import { Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
const redirectUri = window.location.origin;

export const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
  if (!domain || !clientId) {
    return <div>Auth0設定が正しくありません。環境変数を確認してください。</div>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
};

