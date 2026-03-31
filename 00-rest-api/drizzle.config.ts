import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/resources/**/*.schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    // Use the volume Railway en prod, local file for dev
    url: 'sqlite.db',
  },
});