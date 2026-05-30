import { Hono } from "hono";
import { join } from "path";
import { verify } from "hono/jwt";
import * as fs from "fs";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const upload = new Hono<{ Variables: { user: any } }>();
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

  const user = foundUsers[0];
  if (user.status !== "admin" && user.status !== "teacher") {
    return c.json({ error: "Forbidden: Only admins and teachers can upload files" }, 403);
  }

  c.set("user", user);
  await next();
};

upload.use("*", authMiddleware);

upload.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    // Pastikan direktori uploads ada
    const uploadDir = join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Buat nama file unik
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Simpan file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    // Kembalikan URL publik
    // Karena kita akan serve folder uploads di route /uploads pada index.ts
    const fileUrl = `/uploads/${uniqueFilename}`;

    return c.json({ url: fileUrl }, 200);
  } catch (error) {
    console.error("Upload Error:", error);
    return c.json({ error: "Internal server error during file upload" }, 500);
  }
});

export default upload;
