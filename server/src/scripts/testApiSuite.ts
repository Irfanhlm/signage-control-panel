/**
 * Automated REST API Test Suite
 * Tests positive, negative, validation, and database integrity edge cases.
 */

const BASE_URL = 'http://localhost:3001/api';

interface TestResult {
  name: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  error?: string;
}

const results: TestResult[] = [];

async function assertApi(
  name: string,
  url: string,
  options: RequestInit,
  expectedStatus: number,
  validator?: (data: any) => boolean | string
) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const statusMatches = res.status === expectedStatus;
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      // Non-json response
    }

    let validationError: string | undefined;
    if (statusMatches && validator) {
      const vResult = validator(data);
      if (typeof vResult === 'string') {
        validationError = vResult;
      } else if (!vResult) {
        validationError = 'Validator returned false';
      }
    }

    const passed = statusMatches && !validationError;
    results.push({
      name,
      passed,
      expectedStatus,
      actualStatus: res.status,
      error: !statusMatches
        ? `Status mismatch: expected ${expectedStatus}, got ${res.status}. Body: ${JSON.stringify(data)}`
        : validationError,
    });

    return { res, data };
  } catch (err: any) {
    results.push({
      name,
      passed: false,
      expectedStatus,
      actualStatus: 0,
      error: `Network/Fetch error: ${err.message}`,
    });
    return { res: null, data: null };
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Rigorous REST API Test Suite...');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  // --- 1. Health Check ---
  await assertApi('1.1 Health Check', '/health', { method: 'GET' }, 200, (d) => d.success === true && d.data?.status === 'ok');

  // --- 2. Device Validation Cases ---
  await assertApi('2.1 Create Device Empty Body', '/devices', { method: 'POST', body: JSON.stringify({}) }, 400, (d) => !d.success && !!d.errors?.nama && !!d.errors?.lokasi);
  await assertApi('2.2 Create Device Empty Nama', '/devices', { method: 'POST', body: JSON.stringify({ nama: '   ', lokasi: 'Lobby' }) }, 400, (d) => !!d.errors?.nama);
  await assertApi('2.3 Create Device Empty Lokasi', '/devices', { method: 'POST', body: JSON.stringify({ nama: 'SIGN-TEST-VALID', lokasi: '   ' }) }, 400, (d) => !!d.errors?.lokasi);

  // --- 3. Device Lifecycle & Uniqueness ---
  const uniqueDeviceName = `TEST-DEV-${Date.now()}`;
  const { data: createdDevData } = await assertApi(
    '3.1 Create Device Valid',
    '/devices',
    { method: 'POST', body: JSON.stringify({ nama: uniqueDeviceName, lokasi: 'Automated Lab' }) },
    201,
    (d) => d.success && d.data?.nama === uniqueDeviceName && d.data?.status === 'offline'
  );

  const testDevId = createdDevData?.data?.id;

  // 3.2 Duplicate Device Name
  await assertApi(
    '3.2 Create Device Duplicate Name',
    '/devices',
    { method: 'POST', body: JSON.stringify({ nama: uniqueDeviceName, lokasi: 'Another Room' }) },
    409,
    (d) => d.success === false
  );

  // 3.3 Get Device by UUID
  await assertApi(
    '3.3 Get Device by UUID',
    `/devices/${testDevId}`,
    { method: 'GET' },
    200,
    (d) => d.data?.id === testDevId && d.data?.nama === uniqueDeviceName
  );

  // 3.4 Get Device by Slug Nama
  await assertApi(
    '3.4 Get Device by Nama',
    `/devices/${uniqueDeviceName}`,
    { method: 'GET' },
    200,
    (d) => d.data?.id === testDevId
  );

  // 3.5 Get Nonexistent Device UUID
  await assertApi(
    '3.5 Get Nonexistent Device UUID',
    '/devices/00000000-0000-0000-0000-000000000000',
    { method: 'GET' },
    404,
    (d) => d.success === false
  );

  // 3.6 Get Nonexistent Device Name
  await assertApi(
    '3.6 Get Nonexistent Device Name',
    '/devices/DOES-NOT-EXIST-DEVICE-NAME-XYZ',
    { method: 'GET' },
    404,
    (d) => d.success === false
  );

  // 3.7 Patch Device Validation
  await assertApi(
    '3.7 Patch Device Empty Nama',
    `/devices/${testDevId}`,
    { method: 'PATCH', body: JSON.stringify({ nama: '  ' }) },
    400,
    (d) => !!d.errors?.nama
  );

  // 3.8 Patch Device Valid
  await assertApi(
    '3.8 Patch Device Valid Lokasi',
    `/devices/${testDevId}`,
    { method: 'PATCH', body: JSON.stringify({ lokasi: 'Updated Lab Room' }) },
    200,
    (d) => d.data?.lokasi === 'Updated Lab Room'
  );

  // --- 4. Content Validation & Lifecycle ---
  await assertApi('4.1 Create Content Empty Body', '/contents', { method: 'POST', body: JSON.stringify({}) }, 400, (d) => !!d.errors?.judul && !!d.errors?.tipe);
  await assertApi('4.2 Create Content Invalid Tipe', '/contents', { method: 'POST', body: JSON.stringify({ judul: 'Test', tipe: 'unsupported_type' }) }, 400, (d) => !!d.errors?.tipe);
  await assertApi('4.3 Create Content Invalid Payload Type', '/contents', { method: 'POST', body: JSON.stringify({ judul: 'Test', tipe: 'text', payload: 'not-an-object' }) }, 400, (d) => !!d.errors?.payload);

  const { data: createdContentData } = await assertApi(
    '4.4 Create Content Valid Text',
    '/contents',
    { method: 'POST', body: JSON.stringify({ judul: 'Suite Test Text', tipe: 'text', payload: { text: 'Running automated tests' } }) },
    201,
    (d) => d.data?.tipe === 'text' && d.data?.payload?.text === 'Running automated tests'
  );

  const testContentId = createdContentData?.data?.id;

  // 4.5 Get Content Non-UUID
  await assertApi('4.5 Get Content Non-UUID', '/contents/not-a-uuid', { method: 'GET' }, 400, (d) => d.success === false);

  // 4.6 Get Content Nonexistent UUID
  await assertApi('4.6 Get Content Nonexistent UUID', '/contents/00000000-0000-0000-0000-000000000000', { method: 'GET' }, 404, (d) => d.success === false);

  // 4.7 Get Content Valid
  await assertApi('4.7 Get Content by ID', `/contents/${testContentId}`, { method: 'GET' }, 200, (d) => d.data?.id === testContentId);

  // 4.8 Patch Content Valid
  await assertApi(
    '4.8 Patch Content Valid',
    `/contents/${testContentId}`,
    { method: 'PATCH', body: JSON.stringify({ judul: 'Suite Test Updated' }) },
    200,
    (d) => d.data?.judul === 'Suite Test Updated'
  );

  // --- 5. Assignment & Current-Content ---
  // 5.1 Assign to Nonexistent Device
  await assertApi(
    '5.1 Assign to Nonexistent Device',
    '/devices/00000000-0000-0000-0000-000000000000/content',
    { method: 'PUT', body: JSON.stringify({ contentId: testContentId }) },
    404
  );

  // 5.2 Assign Invalid contentId
  await assertApi(
    '5.2 Assign Invalid contentId Format',
    `/devices/${testDevId}/content`,
    { method: 'PUT', body: JSON.stringify({ contentId: 'invalid-not-uuid' }) },
    400,
    (d) => !!d.errors?.contentId
  );

  // 5.3 Assign Nonexistent Content UUID
  await assertApi(
    '5.3 Assign Nonexistent Content UUID',
    `/devices/${testDevId}/content`,
    { method: 'PUT', body: JSON.stringify({ contentId: '00000000-0000-0000-0000-000000000000' }) },
    404
  );

  // 5.4 Assign Valid Content
  await assertApi(
    '5.4 Assign Valid Content to Device',
    `/devices/${testDevId}/content`,
    { method: 'PUT', body: JSON.stringify({ contentId: testContentId }) },
    200,
    (d) => d.data?.device?.active_content_id === testContentId && d.data?.content?.id === testContentId
  );

  // 5.5 Get Current Content (Assigned)
  await assertApi(
    '5.5 Get Current Content when Assigned',
    `/devices/${testDevId}/current-content`,
    { method: 'GET' },
    200,
    (d) => d.data?.content?.id === testContentId && d.data?.content?.judul === 'Suite Test Updated'
  );

  // 5.6 Unassign Content (contentId: null)
  await assertApi(
    '5.6 Unassign Content with null',
    `/devices/${testDevId}/content`,
    { method: 'PUT', body: JSON.stringify({ contentId: null }) },
    200,
    (d) => d.data?.device?.active_content_id === null && d.data?.content === null
  );

  // 5.7 Get Current Content (Unassigned)
  await assertApi(
    '5.7 Get Current Content when Unassigned',
    `/devices/${testDevId}/current-content`,
    { method: 'GET' },
    200,
    (d) => d.data?.content === null
  );

  // --- 6. Foreign Key ON DELETE SET NULL Cascade Integrity ---
  // Re-assign content
  await assertApi('6.1 Re-assign for FK test', `/devices/${testDevId}/content`, { method: 'PUT', body: JSON.stringify({ contentId: testContentId }) }, 200);

  // Delete the content
  await assertApi('6.2 Delete Content While Assigned', `/contents/${testContentId}`, { method: 'DELETE' }, 200);

  // Verify device active_content_id automatically became NULL
  await assertApi(
    '6.3 Device active_content_id became NULL via FK cascade',
    `/devices/${testDevId}/current-content`,
    { method: 'GET' },
    200,
    (d) => d.data?.device?.active_content_id === null && d.data?.content === null
  );

  // --- 7. Cleanup Test Device ---
  await assertApi('7.1 Cleanup Delete Test Device', `/devices/${testDevId}`, { method: 'DELETE' }, 200);

  // Verify deleted device is 404
  await assertApi('7.2 Verify Deleted Device is 404', `/devices/${testDevId}`, { method: 'GET' }, 404);

  // --- Results Summary ---
  console.log('\n====================================================');
  console.log('📊 TEST SUITE SUMMARY:');
  console.log('====================================================');
  let passCount = 0;
  let failCount = 0;
  for (const r of results) {
    if (r.passed) {
      passCount++;
      console.log(`✅ [PASS] ${r.name}`);
    } else {
      failCount++;
      console.error(`❌ [FAIL] ${r.name} -> ${r.error}`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runTests();

