import { defineConfig } from 'drizzle-kit';
import { dbCredentials } from '../src/config.js';

export default defineConfig({
  schema: './src/schemas',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials,
});
