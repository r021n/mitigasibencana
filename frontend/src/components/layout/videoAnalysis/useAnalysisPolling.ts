import { useEffect, useRef } from "react";
import type { YoutubeAnalysis } from "../../../pages/VideoAnalysisPage"; // Sesuaikan path
import { youtubeAnalysisApi } from "../../../api/api";

export function useAnalysisPolling(
  user: any,
  analyses: YoutubeAnalysis[],
  setAnalyses: React.Dispatch<React.SetStateAction<YoutubeAnalysis[]>>
) {
  const isPollingRef = useRef(false);

  // Polling hanya aktif jika ada video dengan status 'pending' atau 'processing'
  const hasActiveAnalysis = analyses.some(
    (item) => item.status === "pending" || item.status === "processing"
  );

  useEffect(() => {
    if (!user || !hasActiveAnalysis) {
      isPollingRef.current = false;
      return;
    }

    // Jika sudah ada polling yang berjalan, jangan buat yang baru
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    console.log("[Polling] Memulai polling progress analisis...");

    const poll = async () => {
      try {
        const updatedList = await youtubeAnalysisApi.getAll();
        setAnalyses(updatedList);

        // Jika semua sudah selesai/gagal setelah di-fetch, hentikan polling
        const stillActive = updatedList.some(
          (item: YoutubeAnalysis) => item.status === "pending" || item.status === "processing"
        );

        if (!stillActive) {
          console.log("[Polling] Semua analisis selesai/gagal. Menghentikan polling...");
          isPollingRef.current = false;
          clearInterval(intervalId);
        }
      } catch (err) {
        console.error("[Polling] Gagal mengambil data analisis terbaru:", err);
      }
    };

    // Jalankan polling setiap 2 detik
    const intervalId = setInterval(poll, 2000);

    return () => {
      console.log("[Polling] Pembersihan interval polling.");
      clearInterval(intervalId);
      isPollingRef.current = false;
    };
  }, [user, hasActiveAnalysis, setAnalyses]);
}
