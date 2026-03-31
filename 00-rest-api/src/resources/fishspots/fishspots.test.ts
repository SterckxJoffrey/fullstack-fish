import { expect, test, describe, beforeAll } from 'bun:test';
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

import { db } from '../../core/db';
import app from '../../index';
import * as schema from './fishspots.schema';

const sqlite = new Database(':memory:'); // creates a temporary in-memory database
export const dbTest = drizzle(sqlite, { schema });

describe('Fishspots CRUD', () => {
  beforeAll(async () => {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Test database (memory) ready");
  });
  
  test('POST /fishspots - should create a spot if the data is valid', async () => {
    const res = await app.request('/fishspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Lac du Brochet', type: 'Lac', fishs: 'Brochet, Perche', image: 'http://example.com/image.jpg' }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('Lac du Brochet');
  });

  test('POST /fishspots - should fail (400) if the name is missing', async () => {
    const res = await app.request('/fishspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Mer' }),
    });

    expect(res.status).toBe(400);
  });
});