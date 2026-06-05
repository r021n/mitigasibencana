import { Hono } from "hono";
import { verify } from "hono/jwt";
import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { materials, users } from "../db/schema";

const materialsRoute = new Hono<{ Variables: { user: any } }>();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Middleware to check authentication and authorization (teacher/admin)
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = await verify(token, JWT_SECRET, { alg: "HS256" });
  } catch (e) {
    return c.json({ error: "Invalid token" }, 401);
  }

  const userId = payload.sub as string;
  const foundUsers = await db.select().from(users).where(eq(users.id, userId));
  if (foundUsers.length === 0) {
    return c.json({ error: "User not found" }, 401);
  }

  c.set("user", foundUsers[0]);
  await next();
};

const requireAdminOrTeacher = async (c: any, next: any) => {
  const user = c.get("user");
  if (user.status !== "admin" && user.status !== "teacher") {
    return c.json({ error: "Forbidden: Only admins and teachers can perform this action" }, 403);
  }
  await next();
};

// GET all materials (Public)
materialsRoute.get("/", async (c) => {
  try {
    const allMaterials = await db.select({
      id: materials.id,
      title: materials.title,
      audioUrl: materials.audioUrl,
      status: materials.status,
      createdAt: materials.createdAt,
      updatedAt: materials.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      }
    })
    .from(materials)
    .leftJoin(users, eq(materials.authorId, users.id))
    .orderBy(desc(materials.createdAt));

    return c.json(allMaterials, 200);
  } catch (error) {
    console.error("Get Materials Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// GET single material (Public)
materialsRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const foundMaterials = await db.select({
      id: materials.id,
      title: materials.title,
      content: materials.content,
      audioUrl: materials.audioUrl,
      status: materials.status,
      createdAt: materials.createdAt,
      updatedAt: materials.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      }
    })
    .from(materials)
    .leftJoin(users, eq(materials.authorId, users.id))
    .where(eq(materials.id, id));

    if (foundMaterials.length === 0) {
      return c.json({ error: "Material not found" }, 404);
    }

    return c.json(foundMaterials[0], 200);
  } catch (error) {
    console.error("Get Material Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// POST new material (Admin/Teacher only)
materialsRoute.post("/", authMiddleware, requireAdminOrTeacher, async (c) => {
  try {
    const body = await c.req.json();
    const { title, content, audioUrl, status } = body;
    const user = c.get("user");

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const newMaterial = await db.insert(materials).values({
      title,
      content,
      audioUrl: audioUrl || null,
      status: status || "draft",
      authorId: user.id,
    }).returning();

    return c.json(newMaterial[0], 201);
  } catch (error) {
    console.error("Create Material Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// PUT update material (Admin/Teacher only)
materialsRoute.put("/:id", authMiddleware, requireAdminOrTeacher, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { title, content, audioUrl, status } = body;

    const existingMaterial = await db.select().from(materials).where(eq(materials.id, id));
    if (existingMaterial.length === 0) {
      return c.json({ error: "Material not found" }, 404);
    }

    const updatedMaterial = await db.update(materials)
      .set({
        title,
        content,
        audioUrl: audioUrl !== undefined ? audioUrl : undefined,
        status,
        updatedAt: Date.now(),
      })
      .where(eq(materials.id, id))
      .returning();

    return c.json(updatedMaterial[0], 200);
  } catch (error) {
    console.error("Update Material Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// DELETE material (Admin/Teacher only)
materialsRoute.delete("/:id", authMiddleware, requireAdminOrTeacher, async (c) => {
  try {
    const id = c.req.param("id");

    const existingMaterial = await db.select().from(materials).where(eq(materials.id, id));
    if (existingMaterial.length === 0) {
      return c.json({ error: "Material not found" }, 404);
    }

    await db.delete(materials).where(eq(materials.id, id));

    return c.json({ message: "Material deleted successfully" }, 200);
  } catch (error) {
    console.error("Delete Material Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default materialsRoute;
