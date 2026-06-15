import { defineConfig } from 'drizzle-kit';
import { dbCredentials } from './src/config.js';

export default defineConfig({
  schema: './src/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials,
});
