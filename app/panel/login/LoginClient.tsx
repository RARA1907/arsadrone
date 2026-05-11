"use client";

import Image from "next/image";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

// useSearchParams() Suspense boundary gerektiriyor (Next.js 16)
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/panel";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Giriş başarısız";
      setError(msg === "Invalid login credentials" ? "E-posta veya şifre hatalı" : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--ad-muted)" }}>
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-ad"
          placeholder="ajans@arsadrone.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--ad-muted)" }}>
          Şifre
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-ad"
        />
      </div>

      {error && (
        <div className="rounded-lg px-3 py-2 text-sm"
          style={{ background: "color-mix(in srgb, var(--ad-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-red) 25%, transparent)", color: "var(--ad-red)" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}

export default function LoginClient() {
  return (
    <main className="min-h-screen bg-ad-bg flex items-center justify-center px-4">
      <div className="max-w-sm w-full">

        {/* Logo + başlık */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo.svg" alt="ArsaDrone" width={150} height={36} priority />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
            style={{ background: "color-mix(in srgb, var(--ad-orange) 12%, transparent)", color: "var(--ad-orange)", border: "1px solid color-mix(in srgb, var(--ad-orange) 25%, transparent)" }}>
            Ajans Paneli
          </span>
        </div>

        <Suspense fallback={
          <div className="card p-6 flex items-center justify-center h-48">
            <span className="text-sm animate-pulse" style={{ color: "var(--ad-muted)" }}>Yükleniyor...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>

      </div>
    </main>
  );
}
