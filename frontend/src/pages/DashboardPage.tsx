import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { videoApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  category: string;
  status: "publish" | "draft";
  icon: string;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Video Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeLink: "",
    category: "tanah longsor",
    status: "draft" as "publish" | "draft",
  });

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
    if (lowerCategory.includes("longsor") || lowerCategory.includes("landslide"))
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
    if (user) {
      fetchVideos(searchQuery);
    }
  }, [searchQuery, user]);

  // Modal opening handlers
  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      youtubeLink: "",
      category: "tanah longsor",
      status: "draft",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      youtubeLink: video.youtubeLink,
      category: video.category || "tanah longsor",
      status: video.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  // Delete video handler
  const handleDeleteVideo = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus video ini?")) {
      try {
        await videoApi.delete(id);
        setVideos((prev) => prev.filter((video) => video.id !== id));
      } catch (err: any) {
        alert(err.message || "Gagal menghapus video");
      }
    }
  };

  // Add/Edit Form submit handler
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.youtubeLink.trim() || !formData.category) {
      return;
    }

    try {
      if (editingVideo) {
        // Editing
        const updated = await videoApi.edit(editingVideo.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          youtubeLink: formData.youtubeLink.trim(),
          category: formData.category,
          status: formData.status,
        });

        setVideos((prev) =>
          prev.map((video) =>
            video.id === editingVideo.id
              ? {
                  ...updated,
                  icon: detectIcon(updated.category, updated.title),
                }
              : video
          )
        );
      } else {
        // Adding
        const created = await videoApi.create({
          title: formData.title.trim(),
          description: formData.description.trim(),
          youtubeLink: formData.youtubeLink.trim(),
          category: formData.category,
          status: formData.status,
        });

        setVideos((prev) => [
          ...prev,
          {
            ...created,
            icon: detectIcon(created.category, created.title),
          },
        ]);
      }
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan video");
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
            <button
              className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-xl clay-btn cursor-pointer font-bold border-none"
              onClick={handleOpenAddModal}
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                add_circle
              </span>
              Unggah Video Baru
            </button>
          </header>

          {/* Search Bar and Statistics Counter */}
          <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-4 shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Cari nama video di sini..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                              ""
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
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              aria-label="Edit Video"
                              onClick={() => handleOpenEditModal(video)}
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
                              onClick={() => handleDeleteVideo(video.id)}
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

      {/* Video Upload Modal Dialog Overlay for Add / Edit */}
      {isModalOpen && (
        <div
          aria-labelledby="modal-title"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
        >
          {/* Dialog Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[20px]"
            onClick={handleCloseModal}
          ></div>

          {/* Modal Content Panel */}
          <div className="relative bg-surface-container-lowest rounded-[2rem] w-full max-w-md p-8 clay-modal z-10 shadow-2xl border border-outline-variant/10">
            {/* Close Button */}
            <button
              aria-label="Tutup modal"
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none"
              onClick={handleCloseModal}
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                close
              </span>
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8 select-none">
              <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {editingVideo ? "edit" : "cloud_upload"}
                </span>
              </div>
              <h3
                className="font-headline-sm text-headline-sm text-on-surface"
                id="modal-title"
              >
                {editingVideo ? "Ubah Video Edukasi" : "Unggah Video Edukasi"}
              </h3>
              <p className="font-caption text-caption text-on-surface-variant mt-1">
                {editingVideo
                  ? "Perbarui informasi mengenai materi video simulasi kebencanaan."
                  : "Tambahkan materi video kebencanaan baru ke dalam sistem pembelajaran."}
              </p>
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSaveVideo} className="space-y-5">
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-title"
                >
                  Judul Video
                </label>
                <input
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
                  id="video-title"
                  placeholder="Contoh: Kesiapsiagaan Tsunami di Sekolah"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-description"
                >
                  Deskripsi Video
                </label>
                <textarea
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 min-h-[80px] resize-y"
                  id="video-description"
                  placeholder="Masukkan deskripsi materi video edukasi di sini..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="youtube-link"
                >
                  Tautan YouTube
                </label>
                <input
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
                  id="youtube-link"
                  placeholder="https://youtu.be/..."
                  type="url"
                  value={formData.youtubeLink}
                  onChange={(e) =>
                    setFormData({ ...formData, youtubeLink: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-category"
                >
                  Kategori Video
                </label>
                <select
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 cursor-pointer"
                  id="video-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  required
                >
                  <option value="tanah longsor">Tanah Longsor</option>
                  <option value="angin puting beliung">Angin Puting Beliung</option>
                  <option value="gempa bumi">Gempa Bumi</option>
                  <option value="banjir">Banjir</option>
                  <option value="tsunami">Tsunami</option>
                  <option value="letusan gunung berapi">Letusan Gunung Berapi</option>
                </select>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-status"
                >
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 cursor-pointer"
                  id="video-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "publish" | "draft",
                    })
                  }
                >
                  <option value="draft">Draft (Privat)</option>
                  <option value="publish">Publish (Terlihat oleh Siswa)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/30 mt-6">
                <button
                  className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-medium"
                  onClick={handleCloseModal}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-primary text-on-primary clay-btn cursor-pointer font-bold border-none"
                  type="submit"
                >
                  Simpan Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
