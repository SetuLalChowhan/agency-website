import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const SECRET = process.env.REVALIDATE_SECRET ?? "dev-only-revalidate-secret";

/**
 * POST /api/revalidate  { secret, tags?, paths? }
 * Called by the CMS server after any content change so the public site
 * picks up edits without a full rebuild. Never exposes the secret.
 */
export async function POST(request: Request) {
  let body: { secret?: string; tags?: string[]; paths?: string[] } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.secret !== SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.filter((t) => typeof t === "string") : [];
  const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === "string") : [];

  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: true, tags, paths });
}
