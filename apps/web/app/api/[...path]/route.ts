import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all API proxy route.
 * Forwards all /api/* requests to the Express backend server-side,
 * completely eliminating browser CORS restrictions.
 */

// NOTE: Use BACKEND_URL (server-only) not NEXT_PUBLIC_API_URL (baked at build time).
// Falls back to the hardcoded Vercel backend URL so it always works even
// if the env var is missing.
function getBackendBase(): string {
  const url =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://loca-api-git-main-pkunakachiri2001s-projects.vercel.app/api';
  return url.replace(/\/api\/?$/, '');
}

type Params = { path: string[] };

async function handler(req: NextRequest, { params }: { params: Params }) {
  const backendBase = getBackendBase();
  const path = (params.path ?? []).join('/');
  const search = req.nextUrl.search ?? '';
  const targetUrl = `${backendBase}/api/${path}${search}`;

  // Forward headers, drop hop-by-hop headers
  const forwardHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!['host', 'connection', 'transfer-encoding', 'keep-alive'].includes(key.toLowerCase())) {
      forwardHeaders[key] = value;
    }
  });

  let body: string | ArrayBuffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ?? undefined,
    });

    const resHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    const resBody = await backendRes.arrayBuffer();

    return new NextResponse(resBody, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[API Proxy] fetch error:', targetUrl, err);
    return NextResponse.json(
      { success: false, message: 'Backend unreachable', target: targetUrl },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
