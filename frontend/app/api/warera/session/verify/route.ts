/**
 * POST /api/warera/session/verify
 *
 * Step 2 of WarEra email OTP: submit the code via `auth.tryCode`.
 * Body: { code, pendingUserId? }
 */

import { NextResponse, NextRequest } from 'next/server';
import { readSession, writeSession, clearSession } from '@/services/warera/session';
import { WarEraClient } from '@/services/warera/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: { code?: string; pendingUserId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code, pendingUserId } = body;
  if (!code) {
    return NextResponse.json({ error: 'code is required' }, { status: 400 });
  }

  const session = await readSession();
  if (!session || !session.pendingUserId) {
    return NextResponse.json(
      { error: 'No pending email OTP session. Call /session/start first.' },
      { status: 409 },
    );
  }

  const client = new WarEraClient(session.jar);
  try {
    const result = await client.mutate<any>('auth.tryCode', {
      code,
      userId: pendingUserId ?? session.pendingUserId,
      u: '',
    });

    await writeSession({
      version: 1,
      wareraUserId: result?.userId ?? session.pendingUserId,
      username: result?.username ?? '',
      jar: client.cookies,
      pendingUserId: undefined,
      email: session.email,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      user: {
        id: result?.userId ?? session.pendingUserId,
        email: session.email ?? '',
        username: result?.username,
      },
    });
  } catch (error: any) {
    await clearSession();
    return NextResponse.json(
      { error: error?.message ?? 'auth.tryCode failed' },
      { status: error?.status ?? 401 },
    );
  }
}
