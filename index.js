#!/usr/bin/env node

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
  process.stdout.write(`${packagejson.version}\n`);
  process.exit(0);
}

const help = () => {
  const usage = [
    'Usage: tessella [options] [uri]',
    '',
    'where [uri] is tilelive URI to serve and [options] is any of:',
    ` --port - port to run on (default: ${config.port})`,
    ' --socket - use Unix socket instead of port',
    ' --version - returns running version then exits',
    '',
    `tessella@${packagejson.version}`,
    `node@${process.versions.node}`
  ].join('\n');

  process.stdout.write(`${usage}\n`);
  process.exit(0);
};

if (config.help) {
  help();
}

if (!config._[0]) {
  process.stdout.write('URI not specified.\n\n');
  help();
}

config.uri = config._[0];
const app = tessella(config);
const handler = config.socket || config.port;

const server = app.listen(handler, () => {
  if (config.socket) {
    fs.chmodSync(config.socket, '1766');
    process.stdout.write(`🚀  ON AIR @ ${config.socket}`);
  } else {
    const endpoint = `${server.address().address}:${server.address().port}`;
    process.stdout.write(`🚀  ON AIR @ ${endpoint}`);
  }
});

const shutdown = () => {
  process.stdout.write('Caught SIGINT, terminating\n');
  server.close();
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
