import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({
  path: path.resolve(currentDir, '../../.env'),
});

export interface AppConfig {
  port: number;
  webOrigin: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  heartbeatIntervalMs: number;
  deviceOfflineTimeoutMs: number;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  webOrigin: process.env.WEB_ORIGIN || 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  heartbeatIntervalMs: parseInt(
    process.env.HEARTBEAT_INTERVAL_MS || '10000',
    10
  ),
  deviceOfflineTimeoutMs: parseInt(
    process.env.DEVICE_OFFLINE_TIMEOUT_MS || '30000',
    10
  ),
};
