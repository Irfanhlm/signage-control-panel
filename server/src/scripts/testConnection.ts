import { getSupabase } from '../lib/supabase.js';
import { config } from '../config/index.js';

async function testConnection() {
  console.log('--- Pengujian Koneksi Database Supabase ---');
  console.log(`URL: ${config.supabaseUrl || '(belum diisi)'}`);
  console.log(`Service Role Key: ${config.supabaseServiceRoleKey ? '***TERSEDIA***' : '(belum diisi)'}`);

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    console.error('\n❌ GAGAL: SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi pada file server/.env');
    console.error('Silakan isi variabel tersebut terlebih dahulu dan jalankan script ini kembali.');
    process.exit(1);
  }

  const supabase = getSupabase();

  try {
    console.log('\n1. Memeriksa tabel "devices"...');
    const { data: devices, error: devError } = await supabase
      .from('devices')
      .select('id, nama, lokasi, status, active_content_id')
      .limit(5);

    if (devError) {
      throw new Error(`Gagal membaca tabel 'devices': ${devError.message}`);
    }
    console.log(`✅ Tabel "devices" terhubung! Ditemukan ${devices.length} record.`);

    console.log('\n2. Memeriksa tabel "contents"...');
    const { data: contents, error: conError } = await supabase
      .from('contents')
      .select('id, judul, tipe')
      .limit(5);

    if (conError) {
      throw new Error(`Gagal membaca tabel 'contents': ${conError.message}`);
    }
    console.log(`✅ Tabel "contents" terhubung! Ditemukan ${contents.length} record.`);

    console.log('\n🎉 SEMUA PENGUJIAN DATABASE BERHASIL!');
    console.log('Database Supabase siap digunakan untuk Tahap 3 (REST API) & Tahap 4 (Socket.IO).');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ GAGAL: ${message}`);
    console.error('Pastikan Anda sudah menjalankan script SQL di server/src/db/schema.sql pada Supabase SQL Editor.');
    process.exit(1);
  }
}

testConnection();

