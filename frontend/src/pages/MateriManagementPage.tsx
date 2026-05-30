import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { materialApi } from "../api/api";
import { useAuthStore } from "../store/authStore";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

export default function MateriManagementPage() {
  return (
    <SidebarProvider>
      <MateriManagementInner />
    </SidebarProvider>
  );
}

function MateriManagementInner() {
  const { open } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user && user.status === "admin") {
      fetchMaterials();
    } else {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getAll();
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus materi ini?")) {
      try {
        await materialApi.delete(id);
        fetchMaterials();
      } catch (error) {
        console.error("Failed to delete material:", error);
        alert("Gagal menghapus materi.");
      }
    }
  };

  const filteredMaterials = materials.filter(
    (materi) =>
      materi.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (materi.author?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Sidebar Layout */}
      <Sidebar />

      {/* Main Content Area */}
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
                Manajemen Materi Edukasi
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                Kelola materi edukasi berbasis teks dan media untuk menunjang pemahaman siswa dalam mitigasi bencana.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-xl clay-btn cursor-pointer font-bold border-none"
              onClick={() => navigate("/admin/materi/editor")}
            >
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[20px]"
              >
                add_circle
              </span>
              Buat Materi Baru
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
                placeholder="Cari judul materi atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)]"
              />
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant select-none">
              Total materi:{" "}
              <span className="font-bold text-primary">
                {filteredMaterials.length}
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
                      Judul Materi
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Penulis
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Status
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none">
                      Tanggal Dibuat
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase text-right select-none">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-on-surface-variant select-none"
                      >
                        <span className="material-symbols-outlined text-5xl text-primary block mb-2 animate-spin">
                          sync
                        </span>
                        Sedang memuat data materi...
                      </td>
                    </tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-on-surface-variant select-none"
                      >
                        <span className="material-symbols-outlined text-5xl text-outline-variant/50 block mb-2">
                          menu_book
                        </span>
                        Tidak ada materi yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((materi) => (
                      <tr
                        key={materi.id}
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
                                menu_book
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-on-surface">
                                {materi.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-on-surface-variant">
                            {materi.author?.name || "Pengajar"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              materi.status === "publish"
                                ? "bg-secondary-container text-on-secondary-container"
                                : "bg-surface-variant text-on-surface-variant"
                            }`}
                          >
                            {materi.status === "publish" ? "Publish" : "Draft"}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-on-surface-variant font-medium">
                            {new Date(materi.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={`/materi/${materi.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Lihat Materi"
                              className="p-2 text-outline hover:text-primary bg-surface-container rounded-lg cursor-pointer border-none flex items-center justify-center"
                            >
                              <span
                                aria-hidden="true"
                                className="material-symbols-outlined text-[20px]"
                              >
                                visibility
                              </span>
                            </a>
                            <button
                              aria-label="Edit Materi"
                              onClick={() => navigate(`/admin/materi/editor/${materi.id}`)}
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
                              aria-label="Hapus Materi"
                              onClick={() => handleDelete(materi.id)}
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
    </>
  );
}
