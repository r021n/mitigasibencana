# Panduan Deploy Fullstack Project ke VPS dengan Node.js

Dokumen ini menjelaskan langkah-langkah lengkap untuk melakukan deployment project **Mitigasi Bencana** (Backend & Frontend) ke VPS berbasis Linux (direkomendasikan **Ubuntu 22.04 LTS** atau **24.04 LTS**) menggunakan **Node.js**, **PM2**, **Nginx**, dan **Certbot** untuk SSL HTTPS.

---

## Daftar Isi
1. [Prasyarat & Persiapan Awal](#1-prasyarat--persiapan-awal)
2. [Instalasi Node.js, PM2, dan Nginx di VPS](#2-instalasi-nodejs-pm2-dan-nginx-di-vps)
3. [Upload Kode ke VPS](#3-upload-kode-ke-vps)
4. [Konfigurasi & Menjalankan Backend](#4-konfigurasi--menjalankan-backend)
5. [Build & Konfigurasi Frontend](#5-build--konfigurasi-frontend)
6. [Konfigurasi Nginx sebagai Web Server & Reverse Proxy](#6-konfigurasi-nginx-sebagai-web-server--reverse-proxy)
7. [Memasang SSL HTTPS dengan Certbot](#7-memasang-ssl-https-dengan-certbot)
8. [Tips Perawatan & Troubleshooting](#8-tips-perawatan--troubleshooting)

---

## 1. Prasyarat & Persiapan Awal

Sebelum memulai, pastikan Anda telah menyiapkan:
* **VPS Linux** (Ubuntu 22.04 LTS / 24.04 LTS disarankan).
* **Domain Name** yang sudah diarahkan (DNS A Record) ke IP Publik VPS Anda. Misalnya:
  * Domain utama: `mitigasibencana.net` (untuk Frontend)
  * Subdomain API: `api.mitigasibencana.net` (untuk Backend)
* Akses SSH ke VPS dengan user `root` atau user dengan hak akses `sudo`.

---

## 2. Instalasi Node.js, PM2, dan Nginx di VPS

Hubungkan diri Anda ke VPS via SSH, lalu jalankan perintah berikut untuk mengupdate system dan menginstall tools yang diperlukan.

### A. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### B. Install Node.js (Menggunakan NodeSource LTS - Node 20)
```bash
# Download & setup NodeSource installer
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js dan build-essential (diperlukan untuk native modules sqlite/better-sqlite3)
sudo apt-get install -y nodejs build-essential
```
*Verifikasi instalasi:*
```bash
node -v  # Output minimal v20.x.x
npm -v   # Output v10.x.x atau di atasnya
```

### C. Install PM2 (Process Manager) secara Global
PM2 bertugas menjaga agar aplikasi backend Node.js Anda tetap berjalan di background dan otomatis restart jika server reboot atau app mengalami error/crash.
```bash
sudo npm install -g pm2
```

### D. Install Nginx
```bash
sudo apt install nginx -y
```

---

## 3. Upload Kode ke VPS

Anda bisa meng-upload kode project menggunakan **Git** (direkomendasikan) atau **SCP/SFTP**.

### Cara 1: Menggunakan Git (Sangat Direkomendasikan)
1. Push project lokal Anda ke repositori private (GitHub / GitLab).
2. Generate SSH Key di VPS dan tambahkan ke akun Git Anda.
3. Clone repositori ke folder `/var/www/mitigasibencana` di VPS:
   ```bash
   sudo mkdir -p /var/www/mitigasibencana
   sudo chown -R $USER:$USER /var/www/mitigasibencana
   git clone <URL_REPOSITORI_ANDA> /var/www/mitigasibencana
   ```

### Cara 2: Menggunakan SCP/SFTP
Upload seluruh isi folder project Anda (kecuali `node_modules`, `.git`, `dist`, dan `.env` lokal) ke `/var/www/mitigasibencana` menggunakan tools seperti FileZilla, WinSCP, atau perintah terminal `scp`.

---

## 4. Konfigurasi & Menjalankan Backend

Masuk ke direktori backend di VPS untuk menginstall dependencies dan menjalankan server.

```bash
cd /var/www/mitigasibencana/backend
```

### A. Install Dependencies
```bash
npm install
```
> [!NOTE]
> Karena di server kita menggunakan **Node.js** dan aplikasi dijalankan menggunakan `tsx` (TypeScript Executor), perintah `npm install` akan mengunduh dependencies seperti `better-sqlite3` dan melakukan kompilasi native binding secara otomatis.

### B. Konfigurasi Environment Variables (`.env`)
Buat file `.env` baru di direktori `/var/www/mitigasibencana/backend`:
```bash
nano .env
```
Isi dengan konfigurasi produksi Anda:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=gunakan_string_acak_yang_sangat_rahasia_dan_panjang_disini
ALLOWED_ORIGINS=https://mitigasibencana.net,https://www.mitigasibencana.net
DB_PATH=/var/www/mitigasibencana/backend/sqlite.db
```
*Tekan `Ctrl+O` lalu `Enter` untuk menyimpan, dan `Ctrl+X` untuk keluar dari nano.*

### C. Inisialisasi Database Drizzle (Push Schema)
Jalankan perintah ini untuk membuat/mensinkronkan skema database SQLite Anda berdasarkan skema Drizzle ORM:
```bash
npx drizzle-kit push
```

### D. Menjalankan Backend dengan PM2
Kita akan menggunakan file `ecosystem.config.cjs` yang sudah Anda miliki untuk menjalankan backend.
> [!IMPORTANT]
> **Penting Mengenai File Log PM2:**
> File `ecosystem.config.cjs` Anda saat ini mengarah ke `/var/log/pm2/...` untuk output & error log. Agar tidak terkena masalah hak akses write (Permission Denied) ketika dijalankan oleh non-root user, sangat disarankan untuk membuat folder `/var/log/pm2` terlebih dahulu dan memberikan hak akses ke user Anda, **atau** menghapus baris `out_file` & `error_file` pada `ecosystem.config.cjs` agar PM2 otomatis menyimpannya di folder default PM2 (`~/.pm2/logs/`).
>
> Jika ingin membuat folder logs sistem:
> ```bash
> sudo mkdir -p /var/log/pm2
> sudo chown -R $USER:$USER /var/log/pm2
> ```

Sekarang, jalankan aplikasi backend dengan PM2:
```bash
pm2 start ecosystem.config.cjs
```

Untuk memastikan aplikasi berjalan dengan baik:
```bash
pm2 status
pm2 logs mitigasibencana-backend
```

### E. Mengatur PM2 Startup
Agar PM2 otomatis berjalan saat VPS reboot:
```bash
pm2 startup
```
*Perintah di atas akan menghasilkan sebuah perintah lain yang harus Anda copy-paste dan jalankan di terminal (berisi perintah `sudo systemctl enable pm2-...`).*

Setelah menjalankan perintah startup tersebut, simpan status aplikasi PM2 saat ini:
```bash
pm2 save
```

---

## 5. Build & Konfigurasi Frontend

Karena RAM VPS standard biasanya terbatas (misal 1GB/2GB), melakukan build frontend (Vite + TypeScript) langsung di VPS seringkali membuat VPS lag atau *Out of Memory (OOM)*.

Oleh karena itu, ada **2 alternatif** pilihan build:

### Alternatif A: Build di Lokal (Sangat Direkomendasikan)
1. Di komputer lokal Anda (pada folder `/frontend`), jalankan perintah build:
   ```bash
   # Pastikan file frontend/.env.production sudah diset dengan:
   # VITE_API_URL=https://api.mitigasibencana.net
   npm run build
   ```
2. Ini akan menghasilkan folder `/frontend/dist`.
3. Upload folder `dist` tersebut ke VPS ke direktori `/var/www/mitigasibencana/frontend/dist` menggunakan SFTP/SCP.

### Alternatif B: Build Langsung di VPS (Hanya jika VPS memiliki RAM cukup / ada Swap)
1. Di VPS, buat file `.env.production` di `/var/www/mitigasibencana/frontend`:
   ```bash
   nano /var/www/mitigasibencana/frontend/.env.production
   ```
   Isi dengan:
   ```env
   VITE_API_URL=https://api.mitigasibencana.net
   ```
2. Jalankan instalasi dan build di VPS:
   ```bash
   cd /var/www/mitigasibencana/frontend
   npm install
   npm run build
   ```

---

## 6. Konfigurasi Nginx sebagai Web Server & Reverse Proxy

Kita akan mengonfigurasi Nginx untuk:
1. Melayani file statis Frontend (`mitigasibencana.net` mengambil file statis di `/var/www/mitigasibencana/frontend/dist`).
2. Menjadi Reverse Proxy untuk Backend (`api.mitigasibencana.net` diteruskan ke `http://127.0.0.1:3000`).

### A. Buat Konfigurasi Site Baru di Nginx
```bash
sudo nano /etc/nginx/sites-available/mitigasibencana
```

Masukkan konfigurasi berikut (silakan ubah `mitigasibencana.net` dan `api.mitigasibencana.net` dengan domain Anda yang sesungguhnya):

```nginx
# 1. Konfigurasi Frontend (Domain Utama & WWW)
server {
    listen 80;
    server_name mitigasibencana.net www.mitigasibencana.net;

    root /var/www/mitigasibencana/frontend/dist;
    index index.html;

    # Penanganan client-side routing pada React (react-router-dom)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Control untuk static assets demi performa optimal
    location ~* \.(?:ico|css|js|gif|jpe?g|png|svg|woff2?|eot|ttf|otf|mp4|webm)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public, no-transform";
    }

    # Pengaturan maksimal ukuran upload file (penting jika ada upload video mitigasi)
    client_max_body_size 100M;
}

# 2. Konfigurasi Backend API (Subdomain)
server {
    listen 80;
    server_name api.mitigasibencana.net;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Meneruskan real IP client ke backend Hono
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Pengaturan maksimal ukuran upload file untuk API backend
    client_max_body_size 100M;
}
```

### B. Aktifkan Konfigurasi & Restart Nginx
1. Buat symlink dari `sites-available` ke `sites-enabled`:
   ```bash
   sudo ln -s /etc/nginx/sites-available/mitigasibencana /etc/nginx/sites-enabled/
   ```
2. Uji apakah konfigurasi Nginx sudah benar dan tidak ada syntax error:
   ```bash
   sudo nginx -t
   ```
   *Jika outputnya sukses (`syntax is ok` & `test is successful`), lanjutkan ke langkah berikutnya.*
3. Restart layanan Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

---

## 7. Memasang SSL HTTPS dengan Certbot

Sekarang saatnya mengamankan koneksi domain Anda dengan sertifikat SSL gratis dari Let's Encrypt menggunakan Certbot.

### A. Install Certbot dan Plugin Nginx
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### B. Request dan Install Sertifikat SSL
Jalankan perintah berikut untuk mengotomatisasi instalasi SSL pada domain dan subdomain Anda:
```bash
sudo certbot --nginx -d mitigasibencana.net -d www.mitigasibencana.net -d api.mitigasibencana.net
```
* Certbot akan menanyakan alamat email untuk notifikasi perpanjangan.
* Certbot juga akan menanyakan apakah Anda setuju dengan Terms of Service.
* Terakhir, Certbot akan secara otomatis memperbarui file konfigurasi Nginx Anda untuk redirect HTTP ke HTTPS secara aman.

### C. Verifikasi Auto-Renewal SSL
Sertifikat Let's Encrypt berlaku selama 90 hari. Certbot secara otomatis memasang cron job di sistem untuk memperbarui sertifikat sebelum kedaluwarsa. Anda dapat menguji proses perpanjangan otomatis ini dengan perintah:
```bash
sudo certbot renew --dry-run
```
*Jika tidak ada pesan error, fitur auto-renewal sudah aktif dan berjalan sempurna.*

---

## 8. Tips Perawatan & Troubleshooting

* **Melihat Log Backend secara Realtime:**
  ```bash
  pm2 logs mitigasibencana-backend
  ```
* **Melihat Log Error Nginx jika Web tidak bisa diakses:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
* **Restart Backend setelah melakukan update kode:**
  ```bash
  cd /var/www/mitigasibencana/backend
  git pull
  npm install
  npx drizzle-kit push
  pm2 restart mitigasibencana-backend
  ```
* **Jika database SQLite Anda terkunci (*Database is locked*):**
  Pastikan database tidak sedang diakses secara eksklusif oleh proses eksternal. PM2 dengan clustering terkadang memicu lock jika menggunakan database file mentah seperti SQLite, oleh karena itu kami menggunakan `instances: 1` di dalam `ecosystem.config.cjs`. Tetap gunakan 1 instance untuk runtime SQLite demi menghindari race conditions.
