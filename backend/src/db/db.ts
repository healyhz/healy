import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema/index.js';
import { dbCredentials } from '../config.js';

export const pool = new Pool(dbCredentials);

export const db = drizzle(pool, { schema });
