import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { materialApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

interface MaterialSection {
  id: string;
  type: "paragraph" | "heading" | "list" | "image";
  content: string;
  timestamp: number;
}

const MateriDetailPage = () => {
  const { id } = useParams();
  const [materi, setMateri] = useState<any>(null);
  const [sections, setSections] = useState<MaterialSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);


  useEffect(() => {
    fetchMateri();
  }, [id]);

  useEffect(() => {
    // Reset player state if material changes or unmounts
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [id]);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getById(id as string);
      setMateri(data);

      // Parse content into sections
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        } else {
          throw new Error("Legacy format");
        }
      } catch (e) {
        // Fallback for legacy HTML content
        setSections([
          {
            id: "legacy-html",
            type: "paragraph",
            content: data.content || "",
            timestamp: 0,
          },
        ]);
      }
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

  const getActiveSectionId = () => {
    let activeId = "";
    let maxTimestamp = -1;

    for (const section of sections) {
      if (section.timestamp <= currentTime && section.timestamp > maxTimestamp) {
        maxTimestamp = section.timestamp;
        activeId = section.id;
      }
    }
    return activeId;
  };

  const activeSectionId = getActiveSectionId();

  const prevActiveIdRef = useRef("");

  useEffect(() => {
    if (activeSectionId && activeSectionId !== prevActiveIdRef.current && isPlaying) {
      prevActiveIdRef.current = activeSectionId;
      const element = document.getElementById(`section-${activeSectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSectionId, isPlaying]);

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
      <style>{`
        .materi-prose {
          font-family: 'Inter', sans-serif;
          color: var(--color-on-surface-variant, #434655);
          font-size: 1.125rem;
          line-height: 1.8;
          letter-spacing: -0.003em;
        }
        
        .active-section-highlight {
          background-color: rgba(0, 74, 198, 0.05) !important;
          border-left-color: var(--color-primary, #004ac6) !important;
          transform: translateX(4px);
          box-shadow: 0 4px 20px rgba(0, 74, 198, 0.04);
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
            <h1 className="font-display-lg text-[3rem] text-on-surface leading-tight font-extrabold tracking-tight mb-4">
              {materi.title}
            </h1>

            {/* Author / Metadata (Medium-style) */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-outline-variant/20">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shadow-inner select-none shrink-0">
                {materi.author?.name
                  ? materi.author.name.charAt(0).toUpperCase()
                  : "T"}
              </div>

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
                  <span className="bg-primary/5 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-fixed-dim/20 select-none uppercase font-mono">
                    {materi.category || "mitigasi bencana"}
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

            {/* Combined Audio Player (on top of content) */}
            {materi.audioUrl && (
              <div className="w-full bg-gradient-to-br from-surface-container/30 via-surface-container-low to-surface-container-highest border border-outline-variant/20 rounded-[2rem] p-6 clay-card flex flex-col items-center justify-center relative overflow-hidden shadow-md mb-10 select-none">
                {/* Decorative pulsating background rings when playing */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`absolute w-[240px] h-[240px] rounded-full bg-primary/5 transition-all duration-1000 ${isPlaying ? 'scale-110 animate-ping' : 'scale-100'}`} style={{ animationDuration: '3s' }} />
                  <div className={`absolute w-[180px] h-[180px] rounded-full bg-primary/5 transition-all duration-1000 ${isPlaying ? 'scale-125 animate-pulse' : 'scale-100'}`} />
                </div>

                <div className="flex flex-row w-full items-center justify-between gap-6 z-10">
                  {/* Waveform visualizer & details */}
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 bg-primary text-on-primary rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_6px_20px_rgba(0,74,198,0.25)] flex items-center justify-center cursor-pointer border-none shrink-0"
                      title={isPlaying ? "Jeda" : "Putar"}
                    >
                      <span className="material-symbols-outlined text-3xl select-none">
                        {isPlaying ? "pause" : "play_arrow"}
                      </span>
                    </button>
                    <div className="flex flex-col flex-grow truncate">
                      <p className="font-label-md text-label-md text-on-surface-variant font-bold uppercase tracking-wider">
                        Mendengarkan Materi
                      </p>
                      <p className="font-title-sm text-title-sm text-on-surface font-extrabold truncate max-w-[280px]">
                        {materi.title}
                      </p>
                    </div>
                  </div>

                  {/* Waveform bars */}
                  <div className="hidden sm:flex items-end gap-1 h-8 shrink-0">
                    {[
                      { delay: '0s', color: 'bg-primary' },
                      { delay: '0.15s', color: 'bg-primary-container' },
                      { delay: '0.3s', color: 'bg-secondary' },
                      { delay: '0.45s', color: 'bg-secondary-fixed-dim' },
                      { delay: '0.6s', color: 'bg-primary' },
                      { delay: '0.75s', color: 'bg-primary-container' },
                      { delay: '0.9s', color: 'bg-secondary' },
                      { delay: '0.15s', color: 'bg-secondary-fixed-dim' },
                    ].map((bar, idx) => (
                      <div
                        key={idx}
                        className={`w-1.5 rounded-full ${bar.color} ${isPlaying ? 'anim-bar-' + ((idx % 4) + 1) : 'h-2'}`}
                        style={{
                          animationDelay: isPlaying ? bar.delay : '0s',
                          transformOrigin: 'bottom',
                        }}
                      />
                    ))}
                  </div>

                  {/* Skip and Volume Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                        }
                      }}
                      className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                      title="Mundur 10 Detik"
                    >
                      <span className="material-symbols-outlined text-2xl">replay_10</span>
                    </button>

                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                        }
                      }}
                      className="p-2 text-on-surface-variant hover:text-primary rounded-full transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                      title="Maju 10 Detik"
                    >
                      <span className="material-symbols-outlined text-2xl">forward_10</span>
                    </button>

                    <div className="h-6 w-px bg-outline-variant/30" />

                    <div className="flex items-center gap-1">
                      <button
                        onClick={toggleMute}
                        className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent p-1 flex items-center justify-center"
                        title={isMuted ? "Bunyikan" : "Senyap"}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isMuted || volume === 0 ? "volume_off" : volume < 0.5 ? "volume_down" : "volume_up"}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scrubber and Time Tracker */}
                <div className="w-full flex flex-col gap-1 z-10 mt-4">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrub}
                    className="w-full h-1 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  />
                  <div className="flex justify-between font-caption text-caption text-on-surface-variant text-[11px] mt-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">info</span>
                      <span>Klik paragraf di bawah untuk lompat ke bagian audio tersebut</span>
                    </span>
                    <span>{formatTime(duration)}</span>
                  </div>
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

            {/* Reading Content Sections with Dynamic Highlight */}
            <div className="materi-prose w-full space-y-6">
              {sections.map((section) => {
                const isActive = section.id === activeSectionId && isPlaying;
                
                const handleSectionClick = () => {
                  if (audioRef.current && materi.audioUrl) {
                    audioRef.current.currentTime = section.timestamp;
                    setCurrentTime(section.timestamp);
                    if (!isPlaying) {
                      audioRef.current.play().then(() => {
                        setIsPlaying(true);
                      }).catch(err => console.error("Error seeking and playing:", err));
                    }
                  }
                };

                // Section styling
                const sectionBaseStyle = "transition-all duration-300 border-l-4 border-transparent p-3 -mx-3 rounded-r-xl select-text";
                const activeStyle = isActive ? "active-section-highlight" : "";
                const hoverStyle = materi.audioUrl ? "cursor-pointer hover:bg-surface-container-low/30" : "";
                
                const classNames = `${sectionBaseStyle} ${activeStyle} ${hoverStyle}`;

                if (section.type === "heading") {
                  return (
                    <h2
                      key={section.id}
                      id={`section-${section.id}`}
                      onClick={handleSectionClick}
                      className={`text-2xl font-bold text-on-surface pt-4 ${classNames}`}
                    >
                      {section.content}
                    </h2>
                  );
                } else if (section.type === "list") {
                  const items = section.content.split("\n").filter(i => i.trim() !== "");
                  return (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      onClick={handleSectionClick}
                      className={classNames}
                    >
                      <ul className="list-disc pl-5 space-y-2 my-0">
                        {items.map((item, idx) => (
                          <li key={idx} className="text-on-surface-variant">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                } else if (section.type === "image") {
                  return (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      onClick={handleSectionClick}
                      className={`w-full flex justify-center ${classNames}`}
                    >
                      {section.content ? (
                        <img
                          src={section.content}
                          alt="Materi ilustrasi"
                          className="max-w-full h-auto rounded-2xl max-h-[400px] object-contain shadow-md"
                        />
                      ) : (
                        <div className="text-on-surface-variant italic text-sm">Gambar kosong</div>
                      )}
                    </div>
                  );
                } else {
                  // paragraph (supports legacy HTML format as well)
                  const isHtml = /<[a-z][\s\S]*>/i.test(section.content);
                  return (
                    <div
                      key={section.id}
                      id={`section-${section.id}`}
                      onClick={handleSectionClick}
                      className={classNames}
                    >
                      {isHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      ) : (
                        <p className="text-on-surface-variant m-0">{section.content}</p>
                      )}
                    </div>
                  );
                }
              })}
            </div>
          </article>
        </div>
      </main>

      {/* Floating Focus Button */}
      {isPlaying && activeSectionId && (
        <button
          onClick={() => {
            const element = document.getElementById(`section-${activeSectionId}`);
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary font-label-md text-label-md px-5 py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,74,198,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-none cursor-pointer hover:brightness-110"
          title="Lompat ke bagian yang sedang diputar"
        >
          <span className="material-symbols-outlined text-lg">my_location</span>
          <span>Fokus Bagian Aktif</span>
        </button>
      )}
    </>
  );
};

export default MateriDetailPage;
