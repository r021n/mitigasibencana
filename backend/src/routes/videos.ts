import { Hono } from "hono";
import { verify } from "hono/jwt";
import { eq, and, like } from "drizzle-orm";
import { db } from "../db";
import { videos, userVideos, users } from "../db/schema";

const videosRoute = new Hono<{ Variables: { userId: string } }>();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const ALLOWED_CATEGORIES = [
  "tanah longsor",
  "angin puting beliung",
  "gempa bumi",
  "banjir",
  "tsunami",
  "letusan gunung berapi",
] as const;

type Category = typeof ALLOWED_CATEGORIES[number];

// GET public videos (published only)
videosRoute.get("/public", async (c) => {
  try {
    const q = c.req.query("q")?.trim() || "";
    const categoryRaw = c.req.query("category")?.trim() || "";
    const page = parseInt(c.req.query("page") || "1");
    const limit = 15;
    const offset = (page - 1) * limit;

    let conditions = [eq(videos.status, "publish")];
   if (q) {
      conditions.push(like(videos.title, `%${q}%`));
    }
    if (categoryRaw && (ALLOWED_CATEGORIES as readonly string[]).includes(categoryRaw)) {
      const category = categoryRaw as Category;
      conditions.push(eq(videos.category, category));
    }

    const whereClause = and(...conditions);

    const result = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        youtubeLink: videos.youtubeLink,
        category: videos.category,
      })
      .from(videos)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const allMatching = await db.select({ id: videos.id }).from(videos).where(whereClause);
    const totalVideos = allMatching.length;
    const totalPages = Math.ceil(totalVideos / limit);

    return c.json({
      data: result,
      pagination: {
        total: totalVideos,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get Public Videos Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET single public video (published only)
videosRoute.get("/public/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        youtubeLink: videos.youtubeLink,
        category: videos.category,
        ownerName: users.name,
      })
      .from(videos)
      .leftJoin(userVideos, eq(videos.id, userVideos.videoId))
      .leftJoin(users, eq(userVideos.userId, users.id))
      .where(and(eq(videos.id, id), eq(videos.status, "publish")));

    if (result.length === 0) {
      return c.json({ error: "Video not found or not published" }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    console.error("Get Public Video By ID Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Middleware to authenticate JWT
videosRoute.use("*", async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.split(" ")[1];
    const payload = await verify(token, JWT_SECRET, { alg: "HS256" });
    c.set("userId", payload.sub as string);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});

// GET all videos (supports filtering by 'q' search param)
videosRoute.get("/", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const q = c.req.query("q");

    const query = db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        youtubeLink: videos.youtubeLink,
        category: videos.category,
        status: videos.status,
      })
      .from(videos)
      .innerJoin(userVideos, eq(videos.id, userVideos.videoId));

    let result;
    if (q && q.trim()) {
      result = await query.where(
        and(
          eq(userVideos.userId, userId),
          like(videos.title, `%${q.trim()}%`)
        )
      );
    } else {
      result = await query.where(eq(userVideos.userId, userId));
    }

    return c.json(result);
  } catch (error) {
    console.error("Get Videos Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET video by ID
videosRoute.get("/:id", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");

    const result = await db
      .select({
        id: videos.id,
        title: videos.title,
        description: videos.description,
        youtubeLink: videos.youtubeLink,
        category: videos.category,
        status: videos.status,
      })
      .from(videos)
      .innerJoin(userVideos, eq(videos.id, userVideos.videoId))
      .where(and(eq(userVideos.userId, userId), eq(videos.id, id)));

    if (result.length === 0) {
      return c.json({ error: "Video not found" }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    console.error("Get Video By ID Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// CREATE video
videosRoute.post("/", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const body = await c.req.json();
    const { title, description, youtubeLink, category, status } = body;

    if (!title || !youtubeLink || !category) {
      return c.json({ error: "Title, YouTube link, and category are required" }, 400);
    }

    // 1. Insert video
    const newVideo = await db
      .insert(videos)
      .values({
        title,
        description: description || "",
        youtubeLink,
        category,
        status: status || "draft",
      })
      .returning();

    const video = newVideo[0];

    // 2. Link video to user
    await db.insert(userVideos).values({
      userId,
      videoId: video.id,
    });

    return c.json(video, 201);
  } catch (error) {
    console.error("Create Video Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// EDIT video
videosRoute.put("/:id", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, description, youtubeLink, category, status } = body;

    // Check ownership first
    const ownership = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.videoId, id)));

    if (ownership.length === 0) {
      return c.json({ error: "Video not found or access denied" }, 404);
    }

    // Update video
    const updated = await db
      .update(videos)
      .set({
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        youtubeLink: youtubeLink !== undefined ? youtubeLink : undefined,
        category: category !== undefined ? category : undefined,
        status: status !== undefined ? status : undefined,
      })
      .where(eq(videos.id, id))
      .returning();

    return c.json(updated[0], 200);
  } catch (error) {
    console.error("Update Video Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE video
videosRoute.delete("/:id", async (c) => {
  try {
    const userId = c.get("userId") as string;
    const id = c.req.param("id");

    // Check ownership first
    const ownership = await db
      .select()
      .from(userVideos)
      .where(and(eq(userVideos.userId, userId), eq(userVideos.videoId, id)));

    if (ownership.length === 0) {
      return c.json({ error: "Video not found or access denied" }, 404);
    }

    // Delete video (cascade will clean userVideos automatically)
    await db.delete(videos).where(eq(videos.id, id));

    return c.json({ success: true, message: "Video deleted successfully" }, 200);
  } catch (error) {
    console.error("Delete Video Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default videosRoute;
