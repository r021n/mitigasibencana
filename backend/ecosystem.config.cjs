const fs = require("fs");
const path = require("path");

// Helper function to read the .env file and parse variables for PM2
const readEnv = () => {
  const env = {};
  try {
    const envPath = path.resolve(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const firstEqual = trimmed.indexOf("=");
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            let val = trimmed.slice(firstEqual + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            env[key] = val;
          }
        }
      });
    }
  } catch (error) {
    console.error("Failed to read .env file in ecosystem.config.cjs:", error);
  }
  return env;
};

module.exports = {
  apps: [
    {
      name: "mitigasibencana-backend",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "src/index.ts",
      cwd: "/var/www/mitigasibencana/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        ...readEnv(), // Automatically load and inject .env variables at startup
      },
      // Log output
      out_file: "/var/log/pm2/mitigasibencana-out.log",
      error_file: "/var/log/pm2/mitigasibencana-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
