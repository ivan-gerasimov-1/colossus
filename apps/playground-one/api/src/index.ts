import { Hono } from 'hono';

const app = new Hono();

app.get('/', (context) => {
  return context.json({
    ok: true,
    service: 'colossus-api',
  });
});

export default app;
