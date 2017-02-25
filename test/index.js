/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const test = require('tape');
const request = require('supertest-koa-agent');
const tessella = require('../src/server');

test('tessella', (t) => {
  t.plan(1);

  const tiles = path.join(__dirname, '/fixtures/plain_1.mbtiles');
  const uri = `mbtiles://${tiles}`;
  const app = tessella({ uri });

  request(app)
    .get('/index.json')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((error) => {
      t.error(error, 'No error');
      t.end();
    });
});
