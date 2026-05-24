import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'
import videos from './routes/videos'
import comments from './routes/comments'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', auth)
app.route('/videos', videos)
app.route('/comments', comments)

export default app
