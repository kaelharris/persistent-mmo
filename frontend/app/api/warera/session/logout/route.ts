/**
 * POST /api/warera/session/logout
 *
 * Calls `auth.logout` on WarEra and clears the encrypted session jar.
 */

import { NextResponse } from 'next/server';
import { readSession, clearSession } from '@/services/warera/session';
import { WarEraClient } from '@/services/warera/client';

export const runtime = 'nodejs';

export async function POST() {
  const session = await readSession();
  if (session) {
    try {
      const client = new WarEraClient(session.jar);
      await client.mutate('auth.logout', {});
    } catch {
      // Ignore logout failures; we still clear our jar.
    }
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
