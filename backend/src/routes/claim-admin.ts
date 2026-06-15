import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { user } from '../schemas/auth-schema.js';

const claimAdmin = new Hono();

claimAdmin.post('/', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.role, 'admin'))
    .limit(1);

  if (existing) return c.json({ error: 'An admin already exists' }, 403);

  await db.update(user).set({ role: 'admin' }).where(eq(user.id, session.user.id));
  return c.json({ ok: true });
});

export default claimAdmin;
