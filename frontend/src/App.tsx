import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UserInfoPage from './pages/UserInfoPage';
import VideoCollectionPage from './pages/VideoCollectionPage';
import VideoViewPage from './pages/VideoViewPage';
import { useAuthStore } from './store/authStore';
import { useAccessibilityStore } from './store/accessibilityStore';
import InclusionWidget from './components/ui/InclusionWidget';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const fontSizeScale = useAccessibilityStore((state) => state.fontSizeScale);
  const lineHeightScale = useAccessibilityStore((state) => state.lineHeightScale);
  const useLargeCursor = useAccessibilityStore((state) => state.useLargeCursor);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Terapkan skala huruf dan jarak baris secara dinamis ke variabel CSS root
  useEffect(() => {
    document.documentElement.style.setProperty('--accessibility-font-scale', String(fontSizeScale));
    document.documentElement.style.setProperty('--accessibility-line-height-scale', String(lineHeightScale));
  }, [fontSizeScale, lineHeightScale]);

  // Terapkan kursor besar secara global jika diaktifkan
  useEffect(() => {
    if (useLargeCursor) {
      document.documentElement.classList.add('large-cursor');
    } else {
      document.documentElement.classList.remove('large-cursor');
    }
  }, [useLargeCursor]);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/videos" element={<VideoCollectionPage />} />
        <Route path="/videos/:id" element={<VideoViewPage />} />
        <Route path="/settings" element={<UserInfoPage />} />
      </Routes>
      <InclusionWidget />
    </div>
  );
}

export default App;
