"use client";

import { useEffect, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const R2_PUBLIC = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

interface ShareLinkData {
  id: string;
  r2_key: string;
  video_url: string;
  expires_at: string;
  view_count: number;
  order_id: string;
}

interface Props {
  linkId: string;
}

export default function ShareClient({ linkId }: Props) {
  const [link, setLink] = useState<ShareLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/share/${linkId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Link bulunamadı veya süresi dolmuş" : "Bir hata oluştu");
        return res.json();
      })
      .then(setLink)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [linkId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Video yükleniyor...</div>
      </main>
    );
  }

  if (error || !link) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">Video Bulunamadı</h2>
          <p className="text-gray-400">{error ?? "Bu link artık geçerli değil"}</p>
        </div>
      </main>
    );
  }

  const expires = new Date(link.expires_at);
  const isExpired = expires < new Date();
  const videoUrl = link.video_url || `${R2_PUBLIC}/${link.r2_key}`;

  if (isExpired) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h2 className="text-xl font-bold text-white mb-2">Link Süresi Doldu</h2>
          <p className="text-gray-400">
            Bu video linki {expires.toLocaleDateString("tr-TR")} tarihinde sona erdi.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏡</span>
            <span className="font-bold text-white">ArsaDrone</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            {copied ? "✓ Kopyalandı!" : "🔗 Linki Kopyala"}
          </button>
        </div>
      </header>

      {/* Video */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <VideoPlayer src={videoUrl} className="mb-4" />

        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
          <span>
            {link.view_count} izlenme
          </span>
          <span>
            Geçerlilik: {expires.toLocaleDateString("tr-TR")}
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-600 text-xs">
        <p>ArsaDrone — Profesyonel Emlak Tanıtım Videosu</p>
        <p>
          <a href="https://arsadrone.raraprojects.com" className="hover:text-gray-400 transition-colors">
            arsadrone.raraprojects.com
          </a>
        </p>
      </footer>
    </main>
  );
}
