import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// 🔥 Chìa khóa Google chính chủ của Huy
const GOOGLE_CLIENT_ID = "144605020113-nb17vrt13o84sso316iaeve9p2ghnct3.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Bọc Provider để toàn bộ App dùng được đăng nhập Google */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)