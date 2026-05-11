"use client";

import Image from "next/image";
import { useState } from "react";
import OrderForm from "@/components/OrderForm";
import { OrderCreated } from "@/lib/api";

export default function SiparisClient() {
  const [order, setOrder] = useState<OrderCreated | null>(null);

  if (order) {
    return <SuccessScreen order={order} onNew={() => setOrder(null)} />;
  }

  return (
    <main className="min-h-screen bg-ad-bg">
      {/* Header */}
      <header className="sticky top-0 z-10"
        style={{ background: "var(--ad-bg)", borderBottom: "1px solid var(--ad-border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Image src="/logo.svg" alt="ArsaDrone" width={140} height={34} priority />
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-4">
        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{ background: "color-mix(in srgb, var(--ad-orange) 12%, transparent)", color: "var(--ad-orange)", border: "1px solid color-mix(in srgb, var(--ad-orange) 25%, transparent)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse inline-block" />
          AI Destekli Video Üretimi
        </div>
        <h2 className="text-2xl font-bold mt-3" style={{ color: "var(--ad-text)" }}>
          Sipariş Formu
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--ad-muted)" }}>
          Bilgilerinizi doldurun — ekibimiz en kısa sürede profesyonel tanıtım videonuzu hazırlayacak.
        </p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="card p-6 sm:p-8">
          <OrderForm onSuccess={setOrder} />
        </div>
      </div>
    </main>
  );
}

// ─── Başarı Ekranı ──────────────────────────────────────────────────────────

function SuccessScreen({ order, onNew }: { order: OrderCreated; onNew: () => void }) {
  return (
    <main className="min-h-screen bg-ad-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full card p-8 text-center">
        {/* İkon */}
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-5"
          style={{ background: "color-mix(in srgb, var(--ad-green) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--ad-green) 25%, transparent)" }}>
          ✅
        </div>

        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--ad-text)" }}>
          Siparişiniz Alındı!
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--ad-muted)" }}>
          Ekibimiz siparişinizi inceleyip en kısa sürede videonuzu hazırlayacak. Hazır olduğunda size ulaşacağız.
        </p>

        {/* Sipariş No */}
        <div className="rounded-xl px-4 py-3 mb-6 text-left"
          style={{ background: "var(--ad-surface-2)", border: "1px solid var(--ad-border)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--ad-subtle)" }}>Sipariş Numarası</p>
          <p className="text-xs font-mono break-all" style={{ color: "var(--ad-muted)" }}>{order.id}</p>
        </div>

        <button onClick={onNew} className="btn-primary w-full">
          Yeni Sipariş Ver
        </button>
      </div>
    </main>
  );
}
