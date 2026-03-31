import { Hono } from 'hono'
import {cors} from 'hono/cors'

import fishspotsRoutes from './resources/fishspots/fishspots.routes';

const app = new Hono()

app.use('https://fullstack-fish-api.onrender.com', cors())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/fishspots', fishspotsRoutes);

export default app
