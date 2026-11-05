/**
 * POST /api/warera/session/start
 *
 * Step 1 of WarEra email OTP: request the code via `auth.connect`.
 * Body: { email, captchaToken, countryId? }
 * Returns: { pendingUserId } and stores a pending encrypted session jar.
 */

import { NextResponse, NextRequest } from 'next/server';
import { writeSession, SESSION_COOKIE } from '@/services/warera/session';
import { WarEraClient } from '@/services/warera/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: { email?: string; captchaToken?: string; countryId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, captchaToken, countryId } = body;
  if (!email || !captchaToken) {
    return NextResponse.json(
      { error: 'email and captchaToken are required' },
      { status: 400 },
    );
  }

  const client = new WarEraClient();
  try {
    const result = await client.mutate<any>('auth.connect', {
      email,
      u: '',
      captchaToken,
      countryId: countryId ?? '6813b6d546e731854c7ac848',
    });

    await writeSession({
      version: 1,
      wareraUserId: '',
      username: '',
      jar: client.cookies,
      pendingUserId: result?.userId ?? null,
      email,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      pendingUserId: result?.userId ?? null,
      status: result?.status ?? 'pending',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'auth.connect failed' },
      { status: error?.status ?? 500 },
    );
  }
}
