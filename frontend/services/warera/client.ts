/**
 * WarEra tRPC client (server side only).
 *
 * - Rotates across the five API shards and parks a failed shard for a minute.
 * - Enforces a shared 90 req/min token bucket per session.
 * - Manages a cookie jar because WarEra sessions are HttpOnly cookies.
 * - Caches idempotent queries for a short TTL.
 */

import type { WarEraGameConfig } from './types';

export const WARERA_HOSTS = [
  'https://api2.warera.io',
  'https://api3.warera.io',
  'https://api4.warera.io',
  'https://api5.warera.io',
  'https://api6.warera.io',
] as const;

const RATE_LIMIT = 90;
const RATE_WINDOW_MS = 60_000;
const SHARD_COOLDOWN_MS = 60_000;
const MAX_BATCH = 50;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export type CookieRecord = Record<string, { value: string; expires?: number }>;

export class WarEraError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'WarEraError';
  }
}

class TokenBucket {
  private stamps: number[] = [];

  async acquire(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.stamps = this.stamps.filter((t) => now - t < RATE_WINDOW_MS);
      if (this.stamps.length < RATE_LIMIT) {
        this.stamps.push(now);
        return;
      }
      const wait = RATE_WINDOW_MS - (now - this.stamps[0]) + 25;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

const buckets = new Map<string, TokenBucket>();
const shardCooldown = new Map<string, number>();

interface CacheEntry {
  expires: number;
  value: unknown;
}

const queryCache = new Map<string, CacheEntry>();

function bucketFor(key: string): TokenBucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = new TokenBucket();
    buckets.set(key, bucket);
  }
  return bucket;
}

function cacheKey(proc: string, input: unknown): string {
  return `${proc}:${JSON.stringify(input ?? {})}`;
}

function cookieHeader(jar: CookieRecord): string {
  const now = Date.now();
  return Object.entries(jar)
    .filter(([, c]) => !c.expires || c.expires > now)
    .map(([name, c]) => `${name}=${c.value}`)
    .join('; ');
}

function absorbSetCookies(jar: CookieRecord, headers: Headers): void {
  const setCookies =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : [headers.get('set-cookie')].filter(Boolean);

  for (const raw of setCookies) {
    if (!raw) continue;
    const [pair] = raw.split(';');
    const eq = pair.indexOf('=');
    if (eq < 0) continue;
    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    if (!name) continue;

    if (!value || /expires=Thu, 01 Jan 1970/i.test(raw)) {
      delete jar[name];
      continue;
    }

    const expiresMatch = /max-age=(\d+)/i.exec(raw);
    jar[name] = {
      value,
      expires: expiresMatch ? Date.now() + Number(expiresMatch[1]) * 1000 : undefined,
    };
  }
}

function pickHost(): string {
  const now = Date.now();
  const available = WARERA_HOSTS.filter((h) => (shardCooldown.get(h) ?? 0) < now);
  const pool = available.length ? available : WARERA_HOSTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface WarEraClientOptions {
  bucketKey?: string;
  timeoutMs?: number;
  cookieJar?: CookieRecord;
}

export class WarEraClient {
  private jar: CookieRecord;
  private bucketKey: string;
  private timeoutMs: number;

  constructor(jar: CookieRecord = {}, options: WarEraClientOptions = {}) {
    this.jar = jar;
    this.bucketKey = options.bucketKey ?? 'anonymous';
    this.timeoutMs = options.timeoutMs ?? 15_000;
  }

  get cookies(): CookieRecord {
    return this.jar;
  }

  private headers(): HeadersInit {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      origin: 'https://app.warera.io',
      referer: 'https://app.warera.io/',
      'user-agent': USER_AGENT,
      accept: '*/*',
    };

    const jar = this.jar;
    if (jar.vid?.value) headers['x-vid'] = jar.vid.value;
    if (jar.gr?.value) headers['x-gr'] = jar.gr.value;
    const cookie = cookieHeader(jar);
    if (cookie) headers.cookie = cookie;
    return headers;
  }

  private async fetchWithFailover(path: string, init: RequestInit): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      const host = pickHost();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        await bucketFor(this.bucketKey).acquire();
        const response = await fetch(`${host}${path}`, {
          ...init,
          headers: { ...(init.headers as Record<string, string>), ...(this.headers() as Record<string, string>) },
          signal: controller.signal,
          cache: 'no-store',
        });
        absorbSetCookies(this.jar, response.headers);
        if (response.status >= 500) {
          shardCooldown.set(host, Date.now() + SHARD_COOLDOWN_MS);
        }
        return response;
      } catch (error) {
        lastError = error;
        shardCooldown.set(host, Date.now() + SHARD_COOLDOWN_MS);
      } finally {
        clearTimeout(timer);
      }
    }

    throw new WarEraError(
      lastError instanceof Error ? lastError.message : 'WarEra API unreachable',
      0,
    );
  }

  private async parse<T>(response: Response, proc: string): Promise<T> {
    const text = await response.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new WarEraError(`WarEra returned non-JSON for ${proc} (${response.status})`, response.status);
    }

    const envelope = parsed as {
      result?: { data: T };
      error?: { message: string; data?: { code?: string; httpStatus?: number } };
    };

    if (envelope.error) {
      throw new WarEraError(
        envelope.error.message,
        envelope.error.data?.httpStatus ?? response.status,
        envelope.error.data?.code,
      );
    }
    if (!envelope.result) {
      throw new WarEraError(`WarEra returned no result for ${proc}`, response.status);
    }
    return envelope.result.data;
  }

  async query<T>(proc: string, input: unknown = {}, ttlMs = 0): Promise<T> {
    const key = cacheKey(proc, input);
    if (ttlMs > 0) {
      const hit = queryCache.get(key);
      if (hit && hit.expires > Date.now()) return hit.value as T;
    }

    const response = await this.fetchWithFailover(`/trpc/${proc}`, {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    });
    const value = await this.parse<T>(response, proc);

    if (ttlMs > 0) {
      queryCache.set(key, { expires: Date.now() + ttlMs, value });
    }
    return value;
  }

  async mutate<T>(proc: string, input: unknown = {}): Promise<T> {
    const response = await this.fetchWithFailover(`/trpc/${proc}`, {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    });
    return this.parse<T>(response, proc);
  }

  /**
   * Batch same-type procedures (max 50). Mutations are POST-only; queries are
   * sent as a batched GET to match the official client.
   */
  async batch<T>(
    kind: 'query' | 'mutation',
    calls: Array<{ proc: string; input?: unknown }>,
  ): Promise<T[]> {
    if (calls.length === 0) return [];
    if (calls.length > MAX_BATCH) {
      const chunks: Array<Array<{ proc: string; input?: unknown }>> = [];
      for (let i = 0; i < calls.length; i += MAX_BATCH) chunks.push(calls.slice(i, i + MAX_BATCH));
      const results: T[] = [];
      for (const chunk of chunks) results.push(...(await this.batch<T>(kind, chunk)));
      return results;
    }

    const procs = calls.map((c) => c.proc).join(',');
    const input: Record<string, unknown> = {};
    calls.forEach((call, index) => {
      input[String(index)] = call.input ?? {};
    });

    const response =
      kind === 'query'
        ? await this.fetchWithFailover(
            `/trpc/${procs}?batch=1&input=${encodeURIComponent(JSON.stringify(input))}`,
            { method: 'GET' },
          )
        : await this.fetchWithFailover(`/trpc/${procs}?batch=1`, {
            method: 'POST',
            body: JSON.stringify(input),
          });

    const text = await response.text();
    const parsed = JSON.parse(text) as Array<{
      result?: { data: T };
      error?: { message: string; data?: { httpStatus?: number; code?: string } };
    }>;

    return parsed.map((entry, index) => {
      if (entry.error) {
        throw new WarEraError(
          entry.error.message,
          entry.error.data?.httpStatus ?? response.status,
          entry.error.data?.code,
        );
      }
      return (entry.result as { data: T }).data;
    });
  }

  // ── Typed helpers used by the adapter ──────────────────────────────────────

  getMe<T>() {
    return this.query<T>('user.getMe', {});
  }

  getRegions<T>() {
    return this.query<T>('region.getRegionsObject', {}, 300_000);
  }

  getCountries<T>() {
    return this.query<T>('country.getAllCountries', {}, 60_000);
  }

  getGameConfig() {
    return this.query<WarEraGameConfig>('gameConfig.getGameConfig', {}, 3_600_000);
  }

  getMap<T>() {
    return this.query<T>('map.getMapData', {}, 300_000);
  }
}

export function clearQueryCache(): void {
  queryCache.clear();
}
