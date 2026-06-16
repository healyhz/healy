import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { and, eq, isNull } from 'drizzle-orm';
import { auth } from '../auth.js';
import { db } from '../db.js';
import { user } from '../schemas/auth-schema.js';
import { partner } from '../schemas/partner-schema.js';

const adminOnly = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user || session.user.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }
  await next();
});

const adminRouter = new Hono();
adminRouter.use('*', adminOnly);

adminRouter.get('/users', async (c) => {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      partner_referral_code: partner.referral_code,
      partner_created_at: partner.created_at,
    })
    .from(user)
    .leftJoin(partner, and(eq(partner.id, user.id), isNull(partner.deleted_at)));

  return c.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      partner: r.partner_referral_code
        ? { referral_code: r.partner_referral_code, created_at: r.partner_created_at }
        : null,
    }))
  );
});

adminRouter.post('/users/:id/partner', async (c) => {
  const userId = c.req.param('id');
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

adminRouter.delete('/users/:id/partner', async (c) => {
  const [row] = await db
    .update(partner)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(and(eq(partner.id, c.req.param('id')), isNull(partner.deleted_at)))
    .returning();
  if (!row) return c.json({ error: 'Not a partner' }, 404);
  return c.json({ ok: true });
});

export default adminRouter;
