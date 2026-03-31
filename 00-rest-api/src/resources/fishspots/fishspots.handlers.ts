import { Context, Env } from 'hono';
import { eq } from 'drizzle-orm';

import { db } from '../../core/db';
import { fishspots } from './fishspots.schema';
import { InsertValidation, UpdateValidation } from './fishspots.validations';

export const create = async (c: Context<Env, any, InsertValidation>) => {
  const data = c.req.valid('json'); 

  const [newSpot] = await db.insert(fishspots)
    .values(data)
    .returning();

  return c.json(newSpot, 201);
};

export const find = async (c: Context<Env, any>) => {
  const fishspot = db.select()
    .from(fishspots)
    .all();

  return c.json(fishspot, 200);
};

export const findOneById = async (c: Context<Env, any>, id: string) => {
  const fishspot = db.select()
    .from(fishspots)
    .where(eq(fishspots.id, parseInt(id)))
    .get();

  return c.json(fishspot, 200);
};

export const updateOneById = async (c: Context<Env, any, UpdateValidation>, id: string) => {
  const data = c.req.valid('json');

  const [fishspot] = await db.update(fishspots)
    .set(data)
    .where(eq(fishspots.id, parseInt(id)))
    .returning();

  return c.json(fishspot, 200);
};

export const deleteOneById = async (c: Context<Env, any>, id: string) => {
  await db.delete(fishspots)
    .where(eq(fishspots.id, parseInt(id)))
    .returning();

    return c.status(204);
};