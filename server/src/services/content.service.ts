import { getSupabase } from '../lib/supabase.js';
import { Content, CreateContentDto, UpdateContentDto } from '../types/index.js';

const TABLE = 'contents';
const VALID_TYPES = ['text', 'image', 'video', 'url'];

export async function listContents(): Promise<Content[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to list contents: ${error.message}`);
  return (data ?? []) as Content[];
}

export async function getContentById(id: string): Promise<Content | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as Content;
}

export async function createContent(dto: CreateContentDto): Promise<Content> {
  if (!VALID_TYPES.includes(dto.tipe)) {
    throw Object.assign(
      new Error(`Tipe konten '${dto.tipe}' tidak valid. Gunakan: ${VALID_TYPES.join(', ')}`),
      { statusCode: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      judul: dto.judul,
      tipe: dto.tipe,
      payload: dto.payload ?? {},
      url: dto.url ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create content: ${error.message}`);
  return data as Content;
}

export async function updateContent(id: string, dto: UpdateContentDto): Promise<Content | null> {
  const existing = await getContentById(id);
  if (!existing) return null;

  if (dto.tipe !== undefined && !VALID_TYPES.includes(dto.tipe)) {
    throw Object.assign(
      new Error(`Tipe konten '${dto.tipe}' tidak valid. Gunakan: ${VALID_TYPES.join(', ')}`),
      { statusCode: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {};
  if (dto.judul !== undefined) updatePayload.judul = dto.judul;
  if (dto.tipe !== undefined) updatePayload.tipe = dto.tipe;
  if (dto.payload !== undefined) updatePayload.payload = dto.payload;
  if (dto.url !== undefined) updatePayload.url = dto.url;

  if (Object.keys(updatePayload).length === 0) {
    return existing;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update content: ${error.message}`);
  return data as Content;
}

export async function deleteContent(id: string): Promise<boolean> {
  const existing = await getContentById(id);
  if (!existing) return false;

  const supabase = getSupabase();
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete content: ${error.message}`);
  return true;
}

