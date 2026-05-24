module.exports = {
  apps: [
    {
      name: "mitigasibencana-backend",
      script: "src/index.ts",
      interpreter: "/root/.bun/bin/bun",
      cwd: "/var/www/mitigasibencana/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        // DB_PATH dan JWT_SECRET diset di file .env di server
        // Jangan hardcode secret di sini!
      },
      // Log output
      out_file: "/var/log/pm2/mitigasibencana-out.log",
      error_file: "/var/log/pm2/mitigasibencana-error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
