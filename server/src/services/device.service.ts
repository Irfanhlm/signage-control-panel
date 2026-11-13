import { getSupabase } from '../lib/supabase.js';
import {
  Device,
  Content,
  DeviceStatus,
  CreateDeviceDto,
  UpdateDeviceDto,
  isUuid,
} from '../types/index.js';

const TABLE = 'devices';

/**
 * Resolve a device by UUID or unique nama.
 */
export async function findDeviceByIdOrNama(identifier: string): Promise<Device | null> {
  const supabase = getSupabase();

  if (isUuid(identifier)) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', identifier)
      .single();
    if (error || !data) return null;
    return data as Device;
  }

  // Lookup by nama (e.g. SIGN-001)
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('nama', identifier)
    .single();
  if (error || !data) return null;
  return data as Device;
}

export async function listDevices(): Promise<Device[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list devices: ${error.message}`);
  return (data ?? []) as Device[];
}

export async function getDeviceById(identifier: string): Promise<Device | null> {
  return findDeviceByIdOrNama(identifier);
}

export async function createDevice(dto: CreateDeviceDto): Promise<Device> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      nama: dto.nama,
      lokasi: dto.lokasi,
      status: 'offline',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw Object.assign(new Error(`Device dengan nama '${dto.nama}' sudah ada.`), { statusCode: 409 });
    }
    throw new Error(`Failed to create device: ${error.message}`);
  }
  return data as Device;
}

export async function updateDevice(identifier: string, dto: UpdateDeviceDto): Promise<Device | null> {
  const device = await findDeviceByIdOrNama(identifier);
  if (!device) return null;

  const supabase = getSupabase();
  const updatePayload: Record<string, unknown> = {};
  if (dto.nama !== undefined) updatePayload.nama = dto.nama;
  if (dto.lokasi !== undefined) updatePayload.lokasi = dto.lokasi;

  if (Object.keys(updatePayload).length === 0) {
    return device; // Nothing to update
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', device.id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw Object.assign(new Error(`Device dengan nama '${dto.nama}' sudah ada.`), { statusCode: 409 });
    }
    throw new Error(`Failed to update device: ${error.message}`);
  }
  return data as Device;
}

export async function deleteDevice(identifier: string): Promise<boolean> {
  const device = await findDeviceByIdOrNama(identifier);
  if (!device) return false;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', device.id);

  if (error) throw new Error(`Failed to delete device: ${error.message}`);
  return true;
}

export async function assignContent(
  identifier: string,
  contentId: string | null
): Promise<{ device: Device; content: Content | null }> {
  const device = await findDeviceByIdOrNama(identifier);
  if (!device) {
    throw Object.assign(new Error('Device tidak ditemukan.'), { statusCode: 404 });
  }

  const supabase = getSupabase();

  // Validate content exists if assigning
  let content: Content | null = null;
  if (contentId !== null) {
    const { data: contentData, error: contentError } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single();

    if (contentError || !contentData) {
      throw Object.assign(new Error('Content tidak ditemukan.'), { statusCode: 404 });
    }
    content = contentData as Content;
  }

  // Update active_content_id
  const { data: updatedDevice, error: updateError } = await supabase
    .from(TABLE)
    .update({ active_content_id: contentId })
    .eq('id', device.id)
    .select()
    .single();

  if (updateError) throw new Error(`Failed to assign content: ${updateError.message}`);

  return { device: updatedDevice as Device, content };
}

export async function getCurrentContent(identifier: string): Promise<{
  device: Device;
  content: Content | null;
}> {
  const device = await findDeviceByIdOrNama(identifier);
  if (!device) {
    throw Object.assign(new Error('Device tidak ditemukan.'), { statusCode: 404 });
  }

  if (!device.active_content_id) {
    return { device, content: null };
  }

  const supabase = getSupabase();
  const { data: content, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', device.active_content_id)
    .single();

  if (error || !content) {
    return { device, content: null };
  }

  return { device, content: content as Content };
}

/**
 * Update device status and last_seen timestamp.
 * Used by Socket.IO handlers for online/offline transitions and heartbeats.
 */
export async function updateDeviceStatus(
  deviceId: string,
  status: DeviceStatus,
  lastSeen: string
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from(TABLE)
    .update({ status, last_seen: lastSeen })
    .eq('id', deviceId);

  if (error) {
    throw new Error(`Failed to update device status: ${error.message}`);
  }
}

