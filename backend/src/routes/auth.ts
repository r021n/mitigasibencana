import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

const auth = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, status } = body;

    if (!name || !email || !password) {
      return c.json({ error: "Name, email, and password are required" }, 400);
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ error: "Email already registered" }, 400);
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password);

    // Insert user
    const newUserParams: any = {
      name,
      email,
      password: hashedPassword,
    };
    if (status) {
      newUserParams.status = status;
    }

    const insertedUser = await db.insert(users).values(newUserParams).returning();
    const user = insertedUser[0];

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, JWT_SECRET);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ user: userWithoutPassword, token }, 201);
  } catch (error) {
    console.error("Register Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find user
    const foundUsers = await db.select().from(users).where(eq(users.email, email));
    if (foundUsers.length === 0) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const user = foundUsers[0];

    // Verify password
    const isValid = await Bun.password.verify(password, user.password);
    if (!isValid) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      status: user.status,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    };
    const token = await sign(payload, JWT_SECRET);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return c.json({ user: userWithoutPassword, token }, 200);
  } catch (error) {
    console.error("Login Error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;
