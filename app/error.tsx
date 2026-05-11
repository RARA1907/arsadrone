"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[ArsaDrone] Uncaught error:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-ad-bg flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--ad-text)" }}>
          Bir Şeyler Ters Gitti
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--ad-muted)" }}>
          Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <button onClick={reset} className="btn-primary px-6">
          Yeniden Dene
        </button>
      </div>
    </main>
  );
}
