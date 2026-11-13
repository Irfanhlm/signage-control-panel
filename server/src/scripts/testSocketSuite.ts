/**
 * Phase 4 — Socket.IO Integration Test Suite
 *
 * Tests Socket.IO connection, heartbeat, offline sweep, content assignment events,
 * and multi-socket behavior.
 *
 * Usage: cd server && npm run test:socket
 */
import http from 'http';
import express from 'express';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { initSocketIO, stopSweeper, getIO } from '../socket/index.js';
import {
  getAllConnectedDeviceIds,
  getConnections,
  clearRegistry,
} from '../socket/connectionRegistry.js';
import { getSupabase } from '../lib/supabase.js';
import apiRouter from '../routes/index.js';
import cors from 'cors';
import { errorHandler } from '../middleware/errorHandler.js';

// ─── Test Infrastructure ───

let httpServer: http.Server;
let serverPort: number;
const BASE_URL = () => `http://localhost:${serverPort}`;
const sockets: ClientSocket[] = [];

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
}
const results: TestResult[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createClientSocket(auth: Record<string, string> = {}): ClientSocket {
  const socket = ioClient(BASE_URL(), {
    autoConnect: false,
    transports: ['websocket'],
    auth,
  });
  sockets.push(socket);
  return socket;
}

function waitForEvent<T>(socket: ClientSocket, event: string, timeout = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for event '${event}'`)), timeout);
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function waitForConnect(socket: ClientSocket, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.connected) { resolve(); return; }
    const timer = setTimeout(() => reject(new Error('Connection timeout')), timeout);
    socket.once('connect', () => { clearTimeout(timer); resolve(); });
    socket.once('connect_error', (err) => { clearTimeout(timer); reject(err); });
  });
}

function waitForDisconnect(socket: ClientSocket, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.disconnected) { resolve(); return; }
    const timer = setTimeout(() => reject(new Error('Disconnect timeout')), timeout);
    socket.once('disconnect', () => { clearTimeout(timer); resolve(); });
  });
}

function waitForConnectError(socket: ClientSocket, timeout = 5000): Promise<Error> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Connect error timeout')), timeout);
    socket.once('connect_error', (err) => { clearTimeout(timer); resolve(err); });
  });
}

async function test(id: string, name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    results.push({ id, name, passed: true });
    console.log(`  ✅ ${id} ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ id, name, passed: false, error: msg });
    console.log(`  ❌ ${id} ${name}`);
    console.log(`     Error: ${msg}`);
  }
}

function assert(condition: boolean, msg: string): void {
  if (!condition) throw new Error(`Assertion failed: ${msg}`);
}

// ─── Known seed data ───
const SEED_DEVICE_1_ID = 'd1111111-1111-1111-1111-111111111111'; // SIGN-001
const SEED_DEVICE_2_ID = 'd2222222-2222-2222-2222-222222222222'; // SIGN-002
const SEED_DEVICE_1_NAMA = 'SIGN-001';
const SEED_CONTENT_1_ID = 'c1111111-1111-1111-1111-111111111111';

// ─── Main ───

async function main() {
  console.log('\n🔌 Phase 4 — Socket.IO Integration Test Suite\n');

  // ── Setup: Start fresh server ──
  console.log('  Setting up test server...');
  const app = express();
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json());
  app.use('/api', apiRouter);
  app.use(errorHandler);

  httpServer = http.createServer(app);
  initSocketIO(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => {
      const addr = httpServer.address();
      serverPort = typeof addr === 'object' && addr ? addr.port : 0;
      console.log(`  Test server listening on port ${serverPort}`);
      resolve();
    });
  });

  // Reset seed devices to offline before tests
  clearRegistry();
  const supabase = getSupabase();
  await supabase.from('devices').update({ status: 'offline', last_seen: null }).neq('id', '');

  // Allow server to initialize
  await sleep(500);

  // ─── GROUP 1: Player Connection ───
  console.log('\n📦 Group 1: Player Connection');

  await test('1.1', 'Player connects with valid deviceId (UUID) → status online', async () => {
    const socket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    socket.connect();
    await waitForConnect(socket);
    await sleep(300);

    // Check registry
    assert(!!socket.id && getConnections(SEED_DEVICE_1_ID).has(socket.id), 'Socket not in registry');

    // Check DB
    const { data } = await supabase.from('devices').select('status').eq('id', SEED_DEVICE_1_ID).single();
    assert(data?.status === 'online', `Expected status 'online', got '${data?.status}'`);

    socket.disconnect();
    await waitForDisconnect(socket);
    await sleep(300);
  });

  await test('1.2', 'Player connects with valid deviceId (nama) → resolved and online', async () => {
    const socket = createClientSocket({ deviceId: SEED_DEVICE_1_NAMA });
    socket.connect();
    await waitForConnect(socket);
    await sleep(300);

    // Should resolve to UUID
    assert(!!socket.id && getConnections(SEED_DEVICE_1_ID).has(socket.id), 'Socket not in registry under UUID');

    socket.disconnect();
    await waitForDisconnect(socket);
    await sleep(300);
  });

  await test('1.3', 'Player connects with invalid deviceId → connection rejected', async () => {
    const socket = createClientSocket({ deviceId: 'NONEXISTENT-DEVICE-999' });
    const errPromise = waitForConnectError(socket);
    socket.connect();

    const err = await errPromise;
    assert(err.message.includes('not found'), `Expected error message to mention 'not found', got '${err.message}'`);
    assert(!socket.connected, 'Socket should not be connected');
  });

  // ─── GROUP 2: Admin Connection ───
  console.log('\n📦 Group 2: Admin Connection');

  await test('2.1', 'Admin connects without deviceId → joins admin room', async () => {
    const socket = createClientSocket({ role: 'admin' });
    socket.connect();
    await waitForConnect(socket);
    await sleep(200);

    assert(socket.connected, 'Admin socket should be connected');

    socket.disconnect();
    await waitForDisconnect(socket);
  });

  await test('2.2', 'Admin receives device:status when player connects', async () => {
    // Reset device to offline
    await supabase.from('devices').update({ status: 'offline', last_seen: null }).eq('id', SEED_DEVICE_1_ID);

    const adminSocket = createClientSocket({ role: 'admin' });
    adminSocket.connect();
    await waitForConnect(adminSocket);
    await sleep(200);

    // Now connect a player
    const statusPromise = waitForEvent<{ deviceId: string; status: string }>(adminSocket, 'device:status');
    const playerSocket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    playerSocket.connect();

    const statusData = await statusPromise;
    assert(statusData.deviceId === SEED_DEVICE_1_ID, `Expected deviceId ${SEED_DEVICE_1_ID}, got ${statusData.deviceId}`);
    assert(statusData.status === 'online', `Expected status 'online', got '${statusData.status}'`);

    playerSocket.disconnect();
    await waitForDisconnect(playerSocket);
    adminSocket.disconnect();
    await waitForDisconnect(adminSocket);
    await sleep(300);
  });

  // ─── GROUP 3: Heartbeat ───
  console.log('\n📦 Group 3: Heartbeat');

  await test('3.1', 'Heartbeat updates last_seen in DB', async () => {
    const socket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    socket.connect();
    await waitForConnect(socket);
    await sleep(200);

    // Record current last_seen
    const { data: before } = await supabase.from('devices').select('last_seen').eq('id', SEED_DEVICE_1_ID).single();
    const beforeTime = before?.last_seen;

    await sleep(100);

    // Send heartbeat
    socket.emit('device:heartbeat');
    await sleep(500);

    const { data: after } = await supabase.from('devices').select('last_seen').eq('id', SEED_DEVICE_1_ID).single();
    assert(after?.last_seen !== null, 'last_seen should not be null after heartbeat');
    // The new last_seen should be >= the old one
    if (beforeTime) {
      assert(new Date(after!.last_seen!).getTime() >= new Date(beforeTime).getTime(), 'last_seen should be updated');
    }

    socket.disconnect();
    await waitForDisconnect(socket);
    await sleep(300);
  });

  await test('3.2', 'Heartbeat notifies admin dashboard', async () => {
    const adminSocket = createClientSocket({ role: 'admin' });
    adminSocket.connect();
    await waitForConnect(adminSocket);

    const playerSocket = createClientSocket({ deviceId: SEED_DEVICE_2_ID });
    playerSocket.connect();
    await waitForConnect(playerSocket);
    // Consume the connect status event
    await waitForEvent(adminSocket, 'device:status');
    await sleep(200);

    // Now send heartbeat and listen for status event
    const statusPromise = waitForEvent<{ deviceId: string; status: string }>(adminSocket, 'device:status');
    playerSocket.emit('device:heartbeat');

    const statusData = await statusPromise;
    assert(statusData.deviceId === SEED_DEVICE_2_ID, `Expected ${SEED_DEVICE_2_ID}`);
    assert(statusData.status === 'online', 'Expected online');

    playerSocket.disconnect();
    await waitForDisconnect(playerSocket);
    adminSocket.disconnect();
    await waitForDisconnect(adminSocket);
    await sleep(300);
  });

  // ─── GROUP 4: Disconnect ───
  console.log('\n📦 Group 4: Disconnect & Offline');

  await test('4.1', 'Single player disconnect → device goes offline', async () => {
    const socket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    socket.connect();
    await waitForConnect(socket);
    await sleep(300);

    socket.disconnect();
    await waitForDisconnect(socket);
    await sleep(500);

    const { data } = await supabase.from('devices').select('status').eq('id', SEED_DEVICE_1_ID).single();
    assert(data?.status === 'offline', `Expected 'offline', got '${data?.status}'`);
  });

  await test('4.2', 'Multiple sockets same device → stays online when one disconnects', async () => {
    const socket1 = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    const socket2 = createClientSocket({ deviceId: SEED_DEVICE_1_ID });

    socket1.connect();
    await waitForConnect(socket1);
    await sleep(200);

    socket2.connect();
    await waitForConnect(socket2);
    await sleep(200);

    // Both should be in registry
    const connections = getConnections(SEED_DEVICE_1_ID);
    assert(connections.size >= 2, `Expected >= 2 connections, got ${connections.size}`);

    // Disconnect one
    socket1.disconnect();
    await waitForDisconnect(socket1);
    await sleep(500);

    // Device should still be online (socket2 still connected)
    const { data } = await supabase.from('devices').select('status').eq('id', SEED_DEVICE_1_ID).single();
    assert(data?.status === 'online', `Expected 'online' (socket2 still connected), got '${data?.status}'`);

    // Disconnect the second → now offline
    socket2.disconnect();
    await waitForDisconnect(socket2);
    await sleep(500);

    const { data: afterAll } = await supabase.from('devices').select('status').eq('id', SEED_DEVICE_1_ID).single();
    assert(afterAll?.status === 'offline', `Expected 'offline' after all disconnected, got '${afterAll?.status}'`);
  });

  await test('4.3', 'Admin receives device:status offline on disconnect', async () => {
    const adminSocket = createClientSocket({ role: 'admin' });
    adminSocket.connect();
    await waitForConnect(adminSocket);

    const playerSocket = createClientSocket({ deviceId: SEED_DEVICE_2_ID });
    playerSocket.connect();
    await waitForConnect(playerSocket);
    // Consume the connect online event
    await waitForEvent(adminSocket, 'device:status');
    await sleep(200);

    // Listen for offline event
    const statusPromise = waitForEvent<{ deviceId: string; status: string }>(adminSocket, 'device:status');
    playerSocket.disconnect();

    const statusData = await statusPromise;
    assert(statusData.deviceId === SEED_DEVICE_2_ID, `Expected ${SEED_DEVICE_2_ID}`);
    assert(statusData.status === 'offline', `Expected 'offline', got '${statusData.status}'`);

    adminSocket.disconnect();
    await waitForDisconnect(adminSocket);
    await sleep(200);
  });

  // ─── GROUP 5: Content Assignment via REST → Socket.IO ───
  console.log('\n📦 Group 5: Content Assignment Events');

  await test('5.1', 'Assigning content via REST emits content:updated to target player', async () => {
    const playerSocket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    playerSocket.connect();
    await waitForConnect(playerSocket);
    await sleep(300);

    // Listen for content:updated event
    const contentPromise = waitForEvent<{ id: string; judul: string } | null>(playerSocket, 'content:updated');

    // Assign content via REST API
    const res = await fetch(`${BASE_URL()}/api/devices/${SEED_DEVICE_1_ID}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: SEED_CONTENT_1_ID }),
    });
    assert(res.ok, `REST assign failed: ${res.status}`);

    const contentData = await contentPromise;
    assert(contentData !== null, 'Should receive content data');
    assert(contentData!.id === SEED_CONTENT_1_ID, `Expected content id ${SEED_CONTENT_1_ID}`);

    playerSocket.disconnect();
    await waitForDisconnect(playerSocket);
    await sleep(300);
  });

  await test('5.2', 'Unassigning content (null) emits content:updated with null', async () => {
    // First ensure content is assigned
    await fetch(`${BASE_URL()}/api/devices/${SEED_DEVICE_1_ID}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: SEED_CONTENT_1_ID }),
    });

    const playerSocket = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    playerSocket.connect();
    await waitForConnect(playerSocket);
    await sleep(300);

    const contentPromise = waitForEvent<null>(playerSocket, 'content:updated');

    // Unassign
    const res = await fetch(`${BASE_URL()}/api/devices/${SEED_DEVICE_1_ID}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: null }),
    });
    assert(res.ok, `REST unassign failed: ${res.status}`);

    const contentData = await contentPromise;
    assert(contentData === null, 'Should receive null content');

    playerSocket.disconnect();
    await waitForDisconnect(playerSocket);
    await sleep(300);
  });

  await test('5.3', 'Content event is NOT sent to unrelated device rooms (isolation)', async () => {
    const player1 = createClientSocket({ deviceId: SEED_DEVICE_1_ID });
    const player2 = createClientSocket({ deviceId: SEED_DEVICE_2_ID });

    player1.connect();
    player2.connect();
    await waitForConnect(player1);
    await waitForConnect(player2);
    await sleep(300);

    // Track if player2 gets any content:updated event
    let player2Received = false;
    player2.on('content:updated', () => { player2Received = true; });

    // Assign content only to device 1
    const res = await fetch(`${BASE_URL()}/api/devices/${SEED_DEVICE_1_ID}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentId: SEED_CONTENT_1_ID }),
    });
    assert(res.ok, `REST assign failed: ${res.status}`);

    // Wait to see if player2 received anything
    await sleep(1000);
    assert(!player2Received, 'Player 2 should NOT receive content:updated meant for device 1');

    player1.disconnect();
    player2.disconnect();
    await waitForDisconnect(player1);
    await waitForDisconnect(player2);
    await sleep(300);
  });

  // ─── Cleanup ───
  console.log('\n  Cleaning up...');
  stopSweeper();

  // Reset devices to offline
  await supabase.from('devices').update({ status: 'offline', last_seen: null, active_content_id: null }).neq('id', '');

  // Disconnect any remaining sockets
  for (const s of sockets) {
    if (s.connected) s.disconnect();
  }

  // Close server
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });

  // ─── Summary ───
  console.log('\n═══════════════════════════════════════════');
  console.log('  Socket.IO Test Results');
  console.log('═══════════════════════════════════════════');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  for (const r of results) {
    console.log(`  ${r.passed ? '✅' : '❌'} ${r.id} ${r.name}`);
    if (r.error) console.log(`     → ${r.error}`);
  }

  console.log(`\n  Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('═══════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

