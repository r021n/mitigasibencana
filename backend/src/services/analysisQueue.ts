import "../env";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { eq, asc } from "drizzle-orm";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { db } from "../db";
import { videos, userVideos } from "../db/schema";
import { broadcastProgress } from "./websocket";

const execPromise = promisify(exec);

// Path directories
const tempBaseDir = path.join(process.cwd(), "temp_analysis");

// Ensure temp base dir exists
if (!fs.existsSync(tempBaseDir)) {
  fs.mkdirSync(tempBaseDir, { recursive: true });
}

// Queue State
let isWorkerRunning = false;
let shouldWakeUp = false;

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export const analysisQueue = {
  start() {
    console.log("[Queue] Starting SQLite background worker loop...");
    this.loop();
  },

  notify() {
    console.log("[Queue] New job added. Waking up background worker...");
    shouldWakeUp = true;
    if (!isWorkerRunning) {
      this.loop();
    }
  },

  async loop() {
    if (isWorkerRunning) return;
    isWorkerRunning = true;

    try {
      while (true) {
        shouldWakeUp = false;

        // Fetch next pending job from videos joined with userVideos for the owner userId
        const pendingJobs = await db
          .select({
            id: videos.id,
            youtubeLink: videos.youtubeLink,
            userId: userVideos.userId,
          })
          .from(videos)
          .innerJoin(userVideos, eq(videos.id, userVideos.videoId))
          .where(eq(videos.analysisStatus, "pending"))
          .orderBy(asc(videos.analysisCreatedAt))
          .limit(1);

        if (pendingJobs.length === 0) {
          // No more jobs, pause loop
          console.log("[Queue] No pending jobs. Worker going to sleep.");
          break;
        }

        const job = pendingJobs[0];
        console.log(`[Queue] Starting processing job: ${job.id} for link: ${job.youtubeLink}`);
        
        try {
          await this.processJob(job.id, job.youtubeLink, job.userId);
        } catch (jobError: any) {
          console.error(`[Queue] Failed processing job ${job.id}:`, jobError);
          // Set status to failed in database
          await db
            .update(videos)
            .set({
              analysisStatus: "failed",
              progress: 0,
              progressMessage: "Proses analisis gagal.",
              errorMessage: jobError.message || "Unknown error occurred.",
              analysisUpdatedAt: Date.now(),
            })
            .where(eq(videos.id, job.id));

          // Broadcast failure to client
          broadcastProgress(job.userId, job.id, "failed", 0, "Proses analisis gagal.", {
            errorMessage: jobError.message || "Unknown error.",
          });
        }
      }
    } catch (loopError) {
      console.error("[Queue] Fatal worker loop error:", loopError);
    } finally {
      isWorkerRunning = false;
      // If notified while checking, restart
      if (shouldWakeUp) {
        this.loop();
      }
    }
  },

  async processJob(jobId: string, youtubeLink: string, userId: string) {
    const jobTempDir = path.join(tempBaseDir, jobId);
    if (!fs.existsSync(jobTempDir)) {
      fs.mkdirSync(jobTempDir, { recursive: true });
    }

    const tempVideoPath = path.join(jobTempDir, "video.mp4");
    const framesOutputDir = path.join(jobTempDir, "frames");
    if (!fs.existsSync(framesOutputDir)) {
      fs.mkdirSync(framesOutputDir, { recursive: true });
    }

    try {
      // 1. Dapatkan metadata & Validasi Durasi (Maksimal 6 menit / 360 detik)
      console.log(`[Queue][${jobId}] Memeriksa durasi video...`);
      broadcastProgress(userId, jobId, "processing", 5, "Memeriksa durasi video...");
      await db
        .update(videos)
        .set({
          analysisStatus: "processing",
          progress: 5,
          progressMessage: "Memeriksa durasi video...",
          analysisUpdatedAt: Date.now(),
        })
        .where(eq(videos.id, jobId));

      let durationInSeconds = 0;
      let videoTitle = "Video YouTube";
      try {
        const { stdout: durationStdout } = await execPromise(
          `yt-dlp --print "%(duration)s" --no-playlist "${youtubeLink}"`
        );
        durationInSeconds = parseInt(durationStdout.trim(), 10) || 0;

        const { stdout: titleStdout } = await execPromise(
          `yt-dlp --print "%(title)s" --no-playlist "${youtubeLink}"`
        );
        videoTitle = titleStdout.trim() || videoTitle;
      } catch (err: any) {
        const isNotRecognized = err.message.includes("yt-dlp") && 
          (err.message.includes("not recognized") || err.message.includes("not found") || err.message.includes("ENOENT"));
        
        if (isNotRecognized) {
          throw new Error(
            "Utilitas 'yt-dlp' tidak terpasang di sistem Anda. Fitur ini memerlukan 'yt-dlp' untuk mengunduh video. " +
            "Cara instalasi: \n" +
            "• Di Windows (PowerShell/CMD): Jalankan 'winget install yt-dlp'\n" +
            "• Di Linux (Ubuntu/Debian): Jalankan 'sudo apt-get install yt-dlp'"
          );
        }
        throw new Error(`Gagal memuat metadata YouTube. Pastikan link valid. Detail: ${err.message}`);
      }

      console.log(`[Queue][${jobId}] Judul: "${videoTitle}", Durasi: ${durationInSeconds} detik`);

      if (durationInSeconds > 360) {
        throw new Error("Durasi video melebihi batas maksimal yang diizinkan (6 menit).");
      }

      // Update waktu pembaruan di Database (tidak mengubah judul/nama video)
      await db
        .update(videos)
        .set({ analysisUpdatedAt: Date.now() })
        .where(eq(videos.id, jobId));

      // 2. Download Video (240p / worst resolution)
      console.log(`[Queue][${jobId}] Mengunduh video (kualitas 240p)...`);
      broadcastProgress(userId, jobId, "processing", 15, "Mengunduh video (kualitas 240p)...");
      await db
        .update(videos)
        .set({
          progress: 15,
          progressMessage: "Mengunduh video (kualitas 240p)...",
          analysisUpdatedAt: Date.now(),
        })
        .where(eq(videos.id, jobId));

      // Mengunduh format pre-merged terendah (seperti format 18 atau mp4 yang sudah menyatu video+audio)
      // untuk menghindari proses merging via ffmpeg yang memicu error file locking di Windows.
      try {
        await execPromise(
          `yt-dlp -f "18/worst[ext=mp4][vcodec!=none][acodec!=none]/worst[vcodec!=none][acodec!=none]/worst" --no-playlist -o "${tempVideoPath}" "${youtubeLink}"`
        );
      } catch (downloadErr: any) {
        throw new Error(`Gagal mengunduh video dari YouTube. Detail: ${downloadErr.message}`);
      }

      // 3. Ekstrak Tangkapan Layar (Screenshot setiap 15 detik)
      console.log(`[Queue][${jobId}] Mengekstrak frame gambar tiap 15 detik...`);
      broadcastProgress(userId, jobId, "processing", 40, "Mengekstrak frame gambar...");
      await db
        .update(videos)
        .set({
          progress: 40,
          progressMessage: "Mengekstrak frame gambar...",
          analysisUpdatedAt: Date.now(),
        })
        .where(eq(videos.id, jobId));

      try {
        // fps=1/15 mengambil 1 gambar setiap 15 detik.
        // -vsync vfr menggunakan variable frame rate untuk ekstraksi
        await execPromise(
          `ffmpeg -y -i "${tempVideoPath}" -vf "fps=1/15" -vsync vfr -q:v 2 "${framesOutputDir}/frame_%03d.jpg"`
        );
      } catch (ffmpegErr: any) {
        const isNotRecognized = ffmpegErr.message.includes("ffmpeg") && 
          (ffmpegErr.message.includes("not recognized") || ffmpegErr.message.includes("not found") || ffmpegErr.message.includes("ENOENT"));
        
        if (isNotRecognized) {
          throw new Error(
            "Utilitas 'ffmpeg' tidak terpasang di sistem Anda. Fitur ini memerlukan 'ffmpeg' untuk memotong frame video. " +
            "Cara instalasi: \n" +
            "• Di Windows (PowerShell/CMD): Jalankan 'winget install FFmpeg'\n" +
            "• Di Linux (Ubuntu/Debian): Jalankan 'sudo apt-get install ffmpeg'"
          );
        }
        throw new Error(`Gagal mengekstrak frame dari video. Detail: ${ffmpegErr.message}`);
      }

      // Baca daftar frame yang diekstraksi
      let frames = fs
        .readdirSync(framesOutputDir)
        .filter((file) => file.endsWith(".jpg"))
        .map((file) => path.join(framesOutputDir, file))
        .sort();

      console.log(`[Queue][${jobId}] Berhasil mengekstrak ${frames.length} frame.`);

      if (frames.length === 0) {
        throw new Error("Tidak ada frame gambar yang berhasil diekstraksi dari video.");
      }

      // Batasi maksimal 30 gambar (lakukan sampling reguler secara merata jika melebihi 30)
      if (frames.length > 30) {
        console.log(`[Queue][${jobId}] Jumlah frame (${frames.length}) melebihi 30. Melakukan sampling...`);
        const sampledFrames: string[] = [];
        const step = frames.length / 30;
        for (let i = 0; i < 30; i++) {
          const index = Math.floor(i * step);
          sampledFrames.push(frames[index]);
        }
        frames = sampledFrames;
      }

      // 4. Analisis Menggunakan AI Gemini (Mengirim data tangkapan layar + prompt)
      console.log(`[Queue][${jobId}] Menganalisis inklusi video dengan AI Gemini...`);
      broadcastProgress(userId, jobId, "processing", 70, "Menganalisis inklusi video dengan AI Gemini...");
      await db
        .update(videos)
        .set({
          progress: 70,
          progressMessage: "Menganalisis inklusi video dengan AI Gemini...",
          analysisUpdatedAt: Date.now(),
        })
        .where(eq(videos.id, jobId));

      // Persiapkan payload multimodal untuk Gemini API sesuai panduan @google/genai
      const contentsPayload: any[] = [];

      // Baca file gambar sebagai base64 dan masukkan ke inlineData
      for (const framePath of frames) {
        const base64Data = fs.readFileSync(framePath).toString("base64");
        contentsPayload.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        });
      }

      // Tambahkan Prompt Text terstruktur
      const promptText = `
        Anda adalah pakar aksesibilitas dan inklusi media pembelajaran.
        Saya mengunggah beberapa tangkapan layar (screenshots) dari sebuah video edukasi kebencanaan yang berurutan setiap 15 detik.

        Tugas Anda adalah:
        1. Buat RINGKASAN VIDEO (summary): Dapatkan ringkasan singkat alur visual dan isi konten video kebencanaan berdasarkan gambar-gambar ini. Usahakan ringkasan yang dibuat padat, jelas, singkat, dan tidak terlalu panjang (maksimal 2 paragraf pendek).
        2. Tentukan SARAN IMPROVEMENT INKLUSI (improvementSuggestions): Berikan rekomendasi singkat dan taktis untuk meningkatkan fitur inklusi video (seperti teks/subtitle, interpreter bahasa isyarat, kontras warna, tempo, dll.).
           Format saran ini sebagai daftar poin-poin sederhana (bullet list, menggunakan tanda strip "-"). Usahakan sangat ringkas, padat, dan langsung pada intinya. Jangan gunakan format checklist/markdown task (jangan gunakan kotak centang).

        Kembalikan output dalam format JSON terstruktur dengan kunci:
        - "summary": String ringkasan singkat video (gunakan markdown secukupnya).
        - "improvementSuggestions": String berisi daftar poin-poin sederhana saran perbaikan (bullet list).
      `;
      contentsPayload.push({ text: promptText });

      let geminiResponse;
      try {
        const response = await ai.models.generateContent({
          model: "gemma-4-31b-it",
          contents: contentsPayload,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                summary: {
                  type: "STRING",
                  description: "Ringkasan singkat, padat, dan jelas dari alur visual dan isi konten video kebencanaan.",
                },
                improvementSuggestions: {
                  type: "STRING",
                  description: "Daftar poin-poin ringkas sederhana (bullet list) untuk saran perbaikan inklusi video.",
                },
              },
              required: ["summary", "improvementSuggestions"],
            },
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.MINIMAL,
            },
          },
        });

        geminiResponse = JSON.parse(response.text || "{}");
      } catch (geminiErr: any) {
        throw new Error(`Gagal menganalisis gambar dengan Gemini AI. Detail: ${geminiErr.message}`);
      }

      const summary = geminiResponse.summary || "Gagal memproses ringkasan.";
      const improvementSuggestions = geminiResponse.improvementSuggestions || "Gagal memproses saran perbaikan.";

      // 5. Simpan Hasil Analisis & Selesai
      console.log(`[Queue][${jobId}] Analisis selesai sukses! Menyimpan ke DB...`);
      await db
        .update(videos)
        .set({
          analysisStatus: "completed",
          progress: 100,
          progressMessage: "Analisis selesai.",
          summary,
          improvementSuggestions,
          analysisUpdatedAt: Date.now(),
        })
        .where(eq(videos.id, jobId));

      // Broadcast sukses ke klien
      broadcastProgress(userId, jobId, "completed", 100, "Analisis selesai.", {
        summary,
        improvementSuggestions,
      });

    } finally {
      // PENTING: Bersihkan file & folder temporer agar VPS 2 core tidak penuh!
      console.log(`[Queue][${jobId}] Membersihkan folder temporer...`);
      try {
        if (fs.existsSync(jobTempDir)) {
          fs.rmSync(jobTempDir, { recursive: true, force: true });
        }
      } catch (cleanupErr) {
        console.error(`[Queue][${jobId}] Gagal membersihkan folder temporer:`, cleanupErr);
      }
    }
  },
};
