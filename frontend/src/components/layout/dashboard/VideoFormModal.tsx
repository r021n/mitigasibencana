// import React, { useState, useEffect } from "react";

// interface VideoFormData {
//   title: string;
//   description: string;
//   youtubeLink: string;
//   category: string;
//   status: "publish" | "draft";
// }

// interface Video {
//   id: string;
//   title: string;
//   description: string;
//   youtubeLink: string;
//   category: string;
//   status: "publish" | "draft";
// }

// interface VideoFormModalProps {
//   isOpen: boolean;
//   video: Video | null; // null berarti mode tambah
//   onClose: () => void;
//   onSubmit: (data: VideoFormData) => Promise<void>; // halaman yang menangani penyimpanan
// }

// export default function VideoFormModal({
//   isOpen,
//   video,
//   onClose,
//   onSubmit,
// }: VideoFormModalProps) {
//   const [formData, setFormData] = useState<VideoFormData>({
//     title: "",
//     description: "",
//     youtubeLink: "",
//     category: "tanah longsor",
//     status: "draft",
//   });
//   const [saving, setSaving] = useState(false);

//   // Reset form setiap kali modal dibuka (dan terima data video untuk edit)
//   useEffect(() => {
//     if (isOpen) {
//       if (video) {
//         setFormData({
//           title: video.title,
//           description: video.description || "",
//           youtubeLink: video.youtubeLink,
//           category: video.category || "tanah longsor",
//           status: video.status,
//         });
//       } else {
//         setFormData({
//           title: "",
//           description: "",
//           youtubeLink: "",
//           category: "tanah longsor",
//           status: "draft",
//         });
//       }
//       setSaving(false);
//     }
//   }, [isOpen, video]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (
//       !formData.title.trim() ||
//       !formData.youtubeLink.trim() ||
//       !formData.category
//     )
//       return;

//     setSaving(true);
//     try {
//       await onSubmit(formData);
//       // jangan panggil onClose di sini, biar halaman yang memanggilnya setelah sukses
//     } catch (err) {
//       setSaving(false);
//       // error handling bisa dilakukan di halaman pemanggil, atau di sini jika diperlukan
//       alert("Gagal menyimpan video.");
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       aria-labelledby="modal-title"
//       aria-modal="true"
//       className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
//       role="dialog"
//     >
//       {/* Backdrop */}
//       <div
//         aria-hidden="true"
//         className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[20px]"
//         onClick={onClose}
//       ></div>

//       {/* Panel */}
//       <div className="relative bg-surface-container-lowest rounded-[2rem] w-full max-w-md p-8 clay-modal z-10 shadow-2xl border border-outline-variant/10">
//         <button
//           aria-label="Tutup modal"
//           className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none"
//           onClick={onClose}
//         >
//           <span
//             aria-hidden="true"
//             className="material-symbols-outlined text-[20px]"
//           >
//             close
//           </span>
//         </button>

//         <div className="mb-6 pr-8 select-none">
//           <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner">
//             <span
//               aria-hidden="true"
//               className="material-symbols-outlined text-[28px]"
//               style={{ fontVariationSettings: "'FILL' 1" }}
//             >
//               {video ? "edit" : "cloud_upload"}
//             </span>
//           </div>
//           <h3
//             className="font-headline-sm text-headline-sm text-on-surface"
//             id="modal-title"
//           >
//             {video ? "Ubah Video Edukasi" : "Unggah Video Edukasi"}
//           </h3>
//           <p className="font-caption text-caption text-on-surface-variant mt-1">
//             {video
//               ? "Perbarui informasi mengenai materi video simulasi kebencanaan."
//               : "Tambahkan materi video kebencanaan baru ke dalam sistem pembelajaran."}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label
//               className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
//               htmlFor="video-title"
//             >
//               Judul Video
//             </label>
//             <input
//               className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
//               id="video-title"
//               placeholder="Contoh: Kesiapsiagaan Tsunami di Sekolah"
//               type="text"
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData({ ...formData, title: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div>
//             <label
//               className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
//               htmlFor="video-description"
//             >
//               Deskripsi Video
//             </label>
//             <textarea
//               className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 min-h-[80px] resize-y"
//               id="video-description"
//               placeholder="Masukkan deskripsi materi video edukasi di sini..."
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData({ ...formData, description: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div>
//             <label
//               className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
//               htmlFor="youtube-link"
//             >
//               Tautan YouTube
//             </label>
//             <input
//               className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
//               id="youtube-link"
//               placeholder="https://youtu.be/..."
//               type="url"
//               value={formData.youtubeLink}
//               onChange={(e) =>
//                 setFormData({ ...formData, youtubeLink: e.target.value })
//               }
//               required
//             />
//           </div>

//           <div>
//             <label
//               className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
//               htmlFor="video-category"
//             >
//               Kategori Video
//             </label>
//             <select
//               className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 cursor-pointer"
//               id="video-category"
//               value={formData.category}
//               onChange={(e) =>
//                 setFormData({ ...formData, category: e.target.value })
//               }
//               required
//             >
//               <option value="tanah longsor">Tanah Longsor</option>
//               <option value="angin puting beliung">Angin Puting Beliung</option>
//               <option value="gempa bumi">Gempa Bumi</option>
//               <option value="banjir">Banjir</option>
//               <option value="tsunami">Tsunami</option>
//               <option value="letusan gunung berapi">
//                 Letusan Gunung Berapi
//               </option>
//             </select>
//           </div>

//           <div>
//             <label
//               className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
//               htmlFor="video-status"
//             >
//               Status
//             </label>
//             <select
//               className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 cursor-pointer"
//               id="video-status"
//               value={formData.status}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   status: e.target.value as "publish" | "draft",
//                 })
//               }
//             >
//               <option value="draft">Draft (Privat)</option>
//               <option value="publish">Publish (Terlihat oleh Siswa)</option>
//             </select>
//           </div>

//           <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/30 mt-6">
//             <button
//               className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-medium"
//               onClick={onClose}
//               type="button"
//             >
//               Batal
//             </button>
//             <button
//               className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-primary text-on-primary clay-btn cursor-pointer font-bold border-none disabled:opacity-50"
//               type="submit"
//               disabled={saving}
//             >
//               {saving ? "Menyimpan..." : "Simpan Video"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";

interface VideoFormData {
  title: string;
  description: string;
  youtubeLink: string;
  category: string;
  status: "publish" | "draft";
  seriesOrder: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  youtubeLink: string;
  category: string;
  status: "publish" | "draft";
  seriesOrder: number;
}

interface VideoFormModalProps {
  isOpen: boolean;
  video: Video | null;
  onClose: () => void;
  onSubmit: (data: VideoFormData) => Promise<void>;
}

export default function VideoFormModal({
  isOpen,
  video,
  onClose,
  onSubmit,
}: VideoFormModalProps) {
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    youtubeLink: "",
    category: "tanah longsor",
    status: "draft",
    seriesOrder: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (video) {
        setFormData({
          title: video.title,
          description: video.description || "",
          youtubeLink: video.youtubeLink,
          category: video.category || "tanah longsor",
          status: video.status,
          seriesOrder: video.seriesOrder !== undefined ? video.seriesOrder : 0,
        });
      } else {
        setFormData({
          title: "",
          description: "",
          youtubeLink: "",
          category: "tanah longsor",
          status: "draft",
          seriesOrder: 0,
        });
      }
      setSaving(false);
    }
  }, [isOpen, video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.title.trim() ||
      !formData.youtubeLink.trim() ||
      !formData.category
    )
      return;

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setSaving(false);
      alert("Gagal menyimpan video.");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-labelledby="modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-"
        onClick={onClose}
      />

      {/* Panel - LEBAR & TIDAK MELEBIHI LAYAR */}
      <div className="relative bg-surface-container-lowest rounded-4xl w-full max-w-2xl lg:max-w-3xl max-h- flex flex-col shadow-2xl border border-outline-variant/10 z-10 overflow-hidden">
        <button
          aria-label="Tutup modal"
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none z-20"
          onClick={onClose}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-">
            close
          </span>
        </button>

        {/* Header - fixed */}
        <div className="px-8 pt-8 pb-4 shrink-0 select-none">
          <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary mb-4 shadow-inner">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {video ? "edit" : "cloud_upload"}
            </span>
          </div>
          <h3
            className="font-headline-sm text-headline-sm text-on-surface"
            id="modal-title"
          >
            {video ? "Ubah Video Edukasi" : "Unggah Video Edukasi"}
          </h3>
          <p className="font-caption text-caption text-on-surface-variant mt-1">
            {video
              ? "Perbarui informasi mengenai materi video simulasi kebencanaan."
              : "Tambahkan materi video kebencanaan baru ke dalam sistem pembelajaran."}
          </p>
        </div>

        {/* Form - body scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-8 py-2 space-y-5">
            {/* Grid 2 kolom untuk hemat tinggi */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            </div>

            <div>
              <label
                className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                htmlFor="video-description"
              >
                Deskripsi Video
              </label>
              <textarea
                className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 min-h- resize-y"
                id="video-description"
                placeholder="Masukkan deskripsi materi video edukasi di sini..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* KATEGORI, STATUS, & URUTAN SEJAJAR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-category"
                >
                  Kategori Video
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md pl-4 pr-10 py-3 cursor-pointer appearance-none"
                    id="video-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="tanah longsor">Tanah Longsor</option>
                    <option value="angin puting beliung">
                      Angin Puting Beliung
                    </option>
                    <option value="gempa bumi">Gempa Bumi</option>
                    <option value="banjir">Banjir</option>
                    <option value="tsunami">Tsunami</option>
                    <option value="letusan gunung berapi">
                      Letusan Gunung Berapi
                    </option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl pointer-events-none select-none">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-status"
                >
                  Status
                </label>
                <div className="relative">
                  <select
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md pl-4 pr-10 py-3 cursor-pointer appearance-none"
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
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl pointer-events-none select-none">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2 select-none"
                  htmlFor="video-order"
                >
                  Urutan (Series)
                </label>
                <input
                  className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3"
                  id="video-order"
                  type="number"
                  min="0"
                  value={formData.seriesOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seriesOrder: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer - fixed */}
          <div className="px-8 pt-4 pb-8 flex items-center justify-end gap-3 border-t border-outline-variant/30 mt-4 shrink-0 bg-surface-container-lowest">
            <button
              className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-medium"
              onClick={onClose}
              type="button"
            >
              Batal
            </button>
            <button
              className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-primary text-on-primary clay-btn cursor-pointer font-bold border-none disabled:opacity-50"
              type="submit"
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
