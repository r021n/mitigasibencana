import "./env";
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import videos from './routes/videos'
import comments from './routes/comments'
import analysis from './routes/analysis'
import { WebSocketServer } from 'ws'
import { initWebSocket } from './services/websocket'
import { analysisQueue } from './services/analysisQueue'

const app = new Hono()

// CORS: di production, izinkan domain frontend saja
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim().replace(/\/$/, '')) // Hapus trailing slash jika ada
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ]

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return undefined
    
    // Hapus trailing slash dari origin request untuk pencocokan yang akurat
    const cleanOrigin = origin.replace(/\/$/, '')
    
    if (allowedOrigins.includes(cleanOrigin)) return origin
    return allowedOrigins[0]
  },
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

app.get('/', (c) => {
  return c.text('Mitigasi Bencana API is running!')
})

app.route('/auth', auth)
app.route('/videos', videos)
app.route('/comments', comments)
app.route('/analysis', analysis)

const port = parseInt(process.env.PORT || '3000')

// Jalankan server Hono jika berada di lingkungan Node.js
if (typeof Bun === "undefined") {
  import('@hono/node-server').then(({ serve }) => {
    const server = serve({
      fetch: app.fetch,
      port,
    })
    
    // Inisialisasi dan ikat WebSocket server
    const wss = new WebSocketServer({ server: server as any })
    initWebSocket(wss)
    
    // Mulai loop antrean pemrosesan di latar belakang
    analysisQueue.start()
    
    console.log(`[Node.js] Server is running on port ${port} with WebSockets`)
  }).catch((err) => {
    console.error("Failed to start Node.js server:", err)
  })
} else {
  console.log(`[Bun] Server is running on port ${port}`)
  // Jalankan antrean pemrosesan jika menggunakan Bun
  analysisQueue.start()
}

// Ekspor default untuk Bun native serve format
export default {
  port,
  fetch: app.fetch,
}

