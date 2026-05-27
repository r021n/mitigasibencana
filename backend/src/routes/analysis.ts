import "../env";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { eq, and, asc } from "drizzle-orm";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { db } from "../db";
import { youtubeAnalyses, youtubeAnalysisChats } from "../db/schema";
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

// GET all analyses for the current authenticated user (Private visibility)
analysisRoute.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const list = await db
      .select()
      .from(youtubeAnalyses)
      .where(eq(youtubeAnalyses.userId, userId))
      .orderBy(asc(youtubeAnalyses.createdAt));

    return c.json(list);
  } catch (error) {
    console.error("Get Analyses Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST create new youtube analysis job
analysisRoute.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { youtubeLink } = body;

    if (!youtubeLink) {
      return c.json({ error: "Tautan YouTube wajib diisi" }, 400);
    }

    // Insert new pending job
    const newAnalysis = await db
      .insert(youtubeAnalyses)
      .values({
        userId,
        youtubeLink,
        status: "pending",
        progress: 0,
        progressMessage: "Dalam antrean...",
      })
      .returning();

    // Trigger background queue worker
    analysisQueue.notify();

    return c.json(newAnalysis[0], 201);
  } catch (error) {
    console.error("Create Analysis Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST start/restart analysis for a specific record
analysisRoute.post("/:id/analyze", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // Verify record ownership
    const found = await db
      .select()
      .from(youtubeAnalyses)
      .where(and(eq(youtubeAnalyses.id, id), eq(youtubeAnalyses.userId, userId)));

    if (found.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    // Reset status to pending
    const updated = await db
      .update(youtubeAnalyses)
      .set({
        status: "pending",
        progress: 0,
        progressMessage: "Dalam antrean...",
        errorMessage: null,
        updatedAt: Date.now(),
      })
      .where(eq(youtubeAnalyses.id, id))
      .returning();

    // Trigger queue
    analysisQueue.notify();

    return c.json(updated[0]);
  } catch (error) {
    console.error("Analyze Trigger Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE video analysis entry
analysisRoute.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // Verify record ownership
    const found = await db
      .select()
      .from(youtubeAnalyses)
      .where(and(eq(youtubeAnalyses.id, id), eq(youtubeAnalyses.userId, userId)));

    if (found.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    await db
      .delete(youtubeAnalyses)
      .where(eq(youtubeAnalyses.id, id));

    return c.json({ success: true, message: "Catatan analisis berhasil dihapus" });
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET chats for a specific analysis
analysisRoute.get("/:id/chats", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");

    // Verify record ownership
    const found = await db
      .select()
      .from(youtubeAnalyses)
      .where(and(eq(youtubeAnalyses.id, id), eq(youtubeAnalyses.userId, userId)));

    if (found.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    const chatList = await db
      .select()
      .from(youtubeAnalysisChats)
      .where(eq(youtubeAnalysisChats.analysisId, id))
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

    // Verify record ownership & get analysis summary
    const found = await db
      .select()
      .from(youtubeAnalyses)
      .where(and(eq(youtubeAnalyses.id, id), eq(youtubeAnalyses.userId, userId)));

    if (found.length === 0) {
      return c.json({ error: "Analisis tidak ditemukan" }, 404);
    }

    const analysisRecord = found[0];
    if (analysisRecord.status !== "completed") {
      return c.json({ error: "Analisis harus selesai sebelum memulai chat lanjutan" }, 400);
    }

    // Get previous chat history
    const previousChats = await db
      .select()
      .from(youtubeAnalysisChats)
      .where(eq(youtubeAnalysisChats.analysisId, id))
      .orderBy(asc(youtubeAnalysisChats.createdAt));

    // Save user message in DB
    const insertedUserMessage = await db
      .insert(youtubeAnalysisChats)
      .values({
        analysisId: id,
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
        analysisId: id,
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
