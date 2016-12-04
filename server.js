const compress = require('koa-compress');
const conditional = require('koa-conditional-get');
const cors = require('kcors');
const etag = require('koa-etag');
const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
const { info, load, getTile } = require('./utils.js');

const tilePath = '/{z}/{x}/{y}.{format}';
const tilePattern = tilePath
  .replace('{z}', ':z(\\d+)')
  .replace('{x}', ':x(\\d+)')
  .replace('{y}', ':y(\\d+)')
  .replace('{format}', ':format([\\w\\.]+)');

module.exports = (config) => {
  const app = new Koa();
  const router = Router();
  let source;
  let metadata;

  if (config.cors) app.use(cors());
  app.use(compress());
  app.use(conditional());
  app.use(etag());
  app.use(logger());

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      process.stderr.write(error.stack);
      ctx.body = { message: error.message };
      ctx.status = error.status || 500;
    }
  });

  app.use(async (ctx, next) => {
    ctx.state.source = source || (source = await load(config.uri));
    ctx.state.metadata = metadata || (metadata = await info(config.uri));
    return next();
  });

  router.get('/index.json', async (ctx) => {
    const { format } = ctx.state.metadata;
    const baseUrl = `${ctx.protocol}://${ctx.host}`;
    const url = baseUrl + tilePath.replace('{format}', format).replace(/\/+/g, '/');

    ctx.body = Object.assign({}, ctx.state.metadata, {
      tiles: [url],
      tilejson: '2.0.0'
    });
  });

  router.get(tilePattern, async (ctx) => {
    const { z, x, y } = ctx.params;

    try {
      const { tile, headers } = await getTile(ctx.state.source, z, x, y);
      ctx.set(headers);
      ctx.body = tile;
    } catch (error) {
      ctx.status = 204;
      ctx.body = undefined;
    }
  });

  app.use(router.routes()).use(router.allowedMethods());
  return app;
};
