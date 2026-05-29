import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const app = new Hono();

app.use('*', cors({ origin: process.env.CORS_ORIGIN }));

app.get('/', (c) => {
  return c.json({
    ok: true,
    message: 'Hello Hono!',
  });
});

app.post('/api/create-table', async (c) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name VARCHAR(255))`);
    return c.json({ ok: true, message: 'Table created' });
  } catch (error) {
    return c.json({ ok: false, error: error.message });
  }
});

app.post('/api/insert', async (c) => {
  try {
    const { name } = await c.req.json();
    await pool.query('INSERT INTO test (name) VALUES ($1)', [name]);
    return c.json({ ok: true, message: 'Data inserted' });
  } catch (error) {
    return c.json({ ok: false, error: error.message });
  }
});

app.get('/api/data', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM test');
    return c.json({ ok: false, data: result.rows });
  } catch (error) {
    return c.json({ ok: false, error: error.message });
  }
});

serve(app);
