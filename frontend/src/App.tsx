import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import UserInfoPage from './pages/UserInfoPage';
import VideoCollectionPage from './pages/VideoCollectionPage';
import VideoViewPage from './pages/VideoViewPage';
import VideoAnalysisPage from './pages/VideoAnalysisPage';
import MateriListPage from './pages/MateriListPage';
import MateriDetailPage from './pages/MateriDetailPage';
import MateriManagementPage from './pages/MateriManagementPage';
import MateriEditorPage from './pages/MateriEditorPage';
import InteractiveQuestionsPage from './pages/InteractiveQuestionsPage';
import AboutPage from './pages/AboutPage';
import { useAuthStore } from './store/authStore';
import { useAccessibilityStore } from './store/accessibilityStore';
import InclusionWidget from './components/ui/InclusionWidget';

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const {
    fontSizeScale,
    lineHeightScale,
    letterSpacing,
    useLargeCursor,
    fontBold,
    readableFont,
    ttsOnHover,
    monochrome,
    highlightInteractive,
  } = useAccessibilityStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Terapkan skala huruf, jarak baris, dan spasi huruf secara dinamis ke variabel CSS root
  useEffect(() => {
    document.documentElement.style.setProperty('--accessibility-font-scale', String(fontSizeScale));
    document.documentElement.style.setProperty('--accessibility-line-height-scale', String(lineHeightScale));
    document.documentElement.style.setProperty('--accessibility-letter-spacing', `${letterSpacing}px`);
  }, [fontSizeScale, lineHeightScale, letterSpacing]);

  // Terapkan kursor besar secara global jika diaktifkan
  useEffect(() => {
    if (useLargeCursor) {
      document.documentElement.classList.add('large-cursor');
    } else {
      document.documentElement.classList.remove('large-cursor');
    }
  }, [useLargeCursor]);

  // Terapkan teks tebal secara global jika diaktifkan
  useEffect(() => {
    if (fontBold) {
      document.documentElement.classList.add('accessibility-bold');
    } else {
      document.documentElement.classList.remove('accessibility-bold');
    }
  }, [fontBold]);

  // Terapkan font readable (sans-serif tebal) secara global jika diaktifkan
  useEffect(() => {
    if (readableFont) {
      document.documentElement.classList.add('accessibility-readable-font');
    } else {
      document.documentElement.classList.remove('accessibility-readable-font');
    }
  }, [readableFont]);

  // Terapkan mode monokrom secara global jika diaktifkan
  useEffect(() => {
    if (monochrome) {
      document.documentElement.classList.add('accessibility-monochrome');
    } else {
      document.documentElement.classList.remove('accessibility-monochrome');
    }
  }, [monochrome]);

  // Terapkan sorot link / elemen interaktif jika diaktifkan
  useEffect(() => {
    if (highlightInteractive) {
      document.documentElement.classList.add('accessibility-highlight-interactive');
    } else {
      document.documentElement.classList.remove('accessibility-highlight-interactive');
    }
  }, [highlightInteractive]);

  // Terapkan Text to Speech (TTS) ketika hover tulisan dengan bahasa Indonesia
  useEffect(() => {
    if (!ttsOnHover) {
      window.speechSynthesis.cancel();
      return;
    }

    let lastSpokenElement: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === lastSpokenElement) return;

      // Jangan jalankan TTS jika di dalam widget aksesibilitas
      if (target.closest('.inclusion-widget-isolated')) return;

      const text = target.innerText || target.textContent;
      const cleanText = text?.trim();

      if (cleanText) {
        // Hindari membaca container besar yang berisi banyak elemen anak secara utuh
        const ignoredTags = ['BODY', 'HTML', 'MAIN', 'SECTION', 'ARTICLE', 'DIV', 'UL', 'OL', 'TABLE', 'TR', 'THEAD', 'TBODY'];
        if (ignoredTags.includes(target.tagName) && target.children.length > 0) {
          return;
        }

        lastSpokenElement = target;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'id-ID';

        // Cari suara bahasa Indonesia jika tersedia
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
        if (idVoice) {
          utterance.voice = idVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (e.target === lastSpokenElement) {
        window.speechSynthesis.cancel();
        lastSpokenElement = null;
      }
    };

    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      window.speechSynthesis.cancel();
    };
  }, [ttsOnHover]);

  return (
    <SimpleBar style={{ height: '100vh' }} autoHide={true}>
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
        <div className="app-main-content flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/videos/:id/questions" element={<InteractiveQuestionsPage />} />
            <Route path="/videos" element={<VideoCollectionPage />} />
            <Route path="/videos/:id" element={<VideoViewPage />} />
            <Route path="/settings" element={<UserInfoPage />} />
            <Route path="/analysis" element={<VideoAnalysisPage />} />
            <Route path="/materi" element={<MateriListPage />} />
            <Route path="/materi/:id" element={<MateriDetailPage />} />
            <Route path="/admin/materi" element={<MateriManagementPage />} />
            <Route path="/admin/materi/editor" element={<MateriEditorPage />} />
            <Route path="/admin/materi/editor/:id" element={<MateriEditorPage />} />
          </Routes>
        </div>
        <InclusionWidget />
      </div>
    </SimpleBar>
  );
}

export default App;
