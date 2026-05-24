import { Hono } from "hono";
import { verify } from "hono/jwt";
import { eq, inArray, desc } from "drizzle-orm";
import { db } from "../db";
import { comments, commentReplies, users, videos } from "../db/schema";

const commentsRoute = new Hono<{ Variables: { userId?: string } }>();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Optional Auth Middleware to identify logged in users
commentsRoute.use("*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = await verify(token, JWT_SECRET, { alg: "HS256" });
      c.set("userId", payload.sub as string);
    } catch (error) {
      // Ignore invalid token, just treat as guest
    }
  }
  await next();
});

// GET comments by video ID
commentsRoute.get("/:videoId", async (c) => {
  try {
    const videoId = c.req.param("videoId");

    // Fetch comments
    const commentsList = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        guestName: comments.guestName,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.videoId, videoId))
      .orderBy(desc(comments.createdAt));

    if (commentsList.length === 0) {
      return c.json([]);
    }

    const commentIds = commentsList.map(c => c.id);

    // Fetch replies for these comments
    const repliesList = await db
      .select({
        id: commentReplies.id,
        commentId: commentReplies.commentId,
        content: commentReplies.content,
        createdAt: commentReplies.createdAt,
        guestName: commentReplies.guestName,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(commentReplies)
      .leftJoin(users, eq(commentReplies.userId, users.id))
      .where(inArray(commentReplies.commentId, commentIds))
      .orderBy(desc(commentReplies.createdAt));

    // Combine
    const formattedComments = commentsList.map((comment) => {
      return {
        ...comment,
        authorName: comment.user?.name || comment.guestName || "Anonymous",
        replies: repliesList
          .filter((r) => r.commentId === comment.id)
          .map((reply) => ({
            ...reply,
            authorName: reply.user?.name || reply.guestName || "Anonymous",
          })).reverse(), // reverse to show oldest first, or keep desc? Usually oldest replies first.
      };
    });

    return c.json(formattedComments);
  } catch (error) {
    console.error("Get Comments Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST new comment
commentsRoute.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { videoId, content, guestName } = body;

    if (!videoId || !content) {
      return c.json({ error: "Video ID and content are required" }, 400);
    }

    if (!userId && !guestName) {
      return c.json({ error: "Name is required for guest comments" }, 400);
    }

    const newComment = await db
      .insert(comments)
      .values({
        videoId,
        content,
        userId: userId || null,
        guestName: userId ? null : guestName,
      })
      .returning();

    return c.json(newComment[0], 201);
  } catch (error) {
    console.error("Create Comment Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST new reply
commentsRoute.post("/reply", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { commentId, content, guestName } = body;

    if (!commentId || !content) {
      return c.json({ error: "Comment ID and content are required" }, 400);
    }

    if (!userId && !guestName) {
      return c.json({ error: "Name is required for guest replies" }, 400);
    }

    const newReply = await db
      .insert(commentReplies)
      .values({
        commentId,
        content,
        userId: userId || null,
        guestName: userId ? null : guestName,
      })
      .returning();

    return c.json(newReply[0], 201);
  } catch (error) {
    console.error("Create Reply Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default commentsRoute;
