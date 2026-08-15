import { env } from "../config/env";
import { logger } from "./logger";

const seen = new Map<string, number>();

/**
 * Ask the Next.js app to purge its cache for the given tags/paths.
 * Fails silently when no REVALIDATE_URL is configured or the app is down.
 */
export async function triggerRevalidation(tags: string[], paths: string[] = []): Promise<void> {
  if (!env.revalidateUrl) return;
  if (!env.revalidateSecret) return;

  // Short debounce (300ms) for identical payloads to absorb accidental duplicate triggers
  const key = JSON.stringify({ tags, paths });
  const last = seen.get(key) ?? 0;
  if (Date.now() - last < 300) return;
  seen.set(key, Date.now());

  try {
    const res = await fetch(env.revalidateUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        secret: env.revalidateSecret,
        tags,
        paths,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      logger.warn("Revalidation request failed", { status: res.status, url: env.revalidateUrl });
    }
  } catch (err) {
    logger.debug("Revalidation skipped (client unreachable)", { error: (err as Error).message });
  }
}
