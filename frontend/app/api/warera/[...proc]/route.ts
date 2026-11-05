/**
 * POST/GET /api/warera/[...proc]
 *
 * Generic authenticated proxy to WarEra's tRPC API.
 */

import { NextResponse, NextRequest } from 'next/server';
import { readSession } from '@/services/warera/session';
import { WarEraClient } from '@/services/warera/client';

export const runtime = 'nodejs';

type ProcKind = 'query' | 'mutation';

function procKindFromUrl(url: URL): ProcKind {
  return url.searchParams.get('kind') === 'mutation' ? 'mutation' : 'query';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proc: string[] }> },
) {
  const proc = (await params).proc.join('.');
  const url = request.nextUrl;
  const batch = url.searchParams.get('batch') === '1';
  const client = new WarEraClient((await readSession())?.jar ?? {});

  if (batch) {
    let input: Record<string, unknown> = {};
    try {
      input = JSON.parse(url.searchParams.get('input') ?? '{}');
    } catch {
      return NextResponse.json({ error: 'invalid input param' }, { status: 400 });
    }
    try {
      const data = await client.batch<any>('query', Object.entries(input).map(([, body]) => ({
        proc,
        input: body,
      })));
      return NextResponse.json({ data });
    } catch (error: any) {
      return NextResponse.json(
        { error: error?.message ?? 'batch query failed' },
        { status: error?.status ?? 500 },
      );
    }
  }

  let input: unknown = {};
  try {
    input = JSON.parse(url.searchParams.get('input') ?? '{}');
  } catch {
    input = {};
  }
  try {
    const data = await client.query<any>(proc, input);
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'query failed' },
      { status: error?.status ?? 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proc: string[] }> },
) {
  const proc = (await params).proc.join('.');
  const kind = procKindFromUrl(request.nextUrl);
  const client = new WarEraClient((await readSession())?.jar ?? {});

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    let data: unknown;
    if (kind === 'mutation') {
      data = await client.mutate<any>(proc, body);
    } else {
      data = await client.query<any>(proc, body);
    }
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? `${kind} failed` },
      { status: error?.status ?? 500 },
    );
  }
}
