import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { videoApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch with a large limit (e.g. 100) to get all public videos for category grouping
      const res = await videoApi.getPublicVideos(1, search, category, 100);
      setVideos(res.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  return (
    <>
      <TopNavbar />

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

          {/* Videos Grouped by Category in Rows */}
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
            <div className="space-y-12">
              {CATEGORIES.filter((c) => !category || c.value === category).map((c) => {
                const categoryVideos = videos.filter((v) => v.category === c.value);
                if (categoryVideos.length === 0) return null;

                // Detect category icon
                let iconName = "video_library";
                if (c.value === "tanah longsor") iconName = "landslide";
                else if (c.value === "angin puting beliung") iconName = "cyclone";
                else if (c.value === "gempa bumi") iconName = "earthquake";
                else if (c.value === "banjir") iconName = "flood";
                else if (c.value === "tsunami") iconName = "tsunami";
                else if (c.value === "letusan gunung berapi") iconName = "volcano";

                return (
                  <section key={c.value} className="space-y-4">
                    {/* Category Title Header */}
                    <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-2.5">
                      <span
                        className="material-symbols-outlined text-primary text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {iconName}
                      </span>
                      <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface capitalize">
                        {c.label}
                      </h2>
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                        {categoryVideos.length} Video
                      </span>
                    </div>

                    {/* Horizontal Scroll Row */}
                    <div className="flex flex-row overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin hover-scrollbar">
                      {categoryVideos.map((video) => {
                        const ytId = getYoutubeId(video.youtubeLink);
                        const thumbnailUrl = ytId
                          ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                          : "https://via.placeholder.com/640x360.png?text=No+Thumbnail";

                        return (
                          <Link
                            key={video.id}
                            to={`/videos/${video.id}`}
                            className="flex flex-col gap-3 group cursor-pointer w-[280px] sm:w-[320px] shrink-0 snap-start"
                          >
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-container-high shadow-sm border border-outline-variant/10">
                              <img
                                src={thumbnailUrl}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
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
                              <h3 className="font-title-md text-title-md text-on-surface truncate group-hover:text-primary transition-colors font-bold">
                                {video.title}
                              </h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 min-h-[40px]">
                                {video.description}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
