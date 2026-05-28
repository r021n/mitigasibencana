import type { YoutubeAnalysis } from "../../../pages/VideoAnalysisPage"; // Sesuaikan path menuju main page Anda
import CustomMarkdownRenderer from "./CustomMarkdownRenderer";

interface AnalysisModalProps {
  analysis: YoutubeAnalysis | null;
  onClose: () => void;
  onOpenChat: (id: string) => void;
}

export default function AnalysisModal({
  analysis,
  onClose,
  onOpenChat,
}: AnalysisModalProps) {
  if (!analysis) return null;

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
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[20px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-surface-container-lowest rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-outline-variant/10 z-10 overflow-hidden">
        {/* Close Button */}
        <button
          aria-label="Tutup modal"
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none z-20"
          onClick={onClose}
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px]"
          >
            close
          </span>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0 select-none border-b border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-container/20 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <span
                aria-hidden="true"
                className="material-symbols-outlined text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
            </div>
            <div className="max-w-[calc(100%-4rem)]">
              <h3
                className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 leading-snug"
                id="modal-title"
              >
                Hasil Analisis Inklusi Lengkap
              </h3>
              <p className="font-caption text-caption text-on-surface-variant truncate mt-0.5">
                {analysis.title || "Video YouTube"}
              </p>
            </div>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-surface/30">
          {/* Summary Section */}
          <div className="bg-surface-container-low/60 rounded-2xl p-5 border border-outline-variant/10">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none border-b border-outline-variant/10 pb-2">
              <span className="material-symbols-outlined text-[20px]">
                summarize
              </span>
              Ringkasan Alur & Konten Video
            </h4>
            <CustomMarkdownRenderer
              text={analysis.summary || "Tidak ada ringkasan."}
              className="text-on-surface-variant font-medium text-sm leading-relaxed"
            />
          </div>

          {/* Suggestions Section */}
          <div className="bg-surface-container-low/60 rounded-2xl p-5 border border-outline-variant/10">
            <h4 className="font-bold text-sm text-secondary uppercase tracking-wider mb-3.5 flex items-center gap-2 select-none border-b border-outline-variant/10 pb-2">
              <span className="material-symbols-outlined text-[20px]">
                accessibility_new
              </span>
              Rekomendasi Inklusi & Aksesibilitas
            </h4>
            <CustomMarkdownRenderer
              text={analysis.improvementSuggestions || "Tidak ada rekomendasi."}
              className="text-on-surface-variant font-medium text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant/20 shrink-0 bg-surface-container-lowest">
          {/* Tanya Jawab shortcut */}
          <button
            onClick={() => {
              const id = analysis.id;
              onClose();
              onOpenChat(id);
            }}
            className="px-5 py-2.5 rounded-xl font-label-md text-label-md bg-secondary/15 text-secondary hover:bg-secondary hover:text-on-secondary cursor-pointer font-bold border-none transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Tanya Jawab Lanjutan
          </button>

          <div className="flex gap-3">
            <button
              className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-primary text-on-primary clay-btn cursor-pointer font-bold border-none"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
