import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/resources/**/*.schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    // Use the volume Railway en prod, local file for dev
    url: process.env.NODE_ENV === 'production' ? '/data/sqlite.db' : 'sqlite.db',
  },
});