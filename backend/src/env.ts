import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Manual .env loader for Node.js (Bun loads .env automatically)
if (typeof Bun === "undefined") {
  try {
    const currentDir = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));
    // Resolve the .env path in the backend directory (one level up from src/)
    let envPath = path.resolve(currentDir, "../.env");
    if (!fs.existsSync(envPath)) {
      envPath = path.resolve(currentDir, "../.env.example");
    }

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        // Skip comments and empty lines
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            let val = trimmed.slice(firstEqual + 1).trim();
            
            // Remove surrounding quotes if present
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            
            // Populate process.env if not already set by host system
            if (process.env[key] === undefined) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Error loading .env file manually in Node.js:", error);
  }
}
