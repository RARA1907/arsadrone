import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ad-bg flex flex-col items-center justify-center px-4 text-center">

      {/* Logo */}
      <div className="mb-8">
        <Image src="/logo.svg" alt="ArsaDrone" width={180} height={44} priority />
      </div>

      {/* Başlık */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 max-w-lg" style={{ color: "var(--ad-text)" }}>
        Emlak tanıtım videonuz<br />
        <span style={{ color: "var(--ad-orange)" }}>AI ile saniyeler içinde</span> hazır.
      </h1>

      <p className="text-base mb-10 max-w-md" style={{ color: "var(--ad-muted)" }}>
        Fotoğrafınızı yükleyin, avatarınızı seçin — drone efektli profesyonel tanıtım videosunu biz üretelim.
      </p>

      {/* CTA'lar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/siparis" className="btn-primary px-8 py-3 text-base">
          Sipariş Ver →
        </Link>
        <Link href="/panel/login"
          className="btn-ghost px-8 py-3 text-base">
          Ajans Girişi
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs" style={{ color: "var(--ad-subtle)" }}>
        © 2026 raraprojects · ArsaDrone
      </p>

    </main>
  );
}
