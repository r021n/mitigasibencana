import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import videos from './routes/videos'
import comments from './routes/comments'

const app = new Hono()

// CORS: di production, izinkan domain frontend saja
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173']

app.use('*', cors({
  origin: (origin) => {
    // Jika tidak ada origin (server-to-server) atau origin diizinkan
    if (!origin || allowedOrigins.includes(origin)) return origin
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

const port = parseInt(process.env.PORT || '3000')

export default {
  port,
  fetch: app.fetch,
}
