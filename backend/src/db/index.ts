import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import path from "path";

// Use DB_PATH env variable for production (absolute path),
// otherwise fall back to sqlite.db relative to the backend directory
const dbPath = process.env.DB_PATH || path.join(import.meta.dir, "../../sqlite.db");
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
