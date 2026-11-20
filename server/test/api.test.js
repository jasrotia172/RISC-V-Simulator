const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server');
let server, base;
before(async () => {
  server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });
async function request(path, data, method = 'POST') {
  const response = await fetch(`${base}/api/${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
  return { status: response.status, body: await response.json() };
}

test('health, reset, and no-program errors', async () => {
  assert.equal((await request('health', undefined, 'GET')).status, 200);
  const reset = await request('reset');
  assert.equal(reset.body.memory.length, 256);
  assert.deepEqual(reset.body.registers, Array(32).fill(0));
  assert.equal((await request('step', {})).status, 400);
  assert.equal((await request('missing', undefined, 'GET')).status, 404);
});

test('invalid request bodies are rejected without changing machine state', async () => {
  await request('execute', { code: 'ADDI x1,x0,7' });
  for (const data of [undefined, {}, { code: '' }, { code: 12 }, { code: [] }, { code: '# comment' }, { code: 'ADDI x1,x0,2\nBOGUS' }]) {
    assert.equal((await request('execute', data)).status, 400);
  }
  assert.equal((await request('state', undefined, 'GET')).body.registers[1], 7);
  assert.equal((await request('step', { code: '' })).status, 400);
  const malformed = await fetch(`${base}/api/execute`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' });
  assert.equal(malformed.status, 400);
  assert.match((await malformed.json()).error, /Invalid JSON/);
});

test('execute starts fresh and retains the current program for subsequent steps', async () => {
  await request('execute', { code: 'ADDI x1,x0,55\nSB x1,0' });
  const executed = await request('execute', { code: 'ADDI x2,x0,9' });
  assert.equal(executed.body.registers[1], 0);
  assert.equal(executed.body.memory[0].value, 0);
  assert.equal(executed.body.completed, true);
  const stepped = await request('step', {});
  assert.deepEqual(stepped.body, executed.body);
});

test('step uses 256 bytes, can resume, and reports completion without HLT', async () => {
  const first = await request('step', { code: 'ADDI x1,x0,42\nSW x1,252' });
  assert.equal(first.body.pc, 1);
  assert.equal(first.body.memory.length, 256);
  assert.equal(first.body.completed, false);
  const second = await request('step', {});
  assert.equal(second.body.pc, 2);
  assert.equal(second.body.memory[252].value, 42);
  assert.equal(second.body.completed, true);
  assert.deepEqual((await request('step', {})).body, second.body);
});

test('runtime errors and loop limits return the latest state', async () => {
  const badStore = await request('execute', { code: 'ADDI x1,x0,42\nSW x1,254' });
  assert.equal(badStore.status, 400);
  assert.equal(badStore.body.programLoaded, true);
  assert.equal(badStore.body.state.registers[1], 42);
  assert.equal(badStore.body.state.memory[254].value, 0);
  const loop = await request('execute', { code: 'loop: JAL x0,loop' });
  assert.equal(loop.status, 400);
  assert.match(loop.body.error, /Execution limit/);
  assert.equal(loop.body.state.pc, 0);
  assert.equal(loop.body.state.executionCount, 10000);
});
