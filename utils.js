const mbtiles = require('mbtiles');
const tilelive = require('tilelive');

mbtiles.registerProtocols(tilelive);

const info = uri =>
  new Promise((resolve, reject) =>
    tilelive.info(uri, (error, metadata) => {
      if (error) reject(error);
      resolve(metadata);
    })
  );

const load = uri =>
  new Promise((resolve, reject) =>
    tilelive.load(uri, (error, source) => {
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

module.exports = { info, load, getTile };
