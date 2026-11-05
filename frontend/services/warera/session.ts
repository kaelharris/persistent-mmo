/**
 * Encrypted WarEra session cookie.
 *
 * The WarEra session itself is an HttpOnly cookie the browser cannot read.
 * We mirror the jar server-side, encrypted with AES-256-GCM, and keep only
 * the ciphertext in our own httpOnly cookie.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import type { CookieRecord } from './client';

export const SESSION_COOKIE = 'aegis_warera_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

export interface WarEraSession {
  version: 1;
  wareraUserId: string;
  username?: string;
  jar: CookieRecord;
  pendingUserId?: string;
  email?: string;
  createdAt: number;
}

function key(): Buffer {
  const raw = process.env.WARERA_SESSION_KEY;
  if (raw) {
    const decoded = Buffer.from(raw, 'base64');
    if (decoded.length === 32) return decoded;
    return createHash('sha256').update(raw).digest();
  }
  if (process.env.NODE_ENV === 'production') {
    console.warn('[warera] WARERA_SESSION_KEY is not set; using a static dev key.');
  }
  return createHash('sha256').update('aegis-warera-dev-key').digest();
}

function encrypt(payload: WarEraSession): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}

function decrypt(token: string): WarEraSession | null {
  try {
    const raw = Buffer.from(token, 'base64url');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const body = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
    const parsed = JSON.parse(json) as WarEraSession;
    if (parsed.version !== 1 || !parsed.wareraUserId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readSession(): Promise<WarEraSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? decrypt(token) : null;
}

export async function writeSession(session: WarEraSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, encrypt(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
