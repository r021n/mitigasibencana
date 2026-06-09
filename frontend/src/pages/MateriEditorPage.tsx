import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale very large images to max dimension of 1000px
        const MAX_DIM = 1000;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        // Progressively compress to get under 200 KB (roughly 266,000 characters in base64)
        while (dataUrl.length > 266000 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Gagal memuat file gambar"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
};

interface MaterialSection {
  id: string;
  type: "paragraph" | "heading" | "list" | "image";
  content: string;
  timestamp: number; // in seconds
}

const CATEGORIES = [
  { value: "tanah longsor", label: "Tanah Longsor" },
  { value: "angin puting beliung", label: "Angin Puting Beliung" },
  { value: "gempa bumi", label: "Gempa Bumi" },
  { value: "banjir", label: "Banjir" },
  { value: "tsunami", label: "Tsunami" },
  { value: "letusan gunung berapi", label: "Letusan Gunung Berapi" },
];

function MateriEditorInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { open } = useSidebar();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("gempa bumi");
  const [sections, setSections] = useState<MaterialSection[]>([
    { id: crypto.randomUUID(), type: "paragraph", content: "", timestamp: 0 },
  ]);
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
      setAudioUrl(data.audioUrl || "");
      setCategory(data.category || "gempa bumi");
      setStatus(data.status);

      // Parse content as JSON sections
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        } else {
          throw new Error("Invalid structure");
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

    // Validate that at least one section has content
    const hasContent = sections.some((s) => s.content.trim() !== "");
    if (!hasContent) {
      alert("Materi harus memiliki setidaknya satu seksi dengan konten.");
      return;
    }

    try {
      setSaving(true);
      const data = {
        title,
        content: JSON.stringify(sections),
        audioUrl: audioUrl || null,
        category,
        status,
      };

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

  // Section Manipulation Handlers
  const addSection = (index: number) => {
    const newSection: MaterialSection = {
      id: crypto.randomUUID(),
      type: "paragraph",
      content: "",
      timestamp: index >= 0 && sections[index] ? sections[index].timestamp : 0,
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, newSection);
    setSections(updated);
  };

  const deleteSection = (id: string) => {
    if (sections.length === 1) {
      alert("Materi harus memiliki minimal satu seksi.");
      return;
    }
    setSections(sections.filter((s) => s.id !== id));
  };

  const updateSection = (id: string, fields: Partial<MaterialSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...fields } : s)));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSections(updated);
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
      <Sidebar />

      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <div className="max-w-container-max mx-auto space-y-stack-lg">
          {/* Header */}
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
                Tuliskan materi pembelajaran dengan timestamp audio.
              </p>
            </div>
          </header>

          {/* Form Settings */}
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-8 clay-card border border-outline-variant/10 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="md:col-span-1">
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

              {/* Category */}
              <div>
                <label className="block text-label-md font-semibold text-on-surface-variant mb-2">
                  Kategori Bencana
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)] transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
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

            {/* Audio Upload */}
            <div className="flex flex-col gap-2">
              <label className="block text-label-md font-semibold text-on-surface-variant">
                Audio Pembelajaran (Opsional)
              </label>
              <p className="font-caption text-caption text-on-surface-variant mb-2">
                Unggah file audio agar pembaca dapat mendengarkan materi dan
                melihat sorot teks otomatis.
              </p>

              {audioUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="material-symbols-outlined text-4xl text-primary p-2 bg-primary-fixed rounded-xl select-none">
                      audiotrack
                    </span>
                    <div className="truncate flex-grow">
                      <p className="font-label-md text-label-md text-on-surface truncate font-semibold">
                        Audio Terunggah
                      </p>
                      <a
                        href={audioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-caption text-caption text-primary hover:underline truncate block max-w-[200px]"
                      >
                        Buka Link Audio
                      </a>
                    </div>
                  </div>
                  <div className="flex-grow w-full sm:w-auto flex justify-center sm:justify-start">
                    <audio
                      src={audioUrl}
                      controls
                      className="w-full max-w-md h-9"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioUrl("")}
                    className="p-2.5 hover:bg-error-container text-error rounded-xl transition-colors cursor-pointer border border-error/20 bg-surface-container-lowest flex items-center justify-center sm:self-center"
                    title="Hapus Audio"
                  >
                    <span className="material-symbols-outlined text-xl">
                      delete
                    </span>
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
                        Mengunggah audio...
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-label-md text-label-md text-on-surface font-semibold">
                        Pilih file audio atau seret ke sini
                      </p>
                      <p className="font-caption text-caption text-on-surface-variant mt-1">
                        MP3, WAV, atau M4A
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notion style Section Editor */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
                <label className="block text-label-lg font-bold text-on-surface">
                  Konten Materi
                </label>
                <button
                  type="button"
                  onClick={() => addSection(sections.length - 1)}
                  className="inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Tambah Seksi di Bawah
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => {
                  const minutes = Math.floor(section.timestamp / 60);
                  const seconds = section.timestamp % 60;

                  return (
                    <div
                      key={section.id}
                      className="bg-surface border border-outline-variant/30 rounded-2xl p-5 hover:border-primary/40 transition-all flex flex-col gap-4 relative shadow-sm group"
                    >
                      {/* Section Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-low p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold font-mono">
                            {index + 1}
                          </span>

                          {/* Type Select */}
                          <select
                            value={section.type}
                            onChange={(e) =>
                              updateSection(section.id, {
                                type: e.target.value as any,
                              })
                            }
                            className="bg-surface text-on-surface px-2.5 py-1 rounded-lg border border-outline-variant/30 text-xs font-semibold cursor-pointer outline-none"
                          >
                            <option value="paragraph">Paragraf</option>
                            <option value="heading">Sub-judul (H2)</option>
                            <option value="list">Daftar Poin (List)</option>
                            <option value="image">Gambar</option>
                          </select>
                        </div>

                        {/* Timestamp Controls */}
                        <div className="flex items-center gap-2 bg-surface px-3 py-1 rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant select-none">
                            schedule
                          </span>
                          <span className="text-xs text-on-surface-variant font-medium">
                            Highlight:
                          </span>
                          <div className="flex items-center gap-1 font-mono">
                            <input
                              type="number"
                              min="0"
                              value={minutes}
                              onChange={(e) => {
                                const minVal = Math.max(
                                  0,
                                  parseInt(e.target.value) || 0,
                                );
                                updateSection(section.id, {
                                  timestamp: minVal * 60 + seconds,
                                });
                              }}
                              className="w-10 bg-transparent text-center text-xs text-on-surface font-semibold focus:outline-none border-b border-transparent focus:border-primary"
                              title="Menit"
                            />
                            <span className="text-xs text-on-surface-variant">
                              :
                            </span>
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={seconds}
                              onChange={(e) => {
                                const secVal = Math.min(
                                  59,
                                  Math.max(0, parseInt(e.target.value) || 0),
                                );
                                updateSection(section.id, {
                                  timestamp: minutes * 60 + secVal,
                                });
                              }}
                              className="w-10 bg-transparent text-center text-xs text-on-surface font-semibold focus:outline-none border-b border-transparent focus:border-primary"
                              title="Detik"
                            />
                          </div>
                        </div>

                        {/* Actions (Move & Delete) */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => moveSection(index, "up")}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer border-none text-on-surface-variant flex items-center justify-center bg-transparent"
                            title="Pindahkan ke atas"
                          >
                            <span className="material-symbols-outlined text-lg">
                              arrow_upward
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(index, "down")}
                            disabled={index === sections.length - 1}
                            className="p-1.5 hover:bg-surface-container rounded-lg disabled:opacity-30 cursor-pointer border-none text-on-surface-variant flex items-center justify-center bg-transparent"
                            title="Pindahkan ke bawah"
                          >
                            <span className="material-symbols-outlined text-lg">
                              arrow_downward
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => addSection(index)}
                            className="p-1.5 hover:bg-surface-container text-primary rounded-lg cursor-pointer border-none flex items-center justify-center bg-transparent"
                            title="Tambah seksi di bawah seksi ini"
                          >
                            <span className="material-symbols-outlined text-lg">
                              add_circle
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSection(section.id)}
                            className="p-1.5 hover:bg-error-container text-error rounded-lg cursor-pointer border-none flex items-center justify-center bg-transparent"
                            title="Hapus Seksi"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Content Input Area */}
                      <div className="w-full">
                        {section.type === "heading" ? (
                          <input
                            type="text"
                            value={section.content}
                            onChange={(e) =>
                              updateSection(section.id, {
                                content: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-surface-container-low text-on-surface font-bold text-lg rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none transition-all placeholder-on-surface-variant/50"
                            placeholder="Ketik sub-judul (Heading 2)..."
                          />
                        ) : section.type === "list" ? (
                          <div className="flex flex-col gap-1.5">
                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                updateSection(section.id, {
                                  content: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-4 py-3 bg-surface-container-low text-on-surface font-body-md rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none transition-all placeholder-on-surface-variant/50"
                              placeholder="Masukkan poin-poin (Gunakan baris baru / Enter untuk tiap poin)..."
                            />
                            <div className="text-[11px] text-on-surface-variant flex items-center gap-1 pl-1">
                              <span className="material-symbols-outlined text-xs">
                                info
                              </span>
                              <span>
                                Tiap baris teks akan dirender sebagai satu poin
                                daftar.
                              </span>
                            </div>
                          </div>
                        ) : section.type === "image" ? (
                          <div className="flex flex-col gap-3">
                            {section.content ? (
                              <div className="relative rounded-xl overflow-hidden max-w-md bg-surface-container-low border border-outline-variant/30 group/img">
                                <img
                                  src={section.content}
                                  alt="Preview seksi gambar"
                                  className="w-full h-auto max-h-[240px] object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateSection(section.id, { content: "" })
                                  }
                                  className="absolute top-2.5 right-2.5 w-8 h-8 bg-error text-on-error rounded-full hover:scale-105 transition-all shadow-md border-none cursor-pointer flex items-center justify-center"
                                  title="Hapus Gambar"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    close
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <div className="relative border-2 border-dashed border-outline-variant/40 hover:border-primary/40 rounded-xl p-8 bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] group/upload">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      try {
                                        const base64 =
                                          await compressImage(file);
                                        updateSection(section.id, {
                                          content: base64,
                                        });
                                      } catch (err: any) {
                                        alert(
                                          err.message ||
                                            "Gagal mengompresi gambar",
                                        );
                                      }
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <span className="material-symbols-outlined text-3xl text-on-surface-variant group-hover/upload:text-primary transition-colors mb-2">
                                  image
                                </span>
                                <p className="font-label-md text-label-md text-on-surface font-semibold">
                                  Pilih Gambar untuk Diunggah
                                </p>
                                <p className="font-caption text-caption text-on-surface-variant mt-1">
                                  Otomatis dikompresi di bawah 200 KB
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={section.content}
                            onChange={(e) =>
                              updateSection(section.id, {
                                content: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-full px-4 py-3 bg-surface-container-low text-on-surface font-body-md rounded-xl border border-outline-variant/20 focus:border-primary focus:outline-none transition-all placeholder-on-surface-variant/50"
                            placeholder="Ketik paragraf bacaan seksi ini..."
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Add Section Button */}
              <button
                type="button"
                onClick={() => addSection(sections.length - 1)}
                className="w-full py-4 border-2 border-dashed border-outline-variant/40 hover:border-primary/50 hover:bg-surface-container-low rounded-2xl flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary transition-all cursor-pointer font-bold bg-transparent select-none mt-2"
              >
                <span className="material-symbols-outlined text-xl">
                  add_box
                </span>
                Tambah Seksi Baru di Akhir
              </button>
            </div>

            {/* Save Actions */}
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
