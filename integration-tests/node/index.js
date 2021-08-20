'use strict';

const assert = require('assert');
const express = require('express');
// @ts-ignore
const { bodyParser } = require('ebp');
const request = require('supertest');
const { ServerResponse, IncomingMessage } = require('http');

const EXIT_FAILURE = 1;

async function test() {
  const app = express();

  /** @type {{ body?: unknown }} */
  const _req = {};

  function readerMiddleware(
    /** @type {IncomingMessage & { body?: unknown }} */ req,
    /** @type {ServerResponse} */ res,
  ) {
    _req.body = req.body;

    res.end();
  }

  app.use(bodyParser(), readerMiddleware);

  await request(app).post('/').send({ foo: 'bar' });

  assert.deepStrictEqual(_req.body, { foo: 'bar' });
}

test().catch((error) => {
  console.error(error);

  process.exit(EXIT_FAILURE);
});
