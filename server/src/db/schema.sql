CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    tipe TEXT NOT NULL CHECK (tipe IN ('text', 'image', 'video', 'url')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_contents_updated_at ON contents;
CREATE TRIGGER set_contents_updated_at
BEFORE UPDATE ON contents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL UNIQUE,
    lokasi TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
    last_seen TIMESTAMPTZ,
    active_content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_devices_updated_at ON devices;
CREATE TRIGGER set_devices_updated_at
BEFORE UPDATE ON devices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nama TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_admins_updated_at ON admins;
CREATE TRIGGER set_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_devices_nama ON devices(nama);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_active_content ON devices(active_content_id);
CREATE INDEX IF NOT EXISTS idx_contents_tipe ON contents(tipe);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

INSERT INTO contents (id, judul, tipe, payload, url)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Promo Produk', 'text', '{"text": "Diskon Akhir Tahun hingga 50% untuk Semua Pelanggan!"}'::jsonb, NULL),
    ('c2222222-2222-2222-2222-222222222222', 'Informasi Operasional', 'text', '{"text": "Jam operasional Gudang: Senin - Sabtu 08.00 - 17.00 WIB."}'::jsonb, NULL),
    ('c3333333-3333-3333-3333-333333333333', 'Jadwal Meeting', 'text', '{"text": "Ruang Meeting 1: All-Hands Meeting pukul 14.00 WIB."}'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO devices (id, nama, lokasi, status, active_content_id)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'SIGN-001', 'Lobby', 'offline', 'c1111111-1111-1111-1111-111111111111'),
    ('d2222222-2222-2222-2222-222222222222', 'SIGN-002', 'Warehouse', 'offline', 'c2222222-2222-2222-2222-222222222222'),
    ('d3333333-3333-3333-3333-333333333333', 'SIGN-003', 'Meeting Room', 'offline', 'c3333333-3333-3333-3333-333333333333')
ON CONFLICT (nama) DO UPDATE
SET lokasi = EXCLUDED.lokasi,
    active_content_id = EXCLUDED.active_content_id;
