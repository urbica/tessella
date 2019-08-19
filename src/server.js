const url = require('url');
const path = require('path');
const compress = require('koa-compress');
const conditional = require('koa-conditional-get');
const cors = require('kcors');
const etag = require('koa-etag');
const Koa = require('koa');
const logger = require('koa-logger');
const Router = require('koa-router');
const utils = require('./utils.js');

const scales = [1, 2];
const tilePath = '/{z}/{x}/{y}.{format}';
const tilePattern = tilePath
  .replace(/\.(?!.*\.)/, `:scale(@[${scales.join('')}]x)?.`)
  .replace(/\./g, '.')
  .replace('{z}', ':z(\\d+)')
  .replace('{x}', ':x(\\d+)')
  .replace('{y}', ':y(\\d+)')
  .replace('{format}', ':format([\\w\\.]+)');

module.exports = (config) => {
  const app = new Koa();
  const router = Router();
  const { info, load, getTile } = utils(config);

  const urisByScale = scales.reduce((acc, scale) => {
    const uri = url.parse(config.uri, true);
    uri.query.scale = scale;
    uri.query.tileSize = scale * 256;

    // warm the cache
    load(uri);

    acc[scale] = uri;
    return acc;
  }, {});

  let metadata;
  const sourcesByScale = {};

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

  router.get('/index.json', async (ctx) => {
    if (!metadata) {
      metadata = await info(config.uri);
    }

    const { format } = metadata;
    const protocol = ctx.headers['x-forwarded-proto'] || ctx.protocol;
    const host = ctx.headers['x-forwarded-host'] || ctx.headers.host;
    const originalUrl = ctx.headers['x-rewrite-url'] || ctx.originalUrl;

    const pathname = path.join(
      path.dirname(originalUrl),
      tilePath.replace('{format}', format).replace(/\/+/g, '/')
    );

    const tilesUrl = url.format({ protocol, host, pathname });
    ctx.body = { ...metadata, tiles: [tilesUrl], tilejson: '2.2.0' };
  });

  router.get(tilePattern, async (ctx) => {
    const z = parseInt(ctx.params.z, 10);
    const x = parseInt(ctx.params.x, 10);
    const y = parseInt(ctx.params.y, 10);
    const scale = (ctx.params.scale || '@1x').slice(1, 2) | 0;

    let source = sourcesByScale[scale];
    if (!source) {
      source = await load(urisByScale[scale]);
      sourcesByScale[scale] = source;
    }

    try {
      const { tile, headers } = await getTile(source, z, x, y);

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
