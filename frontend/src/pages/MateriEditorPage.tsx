import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TiptapEditor from "../components/editor/TiptapEditor";
import { materialApi, uploadApi } from "../api/api";
import { useAuthStore } from "../store/authStore";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

export default function MateriEditorPage() {
  return (
    <SidebarProvider>
      <MateriEditorInner />
    </SidebarProvider>
  );
}

function MateriEditorInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { open } = useSidebar();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"publish" | "draft">("publish");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.status !== "admin") {
      navigate("/");
      return;
    }

    if (isEditing) {
      fetchMaterial();
    }
  }, [id, user, navigate]);

  const fetchMaterial = async () => {
    try {
      const data = await materialApi.getById(id as string);
      setTitle(data.title);
      setContent(data.content);
      setStatus(data.status);
    } catch (error) {
      console.error("Failed to fetch material:", error);
      alert("Gagal mengambil data materi.");
      navigate("/admin/materi");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Judul materi tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      const data = { title, content, status };

      if (isEditing) {
        await materialApi.edit(id as string, data);
      } else {
        await materialApi.create(data);
      }

      navigate("/admin/materi");
    } catch (error) {
      console.error("Failed to save material:", error);
      alert("Gagal menyimpan materi.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFile = async (file: File): Promise<string> => {
    try {
      const url = await uploadApi.uploadFile(file);
      return url;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal mengunggah file.");
      return "";
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <main
          className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${
            open ? "ml-64" : "ml-20"
          }`}
        >
          <div className="flex justify-center items-center h-[50vh]">
            <span className="material-symbols-outlined text-5xl text-primary animate-spin">
              sync
            </span>
          </div>
        </main>
      </>
    );
  }

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
          <header className="flex flex-row items-center gap-4 pb-stack-sm border-b border-outline-variant/30">
            <button
              onClick={() => navigate("/admin/materi")}
              className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer border-none bg-transparent flex items-center justify-center"
              title="Kembali"
            >
              <span className="material-symbols-outlined text-2xl font-bold">
                arrow_back
              </span>
            </button>
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface select-none">
                {isEditing ? "Edit Materi" : "Buat Materi Baru"}
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                {isEditing
                  ? "Perbarui dan sesuaikan detail materi edukasi mitigasi bencana Anda."
                  : "Tuliskan materi baru untuk menunjang media pembelajaran mitigasi bencana."}
              </p>
            </div>
          </header>

          {/* Form Content Block */}
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 clay-card border border-outline-variant/10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="flex-1 w-full">
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2">
                  Judul Materi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)] transition-all"
                  placeholder="Masukkan judul materi..."
                />
              </div>
              <div className="w-full md:w-64">
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2">
                  Status Publikasi
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "publish" | "draft")}
                  className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)] transition-all cursor-pointer"
                >
                  <option value="publish">Publik (Publish)</option>
                  <option value="draft">Draft (Simpan Internal)</option>
                </select>
              </div>
            </div>

            {/* Rich Editor Block */}
            <div className="flex flex-col gap-2">
              <label className="block text-label-md font-semibold text-on-surface-variant mb-2">
                Konten Materi
              </label>
              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden shadow-inner bg-white">
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  onUploadFile={handleUploadFile}
                />
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end pt-4 border-t border-outline-variant/20">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-xl clay-btn cursor-pointer font-bold border-none disabled:opacity-50"
              >
                {saving ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin">
                    sync
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">
                    save
                  </span>
                )}
                {saving ? "Menyimpan..." : "Simpan Materi"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
