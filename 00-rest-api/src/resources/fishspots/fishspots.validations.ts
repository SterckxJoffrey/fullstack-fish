import { z } from 'zod';

import { insertFishspotSchema, updateFishspotSchema } from './fishspots.schema';

export type InsertValidation = {
  out: { json: z.infer<typeof insertFishspotSchema> }
};

export type UpdateValidation = {
  out: { json: z.infer<typeof updateFishspotSchema> }
};