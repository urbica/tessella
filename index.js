#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const minimist = require('minimist');
const tessella = require('./src/server');
const packagejson = require('./package.json');

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

if (config.version) {
  console.log(packagejson.version);
  process.exit(0);
}

if (config.help) {
  const usage = [
    'Usage: tessella  [options] [filename]',
    '',
    'where [filename] is path to mbtiles data and [options] is any of:',
    ` --port - port to run on (default: ${config.port})`,
    ' --socket - use Unix socket instead of port',
    ' --version - returns running version then exits',
    '',
    `tessella@${packagejson.version}`,
    `node@${process.versions.node}`
  ].join('\n');

  console.log(usage);
  process.exit(0);
}

try {
  config.tiles = config._[0];
  config.uri = `mbtiles://${config.tiles}`;
  fs.accessSync(config.tiles, fs.F_OK);
} catch (error) {
  process.stderr.write(error.stack);
  process.exit(-1);
}

const app = tessella(config);
const handler = config.socket || config.port;

const server = app.listen(handler, () => {
  if (config.socket) {
    fs.chmodSync(config.socket, '1766');
    console.log('🚀  ON AIR @ %s', config.socket);
  } else {
    const endpoint = `${server.address().address}:${server.address().port}`;
    console.log('🚀  ON AIR @ %s', endpoint);
  }
});

const shutdown = () => {
  process.stdout.write('Caught SIGINT, terminating');
  server.close();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
