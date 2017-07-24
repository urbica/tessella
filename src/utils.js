const cache = require('tilelive-cache');
const loader = require('tilelive-modules/loader');
const tilelive = require('@mapbox/tilelive');

module.exports = (config) => {
  const tileliveCache = cache(tilelive, {
    size: process.env.CACHE_SIZE || config.cacheSize,
    sources: process.env.SOURCE_CACHE_SIZE || config.sourceCacheSize
  });

  loader(tileliveCache);

  const info = uri =>
    new Promise((resolve, reject) =>
      tileliveCache.info(uri, (error, metadata) => {
        if (error) reject(error);
        resolve(metadata);
      })
    );

  const load = uri =>
    new Promise((resolve, reject) =>
      tileliveCache.load(uri, (error, source) => {
        if (error) reject(error);
        resolve(source);
      })
    );

  const getTile = (source, z, x, y) =>
    new Promise((resolve, reject) =>
      source.getTile(z, x, y, (error, tile, headers) => {
        if (error) reject(error);
        resolve({ headers, tile });
      })
    );

  return { info, load, getTile };
};
