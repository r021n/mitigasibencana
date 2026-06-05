import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { materialApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

const MateriDetailPage = () => {
  const { id } = useParams();
  const [materi, setMateri] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState<"read" | "listen">("read");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetchMateri();
  }, [id]);

  useEffect(() => {
    // Reset player state if mode changes or unmounts
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [mode]);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getById(id as string);
      setMateri(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat materi");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Error playing audio:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = parseFloat(e.target.value);
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const value = parseFloat(e.target.value);
    audioRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  if (loading) {
    return (
      <>
        <TopNavbar />
        <div className="flex justify-center items-center h-screen bg-surface">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            sync
          </span>
        </div>
      </>
    );
  }

  if (error || !materi) {
    return (
      <>
        <TopNavbar />
        <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col justify-between">
          <div className="max-w-md mx-auto px-6 py-16 text-center w-full flex-grow flex flex-col justify-center items-center">
            <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0_12px_30px_rgba(0,74,198,0.08),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/20 w-full">
              <span className="material-symbols-outlined text-6xl text-error mb-4 select-none">
                error
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">
                Materi Tidak Ditemukan
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                {error || "Berkas atau materi pembelajaran yang Anda cari tidak tersedia."}
              </p>
              <Link
                to="/materi"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold font-label-md text-label-md px-6 py-3 rounded-full shadow-[0_6px_16px_rgba(0,74,198,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)] hover:brightness-105"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Kembali ke Daftar Materi
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Scope Typography Custom Styling for Medium Aesthetic */}
      <style>{`
        .materi-prose {
          font-family: 'Inter', sans-serif;
          color: var(--color-on-surface-variant, #434655);
          font-size: 1.125rem;
          line-height: 1.8;
          letter-spacing: -0.003em;
        }
        .materi-prose p {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }
        .materi-prose h1,
        .materi-prose h2,
        .materi-prose h3,
        .materi-prose h4 {
          font-family: 'Montserrat', sans-serif;
          color: var(--color-on-surface, #0b1c30);
          font-weight: 700;
          line-height: 1.25;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .materi-prose h1 { font-size: 2.25rem; }
        .materi-prose h2 { font-size: 1.75rem; border-bottom: 1px solid rgba(195, 198, 215, 0.2); padding-bottom: 0.5rem; }
        .materi-prose h3 { font-size: 1.4rem; }
        .materi-prose h4 { font-size: 1.2rem; }
        
        .materi-prose ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .materi-prose ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .materi-prose li {
          margin-bottom: 0.5rem;
        }
        .materi-prose blockquote {
          border-left: 4px solid var(--color-primary, #004ac6);
          padding-left: 1.5rem;
          margin-left: 0;
          margin-right: 0;
          margin-top: 2rem;
          margin-bottom: 2rem;
          font-style: italic;
          color: var(--color-on-surface, #0b1c30);
          font-size: 1.25rem;
          line-height: 1.6;
        }
        .materi-prose a {
          color: var(--color-primary, #004ac6);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .materi-prose a:hover {
          opacity: 0.8;
        }
        .materi-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin-top: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
        }
        .materi-prose hr {
          border: 0;
          border-top: 1px solid var(--color-outline-variant, #c3c6d7);
          opacity: 0.3;
          margin-top: 3rem;
          margin-bottom: 3rem;
        }
        .materi-prose code {
          background-color: var(--color-surface-container-low, #eff4ff);
          color: var(--color-primary, #004ac6);
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          font-family: monospace;
        }
        .materi-prose pre {
          background-color: var(--color-inverse-surface, #213145);
          color: var(--color-inverse-on-surface, #eaf1ff);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .materi-prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }

        /* Waveform bounce keyframe animations */
        @keyframes bounce-bar-1 {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(0.75); }
        }
        @keyframes bounce-bar-2 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(0.95); }
        }
        @keyframes bounce-bar-3 {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(0.6); }
        }
        @keyframes bounce-bar-4 {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
        .anim-bar-1 { animation: bounce-bar-1 1s ease-in-out infinite; }
        .anim-bar-2 { animation: bounce-bar-2 1.2s ease-in-out infinite; }
        .anim-bar-3 { animation: bounce-bar-3 0.8s ease-in-out infinite; }
        .anim-bar-4 { animation: bounce-bar-4 1.1s ease-in-out infinite; }
      `}</style>

      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col justify-between">
        <div className="max-w-3xl mx-auto px-6 w-full flex-grow flex flex-col">
          {/* Back Button */}
          <Link
            to="/materi"
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md mb-8"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            Kembali ke Daftar Materi
          </Link>

          {/* Article Wrapper */}
          <article className="w-full">
            {/* Title */}
            <h1 className="font-display-lg text-[3rem] text-on-surface leading-tight font-extrabold tracking-tight mb-8">
              {materi.title}
            </h1>

            {/* Author / Metadata (Medium-style) */}
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-outline-variant/20">
              {/* Circular Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shadow-inner select-none shrink-0">
                {materi.author?.name
                  ? materi.author.name.charAt(0).toUpperCase()
                  : "T"}
              </div>

              {/* Meta details */}
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-lg font-bold text-on-surface">
                    {materi.author?.name || "Tim Edukasi"}
                  </span>
                  {materi.status === "draft" && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                      Draft
                    </span>
                  )}
                  <span className="bg-primary/5 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-fixed-dim/20 select-none">
                    Materi Edukasi
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  <span>Dipublikasikan pada</span>
                  <span>•</span>
                  <span>
                    {new Date(materi.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab/Switch Pill if audio is available */}
            {materi.audioUrl && (
              <div className="flex justify-center mb-10 select-none">
                <div className="inline-flex bg-surface-container-low border border-outline-variant/30 rounded-2xl p-1.5 gap-1.5 shadow-inner">
                  <button
                    onClick={() => setMode("read")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer font-bold border-none ${
                      mode === "read"
                        ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(0,74,198,0.2)]"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">menu_book</span>
                    Baca Materi
                  </button>
                  <button
                    onClick={() => setMode("listen")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-label-md text-label-md transition-all cursor-pointer font-bold border-none ${
                      mode === "listen"
                        ? "bg-primary text-on-primary shadow-[0_4px_12px_rgba(0,74,198,0.2)]"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">headphones</span>
                    Dengarkan Materi
                  </button>
                </div>
              </div>
            )}

            {/* Content Switcher */}
            {mode === "read" ? (
              /* Content (HTML from Editor) */
              <div className="materi-prose w-full">
                <div dangerouslySetInnerHTML={{ __html: materi.content }} />
              </div>
            ) : (
              /* Immersive Custom Audio Player */
              <div className="w-full bg-gradient-to-br from-surface-container/40 via-surface-container-low to-surface-container-highest border border-outline-variant/20 rounded-[2rem] p-8 clay-card flex flex-col items-center justify-center relative overflow-hidden shadow-lg mb-10 select-none">
                {/* Decorative pulsating background rings when playing */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`absolute w-[280px] h-[280px] rounded-full bg-primary/5 transition-all duration-1000 ${isPlaying ? 'scale-110 animate-ping' : 'scale-100'}`} style={{ animationDuration: '3s' }} />
                  <div className={`absolute w-[200px] h-[200px] rounded-full bg-primary/5 transition-all duration-1000 ${isPlaying ? 'scale-125 animate-pulse' : 'scale-100'}`} />
                </div>

                {/* Headphones Circle Graphic */}
                <div className="relative mb-6 z-10">
                  <div className={`w-28 h-28 rounded-full bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center shadow-inner transition-all duration-500 ${isPlaying ? 'scale-105 rotate-6' : 'scale-100'}`}>
                    <span className="material-symbols-outlined text-5xl text-primary animate-pulse" style={{ animationDuration: isPlaying ? '2s' : '0s' }}>
                      headphones
                    </span>
                  </div>
                </div>

                {/* Text Details */}
                <div className="text-center z-10 max-w-md mb-8">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-extrabold line-clamp-1 mb-1">
                    {materi.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Diputar oleh {materi.author?.name || "Tim Edukasi"}
                  </p>
                </div>

                {/* Waveform/Visualizer Bars */}
                <div className="flex items-end gap-1.5 h-16 mb-8 z-10">
                  {[
                    { delay: '0s', color: 'bg-primary' },
                    { delay: '0.15s', color: 'bg-primary-container' },
                    { delay: '0.3s', color: 'bg-secondary' },
                    { delay: '0.45s', color: 'bg-secondary-fixed-dim' },
                    { delay: '0.6s', color: 'bg-primary' },
                    { delay: '0.75s', color: 'bg-primary-container' },
                    { delay: '0.9s', color: 'bg-secondary' },
                    { delay: '0.15s', color: 'bg-secondary-fixed-dim' },
                    { delay: '0.3s', color: 'bg-primary' },
                    { delay: '0.45s', color: 'bg-primary-container' },
                  ].map((bar, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 rounded-full ${bar.color} ${isPlaying ? 'anim-bar-' + ((idx % 4) + 1) : 'h-3'}`}
                      style={{
                        animationDelay: isPlaying ? bar.delay : '0s',
                        transformOrigin: 'bottom',
                      }}
                    />
                  ))}
                </div>

                {/* Scrubber and Time Tracker */}
                <div className="w-full max-w-md flex flex-col gap-2 z-10 mb-6">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrub}
                    className="w-full h-2 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <div className="flex justify-between font-caption text-caption text-on-surface-variant">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Custom Audio Control Buttons */}
                <div className="flex items-center gap-6 z-10">
                  {/* Skip Backward 10s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                      }
                    }}
                    className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                    title="Mundur 10 Detik"
                  >
                    <span className="material-symbols-outlined text-3xl">replay_10</span>
                  </button>

                  {/* Play/Pause Main Button */}
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 bg-primary text-on-primary rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_6px_20px_rgba(0,74,198,0.3)] flex items-center justify-center cursor-pointer border-none clay-btn"
                    title={isPlaying ? "Jeda" : "Putar"}
                  >
                    <span className="material-symbols-outlined text-4xl select-none">
                      {isPlaying ? "pause" : "play_arrow"}
                    </span>
                  </button>

                  {/* Skip Forward 10s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                      }
                    }}
                    className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                    title="Maju 10 Detik"
                  >
                    <span className="material-symbols-outlined text-3xl">forward_10</span>
                  </button>
                </div>

                {/* Volume Controls */}
                <div className="flex items-center gap-2 mt-8 z-10 w-full max-w-[200px]">
                  <button
                    onClick={toggleMute}
                    className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-1 flex items-center justify-center"
                    title={isMuted ? "Bunyikan" : "Senyap"}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {isMuted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                    </span>
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-outline-variant/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                </div>

                {/* Hidden Native Audio Element */}
                <audio
                  ref={audioRef}
                  src={materi.audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                />
              </div>
            )}
          </article>
        </div>
      </main>
    </>
  );
};

export default MateriDetailPage;
