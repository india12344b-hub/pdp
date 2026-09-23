import Fastify from 'fastify';

const app = Fastify({ logger: true });

app.get('/health', async () => ({
  ok: true,
  service: 'pdp-api',
  mode: 'api-free-first'
}));

app.get('/api/v1', async () => ({
  name: 'PDP API',
  status: 'scaffold',
  modules: ['candidates', 'media-moderation', 'companies', 'openings', 'matching']
}));

app.listen({ port: Number(process.env.PORT || 4000), host: '0.0.0.0' })
  .catch(err => { app.log.error(err); process.exit(1); });
