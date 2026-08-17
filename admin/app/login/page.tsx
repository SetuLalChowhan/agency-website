"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { api, ApiError, setAuthToken } from "@/lib/api";
import { Button, Field, Input, useToast } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ success: boolean; data?: { token?: string } }>("/api/v1/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      toast("Welcome back");
      router.replace(params.get("next") ?? "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reach the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="display-logo text-2xl font-semibold tracking-tight text-paper">
            KERN<span className="align-super text-[0.5em] text-acid">®</span>
          </p>
          <p className="meta-label mt-3 text-stone">Studio administration</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kern.studio"
              autoComplete="username"
              autoFocus
              required
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </Field>

          {error && (
            <p role="alert" className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={loading}>
            {loading ? "Signing in" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-stone">
          Seeded default: <span className="font-mono text-smoke">admin@kern.studio</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
