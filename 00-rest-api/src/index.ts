import { Hono } from 'hono'

import fishspotsRoutes from './resources/fishspots/fishspots.routes';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/fishspots', fishspotsRoutes);

export default app
