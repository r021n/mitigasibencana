import { useState, useEffect } from "react";
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
  const [audioUrl, setAudioUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
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
      setAudioUrl(data.audioUrl || "");
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
      const data = { title, content, audioUrl: audioUrl || null, status };

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
                  onChange={(e) =>
                    setStatus(e.target.value as "publish" | "draft")
                  }
                  className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)] transition-all cursor-pointer"
                >
                  <option value="publish">Publik (Publish)</option>
                  <option value="draft">Draft (Simpan Internal)</option>
                </select>
              </div>
            </div>

            {/* Audio Upload Block */}
            <div className="flex flex-col gap-2">
              <label className="block text-label-md font-semibold text-on-surface-variant">
                Audio Pembelajaran (Opsional)
              </label>
              <p className="font-caption text-caption text-on-surface-variant mb-2">
                Unggah file audio (.mp3, .wav, .m4a) agar pengguna dapat mendengarkan materi ini.
              </p>
              
              {audioUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="material-symbols-outlined text-4xl text-primary p-2 bg-primary-fixed rounded-xl select-none">
                      audiotrack
                    </span>
                    <div className="truncate flex-grow">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">
                        Audio Materi Terunggah
                      </p>
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-caption text-caption text-primary hover:underline truncate block max-w-[200px]"
                      >
                        Buka Tautan Audio
                      </a>
                    </div>
                  </div>
                  <div className="flex-grow w-full sm:w-auto flex justify-center sm:justify-start">
                    <audio src={audioUrl} controls className="w-full max-w-md h-9" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioUrl("")}
                    className="p-2.5 hover:bg-error-container text-error rounded-xl transition-colors cursor-pointer border border-error/20 bg-surface-container-lowest flex items-center justify-center sm:self-center"
                    title="Hapus Audio"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-outline-variant/50 rounded-2xl p-6 bg-surface hover:bg-surface-container-low hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center group">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      try {
                        setIsUploading(true);
                        const url = await handleUploadFile(file);
                        if (url) {
                          setAudioUrl(url);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    disabled={isUploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary transition-colors mb-3">
                    {isUploading ? "sync" : "cloud_upload"}
                  </span>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-label-md text-label-md text-primary font-bold animate-pulse">
                        Mengunggah file audio...
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Mohon tunggu sebentar.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        Pilih file audio atau seret ke sini
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">
                        MP3, WAV, atau M4A hingga 20MB
                      </p>
                    </div>
                  )}
                </div>
              )}
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
