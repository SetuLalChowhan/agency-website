import { NextRequest, NextResponse } from "next/server";

/**
 * CMS API proxy — every public-site data read flows through this Next.js
 * route instead of the site fetching the CMS server directly.
 *
 * The CMS base URL is resolved server-side from PUBLIC_API_URL (with
 * NEXT_PUBLIC_API_URL as a fallback), so it never has to be baked into the
 * client bundle or hard-coded per environment.
 *
 * Caching is deliberately left to the caller: pages fetch this route with
 * `next: { revalidate, tags }` (see lib/cms.ts), and the CMS server purges
 * those tags after every save via /api/revalidate. The route itself always
 * pulls fresh from the CMS so a cache miss is never stale.
 *
 * Path convention: /api/cms/site/bootstrap → {CMS_API}/api/v1/site/bootstrap
 */

const CMS_API =
  process.env.PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path } = await ctx.params;

  if (!CMS_API) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "cms_unconfigured",
          message: "CMS API URL is not configured (set PUBLIC_API_URL)",
        },
      },
      { status: 503 }
    );
  }

  const query = request.nextUrl.searchParams.toString();
  const target = `${CMS_API}/api/v1/${path.map(encodeURIComponent).join("/")}${query ? `?${query}` : ""}`;

  try {
    const res = await fetch(target, {
      method: "GET",
      headers: { accept: "application/json" },
      // The outer fetch (in lib/cms.ts) owns caching/revalidation; never
      // cache the upstream hop itself.
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "cms_unreachable",
          message: (err as Error).message,
        },
      },
      { status: 502 }
    );
  }
}
