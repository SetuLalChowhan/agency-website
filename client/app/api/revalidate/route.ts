import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET;
const INSECURE_DEFAULTS = new Set(["dev-revalidate-secret", "dev-only-revalidate-secret"]);
const DEV_FALLBACK = "dev-revalidate-secret";

/**
 * POST /api/revalidate  { secret, tags?, paths? }
 * Called by the CMS server after any content change so the public site
 * picks up edits without a full rebuild.
 *
 * REVALIDATE_SECRET must be set and shared with the CMS server. In
 * production the known-insecure defaults are rejected — if the secret is
 * missing the public site would silently keep serving stale cached content,
 * so we fail loudly instead.
 */
export async function POST(request: Request) {
  const secret = SECRET || (process.env.NODE_ENV === "production" ? "" : DEV_FALLBACK);

  if (!secret || (process.env.NODE_ENV === "production" && INSECURE_DEFAULTS.has(secret))) {
    return NextResponse.json(
      {
        error:
          "Revalidation is not configured: set REVALIDATE_SECRET on the client to a strong value that matches the CMS server.",
      },
      { status: 503 }
    );
  }

  let body: { secret?: string; tags?: string[]; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string") : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === "string") : [];

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  for (const path of paths) revalidatePath(path);

  if (tags.length > 0 && !paths.includes("/")) {
    revalidatePath("/", "layout");
  }

  return NextResponse.json({ revalidated: true, tags, paths });
}
