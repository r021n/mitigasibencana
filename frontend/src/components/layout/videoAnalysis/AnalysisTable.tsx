import { useState } from "react";
import type { YoutubeAnalysis } from "../../../pages/VideoAnalysisPage"; // Sesuaikan path

interface AnalysisTableProps {
  isLoading: boolean;
  filteredAnalyses: YoutubeAnalysis[];
  onTriggerAnalysis: (id: string) => void;
  onChatOpen: (id: string) => void;
  onSelectModal: (item: YoutubeAnalysis) => void;
}

export default function AnalysisTable({
  isLoading,
  filteredAnalyses,
  onTriggerAnalysis,
  onChatOpen,
  onSelectModal,
}: AnalysisTableProps) {
  const [triggeringIds, setTriggeringIds] = useState<Record<string, boolean>>(
    {},
  );

  const handleTriggerClick = async (id: string) => {
    if (triggeringIds[id]) return;
    setTriggeringIds((prev) => ({ ...prev, [id]: true }));
    try {
      await onTriggerAnalysis(id);
    } finally {
      // Clear triggering state after 2 seconds to allow the state update to propagate
      setTimeout(() => {
        setTriggeringIds((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 2000);
    }
  };

  // Helper dimasukkan ke dalam tabel karena hanya tabel yang membutuhkannya

  const getMarkdownPreview = (text: string | null, maxLength = 120) => {
    if (!text) return "";
    const plainText = text
      .replace(/[#*`_~\-]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  return (
    <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 clay-card overflow-hidden border border-outline-variant/10">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50">
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-1/4">
                Judul & Tautan Video
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-1/6">
                Status & Progres
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-5/12">
                Hasil Ringkasan & Saran Inklusi
              </th>
              <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase text-right select-none w-1/6">
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
                  Sedang memuat data analisis...
                </td>
              </tr>
            ) : filteredAnalyses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="py-12 text-center text-on-surface-variant select-none"
                >
                  <span className="material-symbols-outlined text-5xl text-outline-variant/50 block mb-2">
                    analytics
                  </span>
                  Belum ada video yang ditambahkan di Dashboard untuk
                  dianalisis.
                </td>
              </tr>
            ) : (
              filteredAnalyses.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 align-top"
                >
                  {/* Video info */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="material-symbols-outlined text-red-500 font-bold"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          play_circle
                        </span>
                        <span className="font-semibold text-on-surface line-clamp-2 leading-tight">
                          {item.title || "Mengambil metadata..."}
                        </span>
                      </div>
                      <a
                        className="text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer text-xs truncate max-w-[240px]"
                        href={item.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.youtubeLink.replace(
                          /^(https?:\/\/)?(www\.)?/,
                          "",
                        )}
                        <span className="material-symbols-outlined text-[14px]">
                          open_in_new
                        </span>
                      </a>
                      <span className="text-[10px] text-on-surface-variant opacity-75 mt-1 select-none">
                        Dibuat:{" "}
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </td>

                  {/* Status & Progress */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-2 w-full pr-2">
                      <div>
                        {(!item.status ||
                          (item.status !== "pending" &&
                            item.status !== "processing" &&
                            item.status !== "completed" &&
                            item.status !== "failed")) && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-variant/60 text-on-surface-variant">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/50" />{" "}
                            Belum Dianalisis
                          </span>
                        )}
                        {item.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-variant text-on-surface-variant animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />{" "}
                            Dalam Antrean
                          </span>
                        )}
                        {item.status === "processing" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />{" "}
                            Menganalisis
                          </span>
                        )}
                        {item.status === "completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/20 text-success">
                            <span className="material-symbols-outlined text-[14px] font-bold">
                              check
                            </span>{" "}
                            Selesai
                          </span>
                        )}
                        {item.status === "failed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-error/20 text-error">
                            <span className="material-symbols-outlined text-[14px] font-bold">
                              error
                            </span>{" "}
                            Gagal
                          </span>
                        )}
                      </div>

                      {/* Linear Progress Bar */}
                      {(item.status === "pending" ||
                        item.status === "processing") && (
                        <div className="w-full space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                            <span className="truncate max-w-[120px]">
                              {item.progressMessage}
                            </span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {item.status === "failed" && (
                        <p className="text-xs text-error font-medium leading-tight mt-1">
                          {item.errorMessage ||
                            "Terjadi kesalahan tidak diketahui."}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Summary & Suggestions Column */}
                  <td className="py-4 px-4 border-r border-outline-variant/10">
                    {item.status === "completed" ? (
                      <div className="space-y-3 pr-2">
                        <div className="bg-surface-container-low/40 rounded-xl p-3 border border-outline-variant/5">
                          <h4 className="font-bold text-[11px] text-primary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[14px]">
                              summarize
                            </span>{" "}
                            Ringkasan Alur
                          </h4>
                          <p className="text-on-surface-variant font-medium text-xs leading-relaxed">
                            {getMarkdownPreview(item.summary, 120)}
                          </p>
                        </div>

                        <div className="bg-surface-container-low/40 rounded-xl p-3 border border-outline-variant/5">
                          <h4 className="font-bold text-[11px] text-secondary uppercase tracking-wider mb-1 flex items-center gap-1 select-none">
                            <span className="material-symbols-outlined text-[14px]">
                              accessibility_new
                            </span>{" "}
                            Rekomendasi Inklusi
                          </h4>
                          <p className="text-on-surface-variant font-medium text-xs leading-relaxed">
                            {getMarkdownPreview(
                              item.improvementSuggestions,
                              120,
                            )}
                          </p>
                        </div>

                        <button
                          onClick={() => onSelectModal(item)}
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold bg-transparent border-none cursor-pointer hover:underline mt-1 p-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            visibility
                          </span>{" "}
                          Lihat Selengkapnya
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant/40 select-none">
                        <span className="material-symbols-outlined text-4xl mb-1 animate-pulse">
                          hourglass_empty
                        </span>
                        <span className="text-xs font-medium">
                          {(!item.status ||
                            (item.status !== "pending" &&
                              item.status !== "processing" &&
                              item.status !== "failed")) &&
                            "Video belum dianalisis. Tekan tombol play untuk memulai."}
                          {item.status === "pending" &&
                            "Menunggu giliran antrean..."}
                          {item.status === "processing" &&
                            "AI sedang merumuskan inklusi..."}
                          {item.status === "failed" &&
                            "Analisis gagal. Silakan coba lagi."}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {item.status !== "processing" &&
                        item.status !== "pending" && (
                          <button
                            disabled={triggeringIds[item.id]}
                            onClick={() => handleTriggerClick(item.id)}
                            title={
                              item.status === "completed"
                                ? "Analisis Ulang"
                                : "Mulai Analisis"
                            }
                            className={`p-2 rounded-lg border-none flex items-center justify-center transition-all ${
                              triggeringIds[item.id]
                                ? "bg-surface-container text-outline-variant cursor-not-allowed opacity-50"
                                : item.status === "completed"
                                  ? "text-outline hover:text-primary bg-surface-container hover:bg-primary/10 cursor-pointer"
                                  : "text-primary bg-primary/15 hover:bg-primary hover:text-on-primary font-bold shadow-sm cursor-pointer"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[20px] ${triggeringIds[item.id] ? "animate-spin" : ""}`}
                            >
                              {triggeringIds[item.id]
                                ? "sync"
                                : item.status === "completed"
                                  ? "autorenew"
                                  : "play_arrow"}
                            </span>
                          </button>
                        )}

                      <button
                        disabled={item.status !== "completed"}
                        onClick={() => onChatOpen(item.id)}
                        title="Tanya Jawab / Chat Lanjutan"
                        className={`p-2 rounded-lg border-none flex items-center justify-center transition-all ${
                          item.status === "completed"
                            ? "text-secondary bg-secondary/15 hover:bg-secondary hover:text-on-secondary cursor-pointer font-bold shadow-sm"
                            : "text-outline bg-surface-container-low opacity-40 cursor-not-allowed"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          chat
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
  );
}
