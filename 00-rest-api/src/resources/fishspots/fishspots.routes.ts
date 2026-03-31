import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { insertFishspotSchema, updateFishspotSchema } from './fishspots.schema';
import * as controllers from './fishspots.handlers';

const router = new Hono();

router
  .get('/', controllers.find)
  .get('/:id', (c) => controllers.findOneById(c, c.req.param('id')))
  .post('/', zValidator('json', insertFishspotSchema), controllers.create)
  .patch('/:id', zValidator('json', updateFishspotSchema), (c) => controllers.updateOneById(c, c.req.param('id')))
  .delete('/:id', (c) => controllers.deleteOneById(c, c.req.param('id')));

export default router;