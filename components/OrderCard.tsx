"use client";

import Link from "next/link";
import { OrderSummary } from "@/lib/api";

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  bekliyor:       { label: "Bekliyor",       badge: "badge-yellow" },
  inceleniyor:    { label: "İnceleniyor",    badge: "badge-blue"   },
  reddedildi:     { label: "Reddedildi",     badge: "badge-red"    },
  uretiliyor:     { label: "Üretiliyor",     badge: "badge-blue"   },
  kalite_kontrol: { label: "Kalite Kontrol", badge: "badge-orange" },
  teslim_edildi:  { label: "Teslim Edildi",  badge: "badge-green"  },
  hata:           { label: "Hata",           badge: "badge-red"    },
};

const PROPERTY_LABEL: Record<string, string> = {
  arsa:    "Arsa",
  daire:   "Daire",
  villa:   "Villa",
  ticari:  "Ticari",
};

interface OrderCardProps {
  order: OrderSummary;
}

export default function OrderCard({ order }: OrderCardProps) {
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, badge: "badge-gray" };

  const date = new Date(order.created_at).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Link
      href={`/panel/${order.id}`}
      className="block card card-hover transition-all p-4 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold truncate" style={{ color: "var(--ad-text)" }}>
            {order.customer_name}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--ad-muted)" }}>
            {PROPERTY_LABEL[order.property_type] ?? order.property_type}
            {order.avatar_name ? ` · ${order.avatar_name}` : ""}
          </p>
        </div>
        <span className={`badge shrink-0 ${cfg.badge}`}>{cfg.label}</span>
      </div>
      <p className="text-xs mt-3" style={{ color: "var(--ad-subtle)" }}>{date}</p>
    </Link>
  );
}
