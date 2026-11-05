/**
 * GET /api/warera/session
 *
 * Returns whether a WarEra session is active and the authenticated player's
 * identity (via `user.getMe`).
 */

import { NextResponse } from 'next/server';
import { readSession } from '@/services/warera/session';
import { WarEraClient } from '@/services/warera/client';

export const runtime = 'nodejs';

export async function GET() {
  const session = await readSession();
  if (!session || !session.wareraUserId) {
    return NextResponse.json({ connected: false });
  }

  const client = new WarEraClient(session.jar);
  try {
    const me = await client.query<any>('user.getMe', {});
    return NextResponse.json({
      connected: true,
      user: {
        id: me._id,
        username: me.username,
        country: me.country,
        secretId: me.secretId,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { connected: false, error: error?.message ?? 'session expired' },
      { status: 401 },
    );
  }
}
