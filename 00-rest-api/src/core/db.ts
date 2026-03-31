import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

import * as fishspots from '../resources/fishspots/fishspots.schema';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
const DB_PATH = isTest ? ':memory:' : (isProduction ? '/data/sqlite.db' : 'sqlite.db');
const sqlite = new Database(DB_PATH);

export const db = drizzle({
  client: sqlite,
  schema: {
    fishspots,
  },
});