/**
 * WarEraAuthRepository — implements `IAuthRepository` against WarEra's
 * auth router.
 *
 * WarEra has no password login. Accounts are entered through:
 * 1. `auth.connect` → email OTP (captcha-gated, server sets session cookie)
 * 2. `auth.tryCode` → submit the OTP code (server sets session cookie)
 * 3. OAuth (Google / Discord) → redirect via `auth.discordUrl` / `auth.googleUrl`
 *
 * Because the session cookie is HttpOnly, the bridge keeps the WarEra cookie
 * jar server-side (encrypted in our own cookie) and exposes only the presence
 * of an authenticated session to the client.
 */

import type { SessionUser, IAuthRepository } from '../repository/IAuthRepository';
import { WarEraClient } from './client';
import { readSession, writeSession, clearSession, SESSION_COOKIE } from './session';
import { cookies } from 'next/headers';

const REGION_FALLBACK = '6813b6d546e731854c7ac848';

export class WarEraAuthRepository implements IAuthRepository {
  private client: WarEraClient;

  constructor(client: WarEraClient) {
    this.client = client;
  }

  /*──────────────────────────── session ────────────────────────────*/

  async getSessionUser(): Promise<SessionUser | null> {
    const session = await readSession();
    if (!session || !session.wareraUserId) return null;

    try {
      const me = await this.client.query<any>('user.getMe', {});
      return {
        id: me._id,
        email: session.email ?? '',
        username: me.username,
      };
    } catch {
      // Session is stale or WarEra rotated the cookie. Treat as unauthenticated.
      return null;
    }
  }

  async signIn(email: string, password: string) {
    // WarEra does not accept passwords. The OTP entry point replaces this.
    return {
      user: null,
      error: new Error('Password login is not supported by WarEra. Use email OTP or OAuth.'),
    };
  }

  async signUp(username: string, email: string, password: string) {
    return {
      user: null,
      error: new Error('WarEra accounts are created through email OTP or OAuth, not password.'),
    };
  }

  async signOut() {
    try {
      const session = await readSession();
      if (session) {
        const client = new WarEraClient(session.jar);
        await client.mutate('auth.logout', {}).catch(() => {});
      }
    } finally {
      await clearSession();
    }
    return { error: null };
  }

  /*──────────────────────────── email OTP ────────────────────────────*/

  /** Step 1: request the OTP. Returns `{ pendingUserId }` for the caller to store. */
  async requestCode(email: string, captchaToken: string, countryId?: string) {
    const session = await readSession();
    const client = new WarEraClient(session?.jar ?? {});
    const result = await client.mutate<any>('auth.connect', {
      email,
      u: '',
      captchaToken,
      countryId: countryId ?? REGION_FALLBACK,
    });
    await writeSession({
      version: 1,
      wareraUserId: '',
      username: '',
      jar: client.cookies,
      pendingUserId: result?.userId,
      email,
      createdAt: Date.now(),
    });
    return { pendingUserId: result?.userId ?? null };
  }

  /** Step 2: submit the OTP code to finalise the session. */
  async verifyCode(code: string, pendingUserId?: string) {
    const session = await readSession();
    if (!session || !session.pendingUserId) {
      return { user: null, error: new Error('No pending email OTP session.') };
    }

    const client = new WarEraClient(session.jar);
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

    return { user: { id: session.pendingUserId, email: session.email ?? '', username: result?.username } };
  }

  /*──────────────────────────── OAuth ────────────────────────────*/

  async signInWithOAuth(provider: 'google' | 'discord') {
    const session = await readSession();
    const client = new WarEraClient(session?.jar ?? {});
    const result = await client.mutate<any>('auth.googleUrl', {
      u: '',
      captchaToken: '',
      countryId: REGION_FALLBACK,
    });

    if (result?.url) {
      return { error: null, url: result.url as string };
    }

    return {
      error: new Error(`Unable to start ${provider} OAuth.`),
    } as { error: Error | null };
  }

  onAuthStateChange(callback: (userId: string | null) => void): () => void {
    // There is no WebSocket for auth state; poll lazily instead.
    let active = true;
    const interval = setInterval(async () => {
      if (!active) return;
      const user = await this.getSessionUser();
      callback(user ? user.id : null);
    }, 15_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }
}
