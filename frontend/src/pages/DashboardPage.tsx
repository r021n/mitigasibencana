import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../components/ui/sidebar";

interface Video {
  id: string;
  name: string;
  youtubeLink: string;
  status: "publish" | "draft";
  icon: string;
}

const INITIAL_VIDEOS: Video[] = [
  {
    id: "1",
    name: "Understanding Tsunamis: Early Warning Signs",
    youtubeLink: "https://youtu.be/abc123xyz",
    status: "publish",
    icon: "tsunami",
  },
  {
    id: "2",
    name: "Volcanic Ash: Respiratory Protection Guidelines",
    youtubeLink: "https://youtu.be/def456uvw",
    status: "draft",
    icon: "volcano",
  },
  {
    id: "3",
    name: "Flood Response Simulation for Schools",
    youtubeLink: "https://youtu.be/ghi789rst",
    status: "publish",
    icon: "flood",
  },
];

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <DashboardInner />
    </SidebarProvider>
  );
}

function DashboardInner() {
  const { open, toggleSidebar } = useSidebar();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Fallback profile if user is not logged in (e.g., direct preview)
  const displayUser = user || {
    name: "Dr. Sarah Adams",
    status: "teacher" as const,
    email: "sarah.adams@mitigasibencana.edu",
  };

  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [searchQuery, setSearchQuery] = useState("");

  // Video Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    youtubeLink: "",
    status: "draft" as "publish" | "draft",
  });

  // Logout Modal State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Logout Modal Handlers
  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to dynamically assign appropriate material icon based on video name keywords
  const detectIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("tsunami")) return "tsunami";
    if (
      lowerName.includes("volcano") ||
      lowerName.includes("gunung") ||
      lowerName.includes("ash") ||
      lowerName.includes("abu")
    )
      return "volcano";
    if (lowerName.includes("flood") || lowerName.includes("banjir"))
      return "flood";
    if (lowerName.includes("earthquake") || lowerName.includes("gempa"))
      return "earthquake";
    if (lowerName.includes("landslide") || lowerName.includes("longsor"))
      return "landslide";
    if (
      lowerName.includes("wind") ||
      lowerName.includes("angin") ||
      lowerName.includes("tornado") ||
      lowerName.includes("cyclone")
    )
      return "cyclone";
    return "video_library"; // default fallback
  };

  // Modal opening handlers
  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      name: "",
      youtubeLink: "",
      status: "draft",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      name: video.name,
      youtubeLink: video.youtubeLink,
      status: video.status,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
  };

  // Delete video handler
  const handleDeleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== id));
  };

  // Add/Edit Form submit handler
  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.youtubeLink.trim()) {
      return;
    }

    if (editingVideo) {
      // Editing
      setVideos((prev) =>
        prev.map((video) =>
          video.id === editingVideo.id
            ? {
                ...video,
                name: formData.name.trim(),
                youtubeLink: formData.youtubeLink.trim(),
                status: formData.status,
                icon: detectIcon(formData.name),
              }
            : video
        )
      );
    } else {
      // Adding
      const newVideo: Video = {
        id: crypto.randomUUID(),
        name: formData.name.trim(),
        youtubeLink: formData.youtubeLink.trim(),
        status: formData.status,
        icon: detectIcon(formData.name),
      };
      setVideos((prev) => [...prev, newVideo]);
    }

    handleCloseModal();
  };

  // Filter video list based on search term
  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar Layout */}
      <Sidebar>
        {/* Sidebar Toggle and Brand Header (Portal Guru added when expanded) */}
        <div className={`mb-6 flex items-center ${open ? "justify-between" : "justify-center"} min-h-[40px]`}>
          {open && (
            <div className="select-none">
              <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                Portal Guru
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
            title={open ? "Perkecil Sidebar" : "Perluas Sidebar"}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {open ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        {/* Compound Sidebar Navigations */}
        <SidebarContent>
          <SidebarGroup>
            {/* Note: "Menu Utama" label removed to satisfy user requirements */}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={true}
                    title={!open ? "Kelola Video" : undefined}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      video_library
                    </span>
                    {open && <span>Kelola Video</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Sidebar Footer: User profile information & Logout Button (Unggah Video Baru removed from Sidebar) */}
        <div className="mt-auto pt-6 border-t border-outline-variant/10">
          {open ? (
            <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-2 shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] border border-outline-variant/5">
              <div className="min-w-0 flex-1 select-none">
                <p className="font-label-md text-label-md text-on-surface font-bold truncate">
                  {displayUser.name}
                </p>
                <p className="font-caption text-caption text-on-surface-variant capitalize mt-0.5">
                  {displayUser.status}
                </p>
              </div>
              <button
                onClick={handleOpenLogoutModal}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold">
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleOpenLogoutModal}
                className="w-12 h-12 bg-error-container/10 text-error hover:bg-error-container/30 rounded-xl cursor-pointer border-none flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold">
                  logout
                </span>
              </button>
            </div>
          )}
        </div>
      </Sidebar>

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
                  {filteredVideos.length === 0 ? (
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
                            <span className="font-semibold text-on-surface">
                              {video.name}
                            </span>
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
                  htmlFor="video-name"
                >
                  Nama Video
                </label>
                <input
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
                  id="video-name"
                  placeholder="Contoh: Kesiapsiagaan Tsunami di Sekolah"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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

      {/* Logout Confirmation Modal Overlay */}
      {isLogoutModalOpen && (
        <div
          aria-labelledby="logout-modal-title"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
        >
          {/* Dialog Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[20px]"
            onClick={handleCloseLogoutModal}
          ></div>

          {/* Modal Content Panel */}
          <div className="relative bg-surface-container-lowest rounded-[2rem] w-full max-w-sm p-8 clay-modal z-10 shadow-2xl border border-outline-variant/10">
            {/* Close Button */}
            <button
              aria-label="Tutup modal"
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none"
              onClick={handleCloseLogoutModal}
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                close
              </span>
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-8 select-none text-center">
              <div className="w-12 h-12 bg-error-container/20 rounded-2xl flex items-center justify-center text-error mx-auto mb-4 shadow-inner">
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  logout
                </span>
              </div>
              <h3
                className="font-headline-sm text-headline-sm text-on-surface"
                id="logout-modal-title"
              >
                Konfirmasi Keluar
              </h3>
              <p className="font-caption text-caption text-on-surface-variant mt-2">
                Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk
                kembali untuk mengelola video mitigasi bencana.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-6 border-t border-outline-variant/10 pt-4">
              <button
                className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-semibold"
                onClick={handleCloseLogoutModal}
                type="button"
              >
                Batal
              </button>
              <button
                className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-error text-on-error hover:bg-error/90 cursor-pointer font-bold border-none"
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
