import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sayfa Bulunamadı</h2>
        <p className="text-gray-500 mb-6 text-sm">
          Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors inline-block"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </main>
  );
}
