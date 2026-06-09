import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { materialApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

const MateriListPage = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Persistent Player States
  const [activeAudio, setActiveAudio] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Play audio when activeAudio changes
  useEffect(() => {
    if (activeAudio && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
        });
    }
  }, [activeAudio]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getAll();
      // Hanya tampilkan materi yang berstatus publish
      const published = data.filter((m: any) => m.status === "publish");
      setMaterials(published);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tanah longsor":
        return "landslide";
      case "angin puting beliung":
        return "cyclone";
      case "gempa bumi":
        return "earthquake";
      case "banjir":
        return "flood";
      case "tsunami":
        return "tsunami";
      case "letusan gunung berapi":
        return "volcano";
      default:
        return "book_5";
    }
  };

  // Persistent Player Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => console.error(err));
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = parseFloat(e.target.value);
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = parseFloat(e.target.value);
    audioRef.current.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
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

  const handlePlayCard = (e: React.MouseEvent, materi: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeAudio?.id === materi.id) {
      togglePlay();
    } else {
      setActiveAudio(materi);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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

  return (
    <>
      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col relative">
        <div className="max-w-container-max mx-auto px-margin-desktop flex-grow w-full flex flex-col">
          <div className="text-center mb-12">
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold mb-4">
              Materi Pembelajaran
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Tingkatkan pemahaman Anda tentang mitigasi bencana melalui berbagai
              materi edukatif yang tersedia.
            </p>
          </div>

          {materials.length === 0 ? (
            <div className="text-center bg-surface-container-lowest rounded-[2rem] p-12 border border-outline-variant/20 shadow-[0_8px_24px_rgba(11,28,48,0.04)] max-w-lg mx-auto mt-8">
              <span
                className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 select-none opacity-60"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                book_5
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Belum Ada Materi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Materi pembelajaran sedang disiapkan dan akan segera tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pb-24">
              {materials.map((materi) => {
                const isCurrentActive = activeAudio?.id === materi.id;
                const isCardPlaying = isCurrentActive && isPlaying;
                
                return (
                  <Link
                    key={materi.id}
                    to={`/materi/${materi.id}`}
                    className={`group bg-surface-container-lowest rounded-[1.5rem] p-gutter border shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] flex flex-col h-full cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isCurrentActive 
                        ? "border-primary/40 bg-primary/[0.01]" 
                        : "border-outline-variant/10"
                    }`}
                  >
                    <div className="flex flex-col h-full relative">
                      {/* Header with Disaster Icon (Icon ONLY, no title/text) */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="material-symbols-outlined text-3xl text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                            title={materi.category}
                          >
                            {getCategoryIcon(materi.category)}
                          </span>
                        </div>
                        
                        {/* Play/Pause Button on Card */}
                        {materi.audioUrl && (
                          <button
                            onClick={(e) => handlePlayCard(e, materi)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-none cursor-pointer ${
                              isCardPlaying
                                ? "bg-primary text-on-primary shadow-md"
                                : "bg-primary/10 hover:bg-primary text-primary hover:text-on-primary"
                            }`}
                            title={isCardPlaying ? "Jeda Audio" : "Putar Audio"}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {isCardPlaying ? "pause" : "play_arrow"}
                            </span>
                          </button>
                        )}
                      </div>

                      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 group-hover:text-primary line-clamp-2 leading-tight">
                        {materi.title}
                      </h3>

                      <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-lg opacity-70">
                            person
                          </span>
                          <span>{materi.author?.name || "Tim Edukasi"}</span>
                        </div>
                        <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-lg opacity-70">
                            calendar_month
                          </span>
                          <span>
                            {new Date(materi.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Persistent Audio Player Dock */}
        {activeAudio && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fade-in">
            <div className="bg-surface-container-highest/95 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 select-none">
              
              {/* Left Details: Category Icon & Title */}
              <div className="flex items-center gap-3 min-w-0 max-w-[200px] sm:max-w-[240px]">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {getCategoryIcon(activeAudio.category)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-extrabold truncate">
                    {activeAudio.title}
                  </p>
                  <p className="font-caption text-caption text-on-surface-variant truncate">
                    {activeAudio.author?.name || "Tim Edukasi"}
                  </p>
                </div>
              </div>

              {/* Center Controls & Scrubber */}
              <div className="flex-grow flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md border-none cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-all"
                  title={isPlaying ? "Jeda" : "Putar"}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>

                <div className="flex-grow flex items-center gap-2">
                  <span className="font-mono text-[10px] text-on-surface-variant shrink-0">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrub}
                    className="flex-1 h-1 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-primary outline-none"
                  />
                  <span className="font-mono text-[10px] text-on-surface-variant shrink-0">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Side: Volume & Close */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    className="text-on-surface-variant hover:text-primary transition-colors border-none bg-transparent p-1 cursor-pointer flex items-center justify-center"
                    title={isMuted ? "Bunyikan" : "Senyap"}
                  >
                    <span className="material-symbols-outlined text-lg">
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
                    className="w-12 h-0.5 bg-outline-variant/30 rounded-lg appearance-none cursor-pointer accent-primary outline-none hidden sm:block"
                  />
                </div>

                <div className="h-6 w-px bg-outline-variant/30" />

                <button
                  onClick={() => {
                    setActiveAudio(null);
                    if (audioRef.current) audioRef.current.pause();
                  }}
                  className="text-on-surface-variant hover:text-error transition-colors border-none bg-transparent p-1 cursor-pointer flex items-center justify-center"
                  title="Tutup Pemutar"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden Native Audio Element */}
        <audio
          ref={audioRef}
          src={activeAudio?.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
        />
      </main>
    </>
  );
};

export default MateriListPage;
