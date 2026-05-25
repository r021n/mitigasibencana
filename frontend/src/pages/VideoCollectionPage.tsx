import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { videoApi } from "../api/api";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  category: string;
}

const CATEGORIES = [
  { value: "tanah longsor", label: "Tanah Longsor" },
  { value: "angin puting beliung", label: "Angin Puting Beliung" },
  { value: "gempa bumi", label: "Gempa Bumi" },
  { value: "banjir", label: "Banjir" },
  { value: "tsunami", label: "Tsunami" },
  { value: "letusan gunung berapi", label: "Letusan Gunung Berapi" },
];

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoCollectionPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await videoApi.getPublicVideos(page, search, category);
      setVideos(res.data);
      setTotalPages(res.pagination.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-margin-desktop h-16 max-w-container-max mx-auto">
          <Link
            to="/"
            className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight"
          >
            MitigasiBencana
          </Link>
          <nav className="flex items-center gap-gutter">
            <Link
              to="/dashboard"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/videos"
              className="font-label-md text-label-md text-primary bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Kumpulan Video
            </Link>
            <Link
              to="#"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Tentang Kami
            </Link>
          </nav>
          <Link
            to="/register"
            className="block font-label-md text-label-md bg-primary text-on-primary rounded-full px-6 py-2 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:scale-95 active:translate-y-0.5 active:shadow-none font-semibold text-center"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-stack-lg px-margin-desktop min-h-screen bg-surface">
        <div className="max-w-container-max mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="font-display-sm text-display-sm text-on-surface font-bold">
              Kumpulan Video Pembelajaran
            </h1>

            <div className="flex flex-row gap-2 items-center w-full md:w-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center relative flex-1 sm:w-80"
              >
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari video..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface text-on-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md"
                />
              </form>

              <div className="relative min-w-max opacity-70 hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="appearance-none pl-4 pr-10 py-3 bg-surface text-on-surface rounded-xl border border-outline-variant/50 focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md cursor-pointer w-full"
                >
                  <option value="">Semua Kategori</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl pointer-events-none select-none">
                  keyboard_arrow_down
                </span>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-symbols-outlined text-5xl text-primary animate-spin">
                sync
              </span>
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
                videocam_off
              </span>
              <p className="font-body-lg text-body-lg">
                Tidak ada video yang ditemukan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {videos.map((video) => {
                const ytId = getYoutubeId(video.youtubeLink);
                const thumbnailUrl = ytId
                  ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                  : "https://via.placeholder.com/640x360.png?text=No+Thumbnail";

                return (
                  <Link
                    key={video.id}
                    to={`/videos/${video.id}`}
                    className="flex flex-col gap-3 group cursor-pointer"
                  >
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-container-high">
                      <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault doesn't exist
                          if (
                            ytId &&
                            e.currentTarget.src.includes("maxresdefault")
                          ) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-5xl drop-shadow-md">
                          play_circle
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 px-1">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface truncate group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {video.description}
                      </p>
                      <span className="inline-block mt-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md w-max">
                        {video.category}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && (
            <div className="flex justify-center items-center gap-2 pt-8">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded-full hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-on-surface"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.max(1, totalPages) },
                  (_, i) => i + 1,
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-full font-label-md flex items-center justify-center transition-colors ${
                      page === p
                        ? "bg-primary text-on-primary font-bold shadow-md"
                        : "text-on-surface hover:bg-surface-container-highest"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-full hover:bg-surface-container-highest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-on-surface"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
