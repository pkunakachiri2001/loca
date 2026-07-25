import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all API proxy route.
 * Forwards all /api/* requests to the Express backend server-side,
 * completely eliminating browser CORS restrictions.
 *
 * Backend URL is read at request time (not build time), so env vars
 * always resolve correctly on Vercel.
 */

const BACKEND_BASE =
  (process.env.NEXT_PUBLIC_API_URL || 'https://project-nxl93.vercel.app/api')
    .replace(/\/api\/?$/, ''); // ensure no trailing /api

async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path?.join('/') ?? '';
  const search = req.nextUrl.search ?? '';
  const targetUrl = `${BACKEND_BASE}/api/${path}${search}`;

  // Forward relevant headers, strip host so the backend gets its own host
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!['host', 'connection'].includes(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  // Read body for non-GET/HEAD requests
  let body: BodyInit | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.arrayBuffer();
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ?? undefined,
      // @ts-ignore — Node 18+ fetch supports this
      duplex: 'half',
    });

    // Forward backend response back to the browser
    const resHeaders = new Headers(backendRes.headers);
    // Remove transfer-encoding — Next.js handles this itself
    resHeaders.delete('transfer-encoding');

    return new NextResponse(backendRes.body, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[API Proxy] Error forwarding request to backend:', err);
    return NextResponse.json(
      { success: false, message: 'Backend unreachable' },
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
