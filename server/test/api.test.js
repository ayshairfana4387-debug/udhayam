import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

let server;
let baseUrl;

test.before(async () => {
  process.env.NODE_ENV = 'test';
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return { response, data: await response.json() };
}

test('health endpoint', async () => {
  const { response, data } = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(data.success, true);
});

test('request creation and retrieval', async () => {
  const payload = {
    userId: 'u1',
    category: 'employment',
    input: 'Need job support',
    result: 'Helping with job request',
    language: 'en',
    status: 'pending'
  };

  const created = await request('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  assert.equal(created.response.status, 201);
  assert.equal(created.data.success, true);
  const id = created.data.request.id;

  const { response: retrieveResponse, data: retrieveData } = await request(`/api/requests/${id}`);
  assert.equal(retrieveResponse.status, 200);
  assert.equal(retrieveData.request.id, id);
});

test('invalid request handling', async () => {
  const { response, data } = await request('/api/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', category: '', input: '' })
  });

  assert.equal(response.status, 400);
  assert.equal(data.success, false);
});
