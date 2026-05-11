"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, OrderDetail, ApiError } from "@/lib/api";
import PipelineStatus from "@/components/PipelineStatus";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  bekliyor: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  inceleniyor: { label: "İnceleniyor", color: "bg-blue-100 text-blue-800" },
  reddedildi: { label: "Reddedildi", color: "bg-red-100 text-red-800" },
  uretiliyor: { label: "Üretiliyor", color: "bg-purple-100 text-purple-800" },
  kalite_kontrol: { label: "Kalite Kontrol", color: "bg-orange-100 text-orange-800" },
  teslim_edildi: { label: "Teslim Edildi", color: "bg-green-100 text-green-800" },
  hata: { label: "Hata", color: "bg-red-100 text-red-900" },
};

interface Props {
  orderId: string;
}

export default function OrderDetailClient({ orderId }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchOrder = () => {
    setLoading(true);
    api.orders
      .get(orderId)
      .then(setOrder)
      .catch((e) => setError(e instanceof ApiError ? e.message : "Sipariş yüklenemedi"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [orderId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.orders.approve(orderId);
      setActionMsg("Sipariş onaylandı, video üretimi başlatıldı");
      fetchOrder();
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : "İşlem başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.orders.reject(orderId, rejectReason.trim());
      setActionMsg("Sipariş reddedildi");
      setShowRejectForm(false);
      fetchOrder();
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : "İşlem başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveVideo = async () => {
    setActionLoading(true);
    try {
      const result = await api.orders.approveVideo(orderId);
      // result tipini any olarak cast — tam tip sonraki iterasyonda
      const r = result as Record<string, unknown>;
      const link = r.share_link as { url: string } | undefined;
      setActionMsg(`Video onaylandı! Link: ${link?.url ?? ""}`);
      fetchOrder();
    } catch (e) {
      setActionMsg(e instanceof ApiError ? e.message : "İşlem başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error ?? "Sipariş bulunamadı"}</div>
      </div>
    );
  }

  const statusInfo = STATUS_LABEL[order.status] ?? {
    label: order.status,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/panel" className="text-gray-400 hover:text-gray-600 text-lg">
            ←
          </Link>
          <span className="font-semibold text-gray-900">Sipariş Detayı</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Durum + Aksiyonlar */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Durum</p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {order.status === "bekliyor" && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Üretimi Başlat
                  </button>
                  <button
                    onClick={() => setShowRejectForm(!showRejectForm)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Reddet
                  </button>
                </>
              )}
              {order.status === "kalite_kontrol" && (
                <button
                  onClick={handleApproveVideo}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Videoyu Onayla & Teslim Et
                </button>
              )}
            </div>
          </div>

          {/* Reddetme formu */}
          {showRejectForm && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ret Nedeni</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                placeholder="Müşteriye iletilecek ret nedenini yazın..."
              />
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading}
                className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Onayla & Reddet
              </button>
            </div>
          )}

          {/* İşlem mesajı */}
          {actionMsg && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
              {actionMsg}
            </div>
          )}
        </div>

        {/* Müşteri Bilgileri */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Müşteri
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Ad Soyad</p>
              <p className="font-medium text-gray-900">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Telefon</p>
              <p className="font-medium text-gray-900">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Mülk Tipi</p>
              <p className="font-medium text-gray-900 capitalize">{order.property_type}</p>
            </div>
            <div>
              <p className="text-gray-500">Sipariş Tarihi</p>
              <p className="font-medium text-gray-900">
                {new Date(order.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
        </section>

        {/* Tanıtım Metni */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tanıtım Metni
          </h2>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {order.script_text}
          </p>
        </section>

        {/* Avatar */}
        {order.avatar && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Avatar
            </h2>
            <div className="flex items-center gap-3">
              {order.avatar.preview_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.avatar.preview_url}
                  alt={order.avatar.name}
                  className="w-12 h-16 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{order.avatar.name}</p>
                <p className="text-sm text-gray-500">
                  {order.avatar.gender} · {order.avatar.style}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Dosyalar */}
        {order.files.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Yüklenen Dosyalar ({order.files.length})
            </h2>
            <ul className="space-y-2">
              {order.files.map((f) => {
                const file = f as Record<string, unknown>;
                return (
                  <li key={file.id as string} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📄</span>
                    <span className="text-gray-700">{file.file_name as string}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Job durumu — Pipeline */}
        {order.job && ["uretiliyor", "tts", "avatar", "drone", "birlestirme", "muzik", "render", "tamamlandi", "hata"].includes(
          (order.job as Record<string, unknown>).status as string,
        ) && (
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Video Üretim Durumu
            </h2>
            <PipelineStatus
              jobId={(order.job as Record<string, unknown>).id as string}
              onComplete={fetchOrder}
            />
            {/* Retry butonu — hata durumunda */}
            {(order.job as Record<string, unknown>).status === "hata" && (
              <button
                onClick={async () => {
                  try {
                    await api.jobs.retry((order.job as Record<string, unknown>).id as string);
                    setActionMsg("Job yeniden başlatıldı");
                    fetchOrder();
                  } catch (e) {
                    setActionMsg(e instanceof ApiError ? e.message : "Retry başarısız");
                  }
                }}
                className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Yeniden Dene
              </button>
            )}
          </section>
        )}

        {/* Paylaşım Linki */}
        {order.share_link && (
          <section className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-2">
              Müşteri Linki
            </h2>
            <a
              href={order.share_link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-green-700 hover:text-green-900 underline break-all"
            >
              {order.share_link.url}
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
