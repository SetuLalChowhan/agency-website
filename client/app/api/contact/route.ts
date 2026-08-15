import { NextResponse } from "next/server";

const API = process.env.PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * POST /api/contact
 * Proxies the public contact form to the CMS server so the API origin and
 * any secrets never reach the browser. Validates basic shape here as a
 * first line of defense (the server re-validates authoritatively).
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Please fill in your name, email and a few words about the project." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "That email address doesn't look right." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API}/api/v1/leads/contact`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: name.slice(0, 120),
        email: email.slice(0, 254),
        company: typeof body.company === "string" ? body.company.slice(0, 160) : "",
        budget: typeof body.budget === "string" ? body.budget.slice(0, 60) : "",
        message: message.slice(0, 5000),
      }),
      signal: AbortSignal.timeout(8000),
    });

    const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    if (!res.ok) {
      return NextResponse.json({ error: json.error ?? "Something went wrong sending your message." }, { status: res.status });
    }
    return NextResponse.json({ message: json.message ?? "Message received." });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the studio right now. Please email us directly — we reply within 48 hours." },
      { status: 502 }
    );
  }
}
