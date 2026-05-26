import "../env";
import * as schema from "./schema";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

// Use DB_PATH env variable for production (absolute path),
// otherwise fall back to sqlite.db relative to the backend directory
const dbPath = process.env.DB_PATH || path.join(currentDir, "../../sqlite.db");

let localDb: any;

if (typeof Bun !== "undefined") {
  const { Database } = await import("bun:sqlite");
  const { drizzle } = await import("drizzle-orm/bun-sqlite");
  const sqlite = new Database(dbPath);
  localDb = drizzle(sqlite, { schema });
} else {
  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const sqlite = new Database(dbPath);
  localDb = drizzle(sqlite, { schema });
}

export const db = localDb;
