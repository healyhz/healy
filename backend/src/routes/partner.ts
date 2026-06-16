import { Hono } from 'hono';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { partner } from '../schemas/partner-schema.js';

const partnerRouter = new Hono();

partnerRouter.get('/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const [row] = await db
    .select()
    .from(partner)
    .where(and(eq(partner.id, session.user.id), isNull(partner.deleted_at)));
  return c.json(row ?? null);
});

partnerRouter.post('/claim', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const userId = session.user.id;
  const referral_code = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();

  const [existing] = await db.select({ id: partner.id, deleted_at: partner.deleted_at }).from(partner).where(eq(partner.id, userId));

  if (existing) {
    if (!existing.deleted_at) return c.json({ error: 'Already a partner' }, 409);
    const [row] = await db
      .update(partner)
      .set({ referral_code, deleted_at: null, updated_at: new Date() })
      .where(eq(partner.id, userId))
      .returning();
    return c.json(row, 200);
  }

  const [row] = await db.insert(partner).values({ id: userId, referral_code }).returning();
  return c.json(row, 201);
});

partnerRouter.delete('/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) return c.json({ error: 'Unauthorized' }, 401);

  const [row] = await db
    .update(partner)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(and(eq(partner.id, session.user.id), isNull(partner.deleted_at)))
    .returning();
  if (!row) return c.json({ error: 'Not a partner' }, 404);
  return c.json({ ok: true });
});

export default partnerRouter;
