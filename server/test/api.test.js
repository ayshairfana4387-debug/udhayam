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

test('user scheme journey history & multi-loan notification tracking', async () => {
  // 1. Fetch user scheme history (should have seeded PMEGP loan in month 21 of 24)
  const historyRes = await request('/api/user-schemes');
  assert.equal(historyRes.response.status, 200);
  assert.equal(historyRes.data.success, true);
  assert.ok(Array.isArray(historyRes.data.schemes));
  assert.ok(historyRes.data.schemes.length >= 1);

  const initialScheme = historyRes.data.schemes[0];
  assert.equal(initialScheme.schemeId, 'pmegp');
  assert.equal(initialScheme.tenureMonths, 24);
  assert.equal(initialScheme.currentMonth, 21);

  // 2. Notifications check: must return active payment reminder for Month 21
  const notifRes = await request('/api/notifications');
  assert.equal(notifRes.response.status, 200);
  assert.equal(notifRes.data.success, true);
  assert.ok(notifRes.data.notifications.length >= 1);
  const foundAlert = notifRes.data.notifications.some(
    (n) => n.message.includes('Month 21') || n.title.includes('Month 21')
  );
  assert.ok(foundAlert, 'Notification for Month 21 EMI should be present');

  // 3. User explores and saves a second scheme (e.g. MUDRA)
  const secondLoan = {
    userId: 'rajesh-kumar',
    applicantName: 'Rajesh Kumar',
    schemeId: 'mudra',
    schemeName: 'Pradhan Mantri MUDRA Yojana',
    bankId: 'canara-msme',
    bankName: 'Canara Bank - MSME Specialized Branch',
    loanAmount: 100000,
    interestRate: 8.0,
    tenureMonths: 12,
    currentMonth: 1,
    status: 'active_repayment'
  };

  const createSecond = await request('/api/user-schemes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(secondLoan)
  });

  assert.equal(createSecond.response.status, 201);
  assert.equal(createSecond.data.success, true);

  // 4. Verify both schemes are in history and sorted YouTube-style (newest first)
  const updatedHistory = await request('/api/user-schemes');
  assert.ok(updatedHistory.data.schemes.length >= 2);
  assert.equal(updatedHistory.data.schemes[0].schemeId, 'mudra');
  assert.ok(updatedHistory.data.schemes.some((s) => s.schemeId === 'pmegp' && s.currentMonth === 21));

  // 5. Notifications still include reminders for the FIRST loan (PMEGP Month 21) even after adding second loan!
  const crossNotifs = await request('/api/notifications');
  const stillHasPmegpAlert = crossNotifs.data.notifications.some(
    (n) => n.schemeName && n.schemeName.includes('PMEGP')
  );
  assert.ok(stillHasPmegpAlert, 'Notification for first loan must persist while exploring second loan');
});

