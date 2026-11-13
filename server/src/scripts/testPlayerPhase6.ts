/**
 * Phase 6 — Signage Player Verification Test Suite
 *
 * Tests the complete end-to-end player lifecycle:
 * - Current content fetching via REST API
 * - Socket.IO authentication and room joining
 * - Admin online notification
 * - Heartbeat transmission
 * - Real-time content update targeting (isolation between players)
 * - Empty content state on unassignment
 * - Status transition to offline on disconnect
 *
 * Usage: npm run test:player (from server directory)
 */
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface TestResult {
  id: string;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];
const activeSockets: ClientSocket[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function createSocket(auth: Record<string, any>): ClientSocket {
  const socket = ioClient(SERVER_URL, {
    auth,
    transports: ['websocket', 'polling'],
    forceNew: true,
    reconnection: false,
  });
  activeSockets.push(socket);
  return socket;
}

function cleanupAllSockets(): void {
  for (const s of activeSockets) {
    if (s.connected) {
      s.disconnect();
    }
  }
}

async function runTest(
  id: string,
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    results.push({ id, name, passed: true });
    console.log(`  \x1b[32m✔\x1b[0m ${id}: ${name}`);
  } catch (err) {
    const errorMsg = (err as Error).message;
    results.push({ id, name, passed: false, error: errorMsg });
    console.log(`  \x1b[31m✘\x1b[0m ${id}: ${name}`);
    console.log(`    \x1b[31mError:\x1b[0m ${errorMsg}`);
  }
}

async function main() {
  console.log('\n======================================================');
  console.log(' Phase 6: Signage Player Verification Suite');
  console.log(` Target Server: ${SERVER_URL}`);
  console.log('======================================================\n');

  // Verify server is reachable
  try {
    const healthRes = await fetch(`${SERVER_URL}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`Server returned ${healthRes.status}`);
    }
  } catch (err) {
    console.error(`\x1b[31mFatal: Server at ${SERVER_URL} is unreachable.\x1b[0m`, err);
    process.exit(1);
  }

  // Get test devices and contents
  const devicesRes = await fetch(`${SERVER_URL}/api/devices`);
  const devicesJson: ApiResponse = await devicesRes.json();
  const devices = devicesJson.data;

  const contentsRes = await fetch(`${SERVER_URL}/api/contents`);
  const contentsJson: ApiResponse = await contentsRes.json();
  const contents = contentsJson.data;

  if (!devices || devices.length < 2) {
    console.error('\x1b[31mFatal: Need at least 2 seeded devices for tests.\x1b[0m');
    process.exit(1);
  }

  const device1 = devices.find((d: any) => d.nama === 'SIGN-001') || devices[0];
  const device2 = devices.find((d: any) => d.nama === 'SIGN-002') || devices[1];
  const testContent1 = contents[0];
  const testContent2 = contents[1];

  console.log(`Test Devices: ${device1.nama} (${device1.id}), ${device2.nama} (${device2.id})`);
  console.log(`Test Contents: "${testContent1?.judul}", "${testContent2?.judul}"\n`);

  // ─── Test 1: GET current-content for valid device ───
  await runTest(
    'TC-P01',
    'GET /api/devices/:id/current-content returns device and active content',
    async () => {
      const res = await fetch(`${SERVER_URL}/api/devices/${device1.nama}/current-content`);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const json: ApiResponse = await res.json();
      if (!json.success || !json.data?.device) {
        throw new Error('Response missing success or device payload');
      }
      if (json.data.device.nama !== device1.nama) {
        throw new Error(`Device mismatch: expected ${device1.nama}, got ${json.data.device.nama}`);
      }
    }
  );

  // ─── Test 2: GET current-content for non-existent device returns 404 ───
  await runTest(
    'TC-P02',
    'GET /api/devices/INVALID_CODE/current-content returns 404 Not Found',
    async () => {
      const res = await fetch(`${SERVER_URL}/api/devices/NON_EXISTENT_SIGNAGE/current-content`);
      if (res.status !== 404) {
        throw new Error(`Expected 404 status code, got ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      if (json.success !== false) {
        throw new Error('Expected success: false for 404 response');
      }
    }
  );

  // ─── Test 3: Admin connects to Socket.IO ───
  let adminSocket: ClientSocket;
  await runTest(
    'TC-P03',
    'Admin socket connects and joins "admin" room',
    async () => {
      adminSocket = createSocket({ role: 'admin' });
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Admin connect timeout')), 3000);
        adminSocket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        adminSocket.on('connect_error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
    }
  );

  // ─── Test 4: Player 1 connects & Admin receives status: online ───
  let player1Socket: ClientSocket;
  await runTest(
    'TC-P04',
    `Player 1 (${device1.nama}) connects and admin receives status: online`,
    async () => {
      const statusPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for admin device:status')), 4000);
        adminSocket.on('device:status', (event: any) => {
          if (event.deviceId === device1.id && event.status === 'online') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      player1Socket = createSocket({ deviceId: device1.nama });
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Player connect timeout')), 3000);
        player1Socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
        player1Socket.on('connect_error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      await statusPromise;
    }
  );

  // ─── Test 5: Player 2 connects & Admin receives status: online ───
  let player2Socket: ClientSocket;
  await runTest(
    'TC-P05',
    `Player 2 (${device2.nama}) connects concurrently and marks online`,
    async () => {
      const statusPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for player 2 status')), 4000);
        adminSocket.on('device:status', (event: any) => {
          if (event.deviceId === device2.id && event.status === 'online') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      player2Socket = createSocket({ deviceId: device2.nama });
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Player 2 connect timeout')), 3000);
        player2Socket.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      await statusPromise;
    }
  );

  // ─── Test 6: Heartbeat transmission ───
  await runTest(
    'TC-P06',
    'Player sends device:heartbeat without error',
    async () => {
      player1Socket.emit('device:heartbeat');
      await sleep(200);
      if (!player1Socket.connected) {
        throw new Error('Socket disconnected unexpectedly after heartbeat');
      }
    }
  );

  // ─── Test 7: Target content assignment & room isolation ───
  await runTest(
    'TC-P07',
    'Assign content to Player 1: Player 1 receives content:updated, Player 2 does NOT',
    async () => {
      let player1Received = false;
      let player2Received = false;

      player1Socket.on('content:updated', (data: any) => {
        if (data?.id === testContent2.id) {
          player1Received = true;
        }
      });

      player2Socket.on('content:updated', () => {
        player2Received = true;
      });

      // Assign testContent2 to device1
      const assignRes = await fetch(`${SERVER_URL}/api/devices/${device1.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: testContent2.id }),
      });

      if (!assignRes.ok) {
        throw new Error(`Assign content failed with status ${assignRes.status}`);
      }

      await sleep(600);

      if (!player1Received) {
        throw new Error('Player 1 did not receive content:updated event');
      }
      if (player2Received) {
        throw new Error('Room isolation violated: Player 2 also received content:updated event');
      }
    }
  );

  // ─── Test 8: Content unassignment emits null ───
  await runTest(
    'TC-P08',
    'Unassign content (null): Player 1 receives content:updated with null payload',
    async () => {
      let receivedNull = false;

      player1Socket.on('content:updated', (data: any) => {
        if (data === null) {
          receivedNull = true;
        }
      });

      const unassignRes = await fetch(`${SERVER_URL}/api/devices/${device1.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: null }),
      });

      if (!unassignRes.ok) {
        throw new Error(`Unassign content failed with status ${unassignRes.status}`);
      }

      await sleep(600);

      if (!receivedNull) {
        throw new Error('Player 1 did not receive content:updated with null');
      }

      // Restore content 1 for device1
      await fetch(`${SERVER_URL}/api/devices/${device1.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: testContent1.id }),
      });
    }
  );

  // ─── Test 9: Player disconnect updates status to offline ───
  await runTest(
    'TC-P09',
    'Player 1 disconnects: Admin receives status: offline',
    async () => {
      const offlinePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for offline status')), 4000);
        adminSocket.on('device:status', (event: any) => {
          if (event.deviceId === device1.id && event.status === 'offline') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      player1Socket.disconnect();
      await offlinePromise;
    }
  );

  // ─── Test 10: Player 2 disconnects ───
  await runTest(
    'TC-P10',
    'Player 2 disconnects: Admin receives status: offline',
    async () => {
      const offlinePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout waiting for player 2 offline')), 4000);
        adminSocket.on('device:status', (event: any) => {
          if (event.deviceId === device2.id && event.status === 'offline') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      player2Socket.disconnect();
      await offlinePromise;
    }
  );

  cleanupAllSockets();

  // Print summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log('\n======================================================');
  console.log(` Summary: ${passed}/${total} PASSED ${failed > 0 ? `(${failed} FAILED)` : ''}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  cleanupAllSockets();
  console.error('Unexpected error running player test suite:', err);
  process.exit(1);
});

