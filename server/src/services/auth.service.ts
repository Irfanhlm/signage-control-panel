import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSupabase } from '../lib/supabase.js';
import { config } from '../config/index.js';
import { AdminUser, AuthTokenPayload } from '../types/index.js';

export async function login(
  username: string,
  password: string
): Promise<{ token: string; admin: AdminUser }> {
  let matchedAdmin: AdminUser | null = null;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, password_hash, nama, role')
      .eq('username', username)
      .maybeSingle();

    if (!error && data && data.password_hash) {
      const isMatch = await bcrypt.compare(password, data.password_hash);
      if (isMatch) {
        matchedAdmin = {
          id: data.id,
          username: data.username,
          nama: data.nama || data.username,
          role: 'admin',
        };
      }
    }
  } catch {
    matchedAdmin = null;
  }

  if (!matchedAdmin) {
    if (username === config.adminUsername && password === config.adminPassword) {
      matchedAdmin = {
        id: 'admin-default',
        username: config.adminUsername,
        nama: config.adminName,
        role: 'admin',
      };
    }
  }

  if (!matchedAdmin) {
    const err = new Error('Username atau password tidak valid');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }

  const payload: AuthTokenPayload = {
    sub: matchedAdmin.id,
    username: matchedAdmin.username,
    nama: matchedAdmin.nama,
    role: matchedAdmin.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

  return { token, admin: matchedAdmin };
}

export function verifyToken(token: string): AuthTokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    return decoded;
  } catch {
    const err = new Error('Sesi login telah kedaluwarsa atau tidak valid');
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
}
