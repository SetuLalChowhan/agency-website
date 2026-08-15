"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";

const budgets = ["Under $10k", "$10k — $25k", "$25k — $50k", "$50k+"];

const initial = { name: "", email: "", company: "", budget: budgets[1], message: "" };

export function ContactForm() {
  const [form, setForm] = useState(initial);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const update = (key: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email and a few words about the project.");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Something went wrong sending your message.");
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Could not reach the studio right now. Please try again or email us directly.");
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[28rem] flex-col items-start justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink">
          <Check className="h-5 w-5" />
        </span>
        <h2 className="display mt-8 text-4xl text-paper md:text-5xl">Message sent.</h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-smoke">
          Thanks, {form.name.split(" ")[0]}. We read every brief personally — expect a reply from a
          real person (usually within 48 hours).
        </p>
      </div>
    );
  }

  const field =
    "w-full border-b border-paper/20 bg-transparent pb-3 pt-2 text-[15px] text-paper placeholder:text-stone transition-colors duration-300 focus:border-acid focus:outline-none";
  const label = "meta-label block text-stone";

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={label}>
            Name *
          </label>
          <input
            id="cf-name"
            type="text"
            value={form.name}
            onChange={update("name")}
            placeholder="Ada Lovelace"
            className={field}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={label}>
            Email *
          </label>
          <input
            id="cf-email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="ada@company.com"
            className={field}
            autoComplete="email"
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="cf-company" className={label}>
            Company
          </label>
          <input
            id="cf-company"
            type="text"
            value={form.company}
            onChange={update("company")}
            placeholder="Company / project"
            className={field}
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="cf-budget" className={label}>
            Budget range
          </label>
          <select id="cf-budget" value={form.budget} onChange={update("budget")} className={field}>
            {budgets.map((b) => (
              <option key={b} value={b} className="bg-ink">
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <label htmlFor="cf-message" className={label}>
          About the project *
        </label>
        <textarea
          id="cf-message"
          value={form.message}
          onChange={update("message")}
          placeholder="What are you building, and what does success look like?"
          rows={5}
          className={`${field} resize-none`}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 text-sm text-acid">
          {error}
        </p>
      )}

      <div className="mt-10">
        <Magnetic strength={0.3} className="inline-block">
          <button
            type="submit"
            data-cursor="open"
            disabled={sending}
            className="group inline-flex items-center gap-3 bg-acid px-8 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-paper disabled:cursor-wait disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send message"}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
