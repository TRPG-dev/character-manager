import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { Auth0ProviderWrapper } from './auth/Auth0Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWrapper>
        <App />
      </Auth0ProviderWrapper>
    </BrowserRouter>
  </StrictMode>,
)
