import { Hono } from 'hono';
import { auth } from '../auth.js';

const usersRouter = new Hono();

usersRouter.get('/me', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const { user } = session;
  return c.json({
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified: user.emailVerified,
    role: user.role,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  });
});

export default usersRouter;
