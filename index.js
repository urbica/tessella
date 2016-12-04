#!/usr/bin/env node

const fs = require('fs');
const minimist = require('minimist');
const server = require('./server');

const config = minimist(process.argv.slice(2), {
  string: [
    'port',
    'socket'
  ],
  boolean: ['cors'],
  alias: {
    h: 'help',
    v: 'version'
  },
  default: {
    cors: true,
    port: 4000
  }
});

try {
  config.tiles = config._[0];
  config.uri = `mbtiles://${config.tiles}`;
  fs.accessSync(config.tiles, fs.F_OK);
} catch (error) {
  process.stderr.write(error.stack);
  process.exit(-1);
}

const app = server(config);
const http = app.listen(config.port, () => {
  const endpoint = `${http.address().address}:${http.address().port}`;
  process.stdout.write(`🚀  ON AIR @ ${endpoint}\n`);
});

const shutdown = () => {
  process.stdout.write('Caught SIGINT, terminating');
  http.close();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
