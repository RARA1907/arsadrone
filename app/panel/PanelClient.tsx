"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { api, OrderSummary } from "@/lib/api";
import OrderCard from "@/components/OrderCard";

const STATUS_TABS = [
  { value: undefined,          label: "Tümü"          },
  { value: "bekliyor",         label: "Bekliyor"       },
  { value: "uretiliyor",       label: "Üretiliyor"     },
  { value: "kalite_kontrol",   label: "Kalite Kontrol" },
  { value: "teslim_edildi",    label: "Teslim"         },
  { value: "reddedildi",       label: "Reddedildi"     },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

export default function PanelClient() {
  const router = useRouter();
  const [orders, setOrders]     = useState<OrderSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/panel/login");
    });
  }, [router]);

  useEffect(() => {
    setLoading(true);
    api.orders
      .list({ status: activeTab ?? undefined, limit: 50 })
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/panel/login");
  };

  return (
    <div className="min-h-screen bg-ad-bg">

      {/* Navbar */}
      <header className="sticky top-0 z-10"
        style={{ background: "var(--ad-surface)", borderBottom: "1px solid var(--ad-border)" }}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="ArsaDrone" width={120} height={29} priority />
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--ad-surface-2)", color: "var(--ad-muted)", border: "1px solid var(--ad-border)" }}>
              Ajans Paneli
            </span>
          </div>
          <button onClick={handleLogout} className="text-sm transition-colors"
            style={{ color: "var(--ad-subtle)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--ad-muted)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--ad-subtle)")}>
            Çıkış →
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">

        {/* Başlık */}
        <div className="mb-5">
          <h1 className="text-xl font-bold" style={{ color: "var(--ad-text)" }}>Siparişler</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--ad-muted)" }}>
            {loading ? "Yükleniyor..." : `${orders.length} sipariş`}
          </p>
        </div>

        {/* Durum sekmeleri */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {STATUS_TABS.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.value)}
                className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
                style={active
                  ? { background: "var(--ad-orange)", color: "#fff" }
                  : { background: "var(--ad-surface)", color: "var(--ad-muted)", border: "1px solid var(--ad-border)" }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse"
                style={{ background: "var(--ad-surface)" }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-40">📭</div>
            <p className="text-sm" style={{ color: "var(--ad-subtle)" }}>Bu durumda sipariş yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
