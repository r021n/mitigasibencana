import "../env";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { eq, and, asc } from "drizzle-orm";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { db } from "../db";
import { videos, youtubeAnalysisChats, userVideos } from "../db/schema";
import { analysisQueue } from "../services/analysisQueue";

const analysisRoute = new Hono<{ Variables: { userId: string } }>();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Auth Middleware (Required for all endpoints in this route)
analysisRoute.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  try {
    const token = authHeader.split(" ")[1];
    const payload = await verify(token, JWT_SECRET, { alg: "HS256" });
    c.set("userId", payload.sub as string);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token" }, 401);
  }
});

// GET all video analyses for the current authenticated user
analysisRoute.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const list = await db
      .select({
        id: videos.id,
        youtubeLink: videos.youtubeLink,
        title: videos.title,
        status: videos.analysisStatus,
        progress: videos.progress,
        progressMessage: videos.progressMessage,
        summary: videos.summary,
        improvementSuggestions: videos.improvementSuggestions,
        errorMessage: videos.errorMessage,
        createdAt: videos.analysisCreatedAt,
        updatedAt: videos.analysisUpdatedAt,
      })
      .from(videos)
      .innerJoin(userVideos, eq(videos.id, userVideos.videoId))
      .where(eq(userVideos.userId, userId))
      .orderBy(asc(videos.analysisCreatedAt));

    // For any videos that haven't been analyzed or have null createdAt, default it safely
    const formattedList = list.map((item: any) => ({
      ...item,
      status: item.status || null, // Keep it null so it won't default to pending!
      createdAt: item.createdAt || Date.now(),
      updatedAt: item.updatedAt || Date.now(),
    }));

    return c.json(formattedList);
  } catch (error) {
    console.error("Get Analyses Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST start/restart analysis for a specific video
analysisRoute.post("/:id/analyze", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // Verify record ownership via userVideos table
    const ownership = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.videoId, id)));

    if (ownership.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    // Reset status to pending in videos table
    const updated = await db
      .update(videos)
      .set({
        analysisStatus: "pending",
        progress: 0,
        progressMessage: "Dalam antrean...",
        errorMessage: null,
        analysisCreatedAt: Date.now(),
        analysisUpdatedAt: Date.now(),
      })
      .where(eq(videos.id, id))
      .returning();

    const video = updated[0];
    const mapped = {
      id: video.id,
      youtubeLink: video.youtubeLink,
      title: video.title,
      status: video.analysisStatus,
      progress: video.progress,
      progressMessage: video.progressMessage,
      summary: video.summary,
      improvementSuggestions: video.improvementSuggestions,
      errorMessage: video.errorMessage,
      createdAt: video.analysisCreatedAt,
      updatedAt: video.analysisUpdatedAt,
    };

    // Trigger background queue worker
    analysisQueue.notify();

    return c.json(mapped);
  } catch (error) {
    console.error("Analyze Trigger Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET chats for a specific video
analysisRoute.get("/:id/chats", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // Verify record ownership
    const ownership = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.videoId, id)));

    if (ownership.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    const chatList = await db
      .select()
      .from(youtubeAnalysisChats)
      .where(eq(youtubeAnalysisChats.videoId, id))
      .orderBy(asc(youtubeAnalysisChats.createdAt));

    return c.json(chatList);
  } catch (error) {
    console.error("Get Chats Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST send new chat message and get Gemini AI follow-up response
analysisRoute.post("/:id/chat", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = await c.req.json();
    const { content } = body;

    if (!content) {
      return c.json({ error: "Pesan wajib diisi" }, 400);
    }

    // Verify record ownership & get analysis summary from videos table
    const found = await db
      .select({
        id: videos.id,
        title: videos.title,
        youtubeLink: videos.youtubeLink,
        analysisStatus: videos.analysisStatus,
        summary: videos.summary,
        improvementSuggestions: videos.improvementSuggestions,
      })
      .from(videos)
      .innerJoin(userVideos, eq(videos.id, userVideos.videoId))
      .where(and(eq(videos.id, id), eq(userVideos.userId, userId)));

    if (found.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    const analysisRecord = found[0];
    if (analysisRecord.analysisStatus !== "completed") {
      return c.json({ error: "Analisis harus selesai sebelum memulai chat lanjutan" }, 400);
    }

    // Get previous chat history
    const previousChats = await db
      .select()
      .from(youtubeAnalysisChats)
      .where(eq(youtubeAnalysisChats.videoId, id))
      .orderBy(asc(youtubeAnalysisChats.createdAt));

    // Save user message in DB
    const insertedUserMessage = await db
      .insert(youtubeAnalysisChats)
      .values({
        videoId: id,
        role: "user",
        content,
      })
      .returning();

    // Call Gemini for response
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    
    // Construct system instructions
    const systemPrompt = `
      Anda adalah pakar inklusi dan aksesibilitas video edukasi kebencanaan.
      Anda sedang berdiskusi dengan seorang guru mengenai sebuah video YouTube yang telah Anda analisis sebelumnya.
      Berikut adalah detail analisis video tersebut:
      
      Judul Video: "${analysisRecord.title || "Video YouTube"}"
      Tautan Video: ${analysisRecord.youtubeLink}
      
      RINGKASAN VIDEO ASLI:
      ${analysisRecord.summary}
      
      SARAN IMPROVEMENT ASLI:
      ${analysisRecord.improvementSuggestions}
      
      Tugas Anda adalah membalas chat dari calon guru (mahasiswa) dan memberikan panduan taktis, ramah, solutif, dan mudah diterapkan mengenai cara memperbaiki aspek inklusi video mereka (misalnya cara membuat subtitle di YouTube Studio, cara menyewa interpreter bahasa isyarat, merancang kontras warna yang ideal, mengatur kecepatan transisi visual, dll.).
      Tanggapi dalam bahasa Indonesia yang ramah, sopan, dan profesional. Jangan memberikan markdown heading tingkat 1 atau 2, gunakan cetak tebal (bold) atau poin-poin yang mudah dipahami.

      PENTING:
      Respon Anda HARUS sangat singkat, padat, langsung menjawab pertanyaan inti guru, dan mudah dimengerti. Batasi respon maksimal hanya 2 paragraf pendek atau 3-4 poin daftar ringkas. Hindari jawaban yang terlalu panjang atau bertele-tele.
    `;

    // Map history to Gemini API format
    const contentsPayload: any[] = [];
    
    for (const chat of previousChats) {
      contentsPayload.push({
        role: chat.role === "user" ? "user" : "model",
        parts: [{ text: chat.content }],
      });
    }

    // Add current user message
    contentsPayload.push({
      role: "user",
      parts: [{ text: content }],
    });

    // Generate response using gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: contentsPayload,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 600, // Enforce a strict token limit to prevent lengthy responses
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL,
        },
      }
    });

    const aiText = response.text || "Maaf, saya tidak dapat menjawab pertanyaan Anda saat ini.";

    // Save Gemini's response in DB
    const insertedModelMessage = await db
      .insert(youtubeAnalysisChats)
      .values({
        videoId: id,
        role: "model",
        content: aiText,
      })
      .returning();

    return c.json({
      userMessage: insertedUserMessage[0],
      modelMessage: insertedModelMessage[0]
    });
  } catch (error: any) {
    console.error("Chat Error:", error);
    return c.json({ error: error.message || "Internal server error" }, 500);
  }
});

export default analysisRoute;
