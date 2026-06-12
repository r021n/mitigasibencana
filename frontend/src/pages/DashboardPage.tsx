import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { videoApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";
import VideoFormModal from "../components/layout/dashboard/VideoFormModal";
import DeleteVideoModal from "../components/layout/dashboard/DeleteVideoModal";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  category: string;
  status: "publish" | "draft";
  icon: string;
  seriesOrder: number;
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <DashboardInner />
    </SidebarProvider>
  );
}

function DashboardInner() {
  const { open } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [videos, setVideos] = useState<Video[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Video Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<Video | null>(null);

  // Delete Video Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to assign Material symbols based on category and title keywords
  const detectIcon = (category: string, title: string): string => {
    const lowerCategory = (category || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();

    // Prioritize category matching
    if (lowerCategory.includes("tsunami")) return "tsunami";
    if (
      lowerCategory.includes("gunung") ||
      lowerCategory.includes("volcano") ||
      lowerCategory.includes("letusan")
    )
      return "volcano";
    if (lowerCategory.includes("banjir") || lowerCategory.includes("flood"))
      return "flood";
    if (lowerCategory.includes("gempa") || lowerCategory.includes("earthquake"))
      return "earthquake";
    if (
      lowerCategory.includes("longsor") ||
      lowerCategory.includes("landslide")
    )
      return "landslide";
    if (
      lowerCategory.includes("angin") ||
      lowerCategory.includes("cyclone") ||
      lowerCategory.includes("puting")
    )
      return "cyclone";

    // Fallback to title keywords
    if (lowerTitle.includes("tsunami")) return "tsunami";
    if (
      lowerTitle.includes("volcano") ||
      lowerTitle.includes("gunung") ||
      lowerTitle.includes("ash") ||
      lowerTitle.includes("abu")
    )
      return "volcano";
    if (lowerTitle.includes("flood") || lowerTitle.includes("banjir"))
      return "flood";
    if (lowerTitle.includes("earthquake") || lowerTitle.includes("gempa"))
      return "earthquake";
    if (lowerTitle.includes("landslide") || lowerTitle.includes("longsor"))
      return "landslide";
    if (
      lowerTitle.includes("wind") ||
      lowerTitle.includes("angin") ||
      lowerTitle.includes("tornado") ||
      lowerTitle.includes("cyclone")
    )
      return "cyclone";
    return "video_library"; // default fallback
  };

  const fetchVideos = async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await videoApi.getAll(search);
      const mapped = data.map((v: any) => ({
        ...v,
        icon: detectIcon(v.category, v.title),
      }));
      setVideos(mapped);
    } catch (err) {
      console.error("Gagal mengambil data video:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  React.useEffect(() => {
    if (user) {
      fetchVideos(searchQuery);
    }
  }, [searchQuery, user]);

  const handleAddClick = () => {
    setModalVideo(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (video: Video) => {
    setModalVideo(video);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalVideo(null);
  };

  const handleUpdateOrder = async (id: string, newOrder: number) => {
    if (newOrder < 0) return;
    try {
      await videoApi.edit(id, { seriesOrder: newOrder });
      fetchVideos(searchQuery);
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui urutan");
    }
  };

  const handleModalSubmit = async (formData: {
    title: string;
    description: string;
    youtubeLink: string;
    category: string;
    status: "publish" | "draft";
    seriesOrder: number;
  }) => {
    if (modalVideo) {
      // Edit video
      await videoApi.edit(modalVideo.id, formData);
    } else {
      // Tambah video
      await videoApi.create(formData);
    }
    fetchVideos(searchQuery);
    handleCloseModal();
  };

  // Delete video handler
  const handleDeleteClick = (id: string) => {
    setVideoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!videoToDelete) return;

    setIsDeleting(true);
    try {
      await videoApi.delete(videoToDelete);
      setVideos((prev) => prev.filter((video) => video.id !== videoToDelete));
      setIsDeleteModalOpen(false);
      setVideoToDelete(null);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus video");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredVideos = videos;

  return (
    <>
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area: Left margin is responsive to the sidebar collapse state with smooth transition */}
      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <div className="max-w-container-max mx-auto space-y-stack-lg">
          {/* Main Page Header */}
          <header className="flex flex-row items-center justify-between pb-stack-sm border-b border-outline-variant/30">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface select-none">
                Manajemen Video
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                Kelola materi edukasi video untuk kelas mitigasi bencana alam
                Anda.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center justify-center gap-2 bg-surface-container text-on-surface-variant hover:text-primary font-label-md text-label-md py-3 px-5 rounded-xl clay-btn cursor-pointer font-bold border-none"
                onClick={() => setShowGuidelines(!showGuidelines)}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {showGuidelines ? "visibility_off" : "menu_book"}
                </span>
                {showGuidelines ? "Sembunyikan Panduan" : "Lihat Panduan Proyek"}
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-xl clay-btn cursor-pointer font-bold border-none"
                onClick={handleAddClick}
              >
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[20px]"
                >
                  add_circle
                </span>
                Unggah Video Baru
              </button>
            </div>
          </header>

          {/* Collapsible Guidelines Card */}
          {showGuidelines && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 clay-card border border-outline-variant/15 transition-all duration-300 ease-in-out">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4 mb-4 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      menu_book
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface text-[18px] lg:text-[20px]">
                      Ketentuan Proyek Video Series
                    </h3>
                    <p className="font-caption text-caption text-on-surface-variant mt-0.5">
                      Integrasi Pembelajaran IPA dan Mitigasi Bencana
                    </p>
                  </div>
                </div>
                <button
                  aria-label="Tutup Panduan"
                  onClick={() => setShowGuidelines(false)}
                  className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer border-none flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="mb-5 bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10 select-none">
                <h4 className="font-label-md text-label-md text-primary font-bold mb-1">
                  Deskripsi Proyek
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Mahasiswa sebagai calon guru IPA membuat proyek video series edukasi mitigasi bencana yang terintegrasi dengan materi IPA. Video dibuat secara berkelanjutan antarvideo sehingga membentuk alur berpikir yang sistematis dan saling terhubung.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* A. Ketentuan Umum */}
                <div className="bg-surface-container-low/30 rounded-2xl p-4 border border-outline-variant/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      assignment_turned_in
                    </span>
                    <h5 className="font-label-md text-label-md font-bold">A. Ketentuan Umum</h5>
                  </div>
                  <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1.5 leading-relaxed">
                    <li>Minimal <strong>3 video</strong>.</li>
                    <li>Durasi <strong>3-5 menit</strong> per video.</li>
                    <li>Format <strong>MP4</strong>, orientasi <strong>landscape (16:9)</strong>.</li>
                    <li>Diunggah ke YouTube, tautan diunggah ke web ini.</li>
                  </ul>
                </div>

                {/* B. Alur Video Series */}
                <div className="bg-surface-container-low/30 rounded-2xl p-4 border border-outline-variant/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      alt_route
                    </span>
                    <h5 className="font-label-md text-label-md font-bold">B. Alur Video Series</h5>
                  </div>
                  <ol className="text-xs text-on-surface-variant list-decimal pl-4 space-y-1 leading-relaxed">
                    <li><strong>Video 1:</strong> Pengenalan konsep IPA & Hubungan Bencana.</li>
                    <li><strong>Video 2:</strong> Penerapan konsep IPA dalam Mitigasi.</li>
                    <li><strong>Video 3:</strong> Penerapan produk & Kearifan Lokal.</li>
                    <li><strong>Video 4:</strong> Simulasi/Inovasi mitigasi lainnya.</li>
                  </ol>
                </div>

                {/* C. Perencanaan Proyek */}
                <div className="bg-surface-container-low/30 rounded-2xl p-4 border border-outline-variant/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-tertiary">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      architecture
                    </span>
                    <h5 className="font-label-md text-label-md font-bold">C. Perencanaan</h5>
                  </div>
                  <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1 leading-relaxed">
                    <li>Wajib menyusun rancangan sebelum membuat video.</li>
                    <li>Tentukan Materi IPA (contoh: getaran, siklus air).</li>
                    <li>Integrasikan materi IPA dengan Mitigasi Bencana.</li>
                    <li>Tentukan produk/media mitigasi & judul video.</li>
                  </ul>
                </div>

                {/* D. Aksesibilitas & Inklusi */}
                <div className="bg-surface-container-low/30 rounded-2xl p-4 border border-outline-variant/10 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      accessibility_new
                    </span>
                    <h5 className="font-label-md text-label-md font-bold text-error">D. Inklusivitas</h5>
                  </div>
                  <ul className="text-xs text-on-surface-variant list-disc pl-4 space-y-1.5 leading-relaxed">
                    <li>Wajib memperhatikan kebutuhan peserta didik berkebutuhan khusus.</li>
                    <li>Sertakan subtitle/caption jelas jika diperlukan.</li>
                    <li>Pastikan visual & audio kontras dan jelas didengar.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar and Statistics Counter */}
          <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-4 shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama video di sini..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)]"
              />
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant select-none">
              Total video:{" "}
              <span className="font-bold text-primary">
                {filteredVideos.length}
              </span>{" "}
              item
            </div>
          </div>

          {/* Interactive Data Table section */}
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 clay-card overflow-hidden border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Nama Video
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Tautan YouTube
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Status
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none text-center">
                      Urutan
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase text-right select-none">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-on-surface-variant select-none"
                      >
                        <span className="material-symbols-outlined text-5xl text-primary block mb-2 animate-spin">
                          sync
                        </span>
                        Sedang memuat data video...
                      </td>
                    </tr>
                  ) : filteredVideos.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-12 text-center text-on-surface-variant select-none"
                      >
                        <span className="material-symbols-outlined text-5xl text-outline-variant/50 block mb-2">
                          video_search
                        </span>
                        Tidak ada video yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredVideos.map((video) => (
                      <tr
                        key={video.id}
                        className="border-b border-outline-variant/20 hover:bg-surface-container-low/50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-primary shadow-inner">
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-2xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {video.icon}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface">
                                {video.title}
                              </span>
                              {video.description && (
                                <span className="text-xs text-on-surface-variant font-normal mt-0.5 line-clamp-1 max-w-[300px]">
                                  {video.description}
                                </span>
                              )}
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold mt-1 w-max capitalize">
                                {video.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <a
                            className="text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                            href={video.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {video.youtubeLink.replace(
                              /^(https?:\/\/)?(www\.)?/,
                              "",
                            )}
                            <span
                              aria-hidden="true"
                              className="material-symbols-outlined text-[16px]"
                            >
                              open_in_new
                            </span>
                          </a>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              video.status === "publish"
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-variant text-on-surface-variant"
                            }`}
                          >
                            {video.status === "publish" ? "Publish" : "Draft"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center justify-center gap-1.5 bg-surface-container/50 px-2 py-1 rounded-xl border border-outline-variant/20">
                            <button
                              aria-label="Naikkan Urutan"
                              onClick={() => handleUpdateOrder(video.id, video.seriesOrder - 1)}
                              className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container-high cursor-pointer border-none flex items-center justify-center"
                              title="Naikkan Urutan"
                            >
                              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
                            </button>
                            <span className="font-mono font-bold text-sm min-w-[20px] text-center">
                              {video.seriesOrder}
                            </span>
                            <button
                              aria-label="Turunkan Urutan"
                              onClick={() => handleUpdateOrder(video.id, video.seriesOrder + 1)}
                              className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container-high cursor-pointer border-none flex items-center justify-center"
                              title="Turunkan Urutan"
                            >
                              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              aria-label="Kelola Soal Interaktif"
                              onClick={() => navigate(`/dashboard/videos/${video.id}/questions`)}
                              className="p-2 text-outline hover:text-secondary bg-surface-container rounded-lg cursor-pointer border-none flex items-center justify-center"
                              title="Kelola Soal Interaktif"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[20px]"
                              >
                                quiz
                              </span>
                            </button>
                            <button
                              aria-label="Edit Video"
                              onClick={() => handleEditClick(video)}
                              className="p-2 text-outline hover:text-primary bg-surface-container rounded-lg cursor-pointer border-none flex items-center justify-center"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[20px]"
                              >
                                edit
                              </span>
                            </button>
                            <button
                              aria-label="Hapus Video"
                              onClick={() => handleDeleteClick(video.id)}
                              className="p-2 text-outline hover:text-error bg-error-container/10 hover:bg-error-container/40 rounded-lg cursor-pointer border-none flex items-center justify-center"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[20px]"
                              >
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <VideoFormModal
        isOpen={isModalOpen}
        video={modalVideo}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
      />
      <DeleteVideoModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
