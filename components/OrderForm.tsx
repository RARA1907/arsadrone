"use client";

import { FormEvent, useState } from "react";
import AvatarPicker from "./AvatarPicker";
import FileUpload from "./FileUpload";
import { api, ApiError, OrderCreated } from "@/lib/api";

const PROPERTY_TYPES = [
  { value: "arsa", label: "Arsa" },
  { value: "daire", label: "Daire" },
  { value: "villa", label: "Villa" },
  { value: "ticari", label: "Ticari" },
] as const;

const SCRIPT_MAX = 500;

interface OrderFormProps {
  onSuccess: (order: OrderCreated) => void;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    property_type: "arsa" as "arsa" | "daire" | "villa" | "ticari",
    script_text: "",
    avatar_id: null as string | null,
  });
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = (): string | null => {
    if (form.customer_name.trim().length < 2) return "Ad Soyad en az 2 karakter olmalı";
    if (!/^(05\d{9}|\+905\d{9})$/.test(form.customer_phone.replace(/\s+/g, "")))
      return "Geçerli bir Türkiye numarası girin (05XX XXX XX XX)";
    if (form.script_text.trim().length < 20) return "Tanıtım metni en az 20 karakter olmalı";
    if (form.script_text.trim().length > SCRIPT_MAX)
      return `Tanıtım metni en fazla ${SCRIPT_MAX} karakter olabilir`;
    if (!form.avatar_id) return "Lütfen bir avatar seçin";
    if (fileKeys.length === 0) return "En az bir dosya yüklenmeli";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validErr = validate();
    if (validErr) { setError(validErr); return; }

    setError(null);
    setSubmitting(true);
    try {
      const order = await api.orders.create({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.replace(/\s+/g, ""),
        property_type: form.property_type,
        script_text: form.script_text.trim(),
        avatar_id: form.avatar_id!,
        file_keys: fileKeys,
      });
      onSuccess(order);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Kişisel Bilgiler */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">İletişim Bilgileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Ahmet Yılmaz"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon <span className="text-red-500">*</span>
            </label>
            <input
              name="customer_phone"
              value={form.customer_phone}
              onChange={handleChange}
              placeholder="0532 123 45 67"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>
      </section>

      {/* Mülk Tipi */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mülk Tipi <span className="text-red-500">*</span>
        </label>
        <select
          name="property_type"
          value={form.property_type}
          onChange={handleChange}
          className="w-full sm:w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {PROPERTY_TYPES.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>
      </section>

      {/* Tanıtım Metni */}
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tanıtım Metni <span className="text-red-500">*</span>
        </label>
        <textarea
          name="script_text"
          value={form.script_text}
          onChange={handleChange}
          rows={5}
          maxLength={SCRIPT_MAX}
          placeholder="Avatar'ın seslendirecek tanıtım metnini yazın. Mülkün özelliklerini, konumunu ve avantajlarını belirtin..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {form.script_text.length} / {SCRIPT_MAX}
        </p>
      </section>

      {/* Dosya Yükleme */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Görseller & Belgeler</h2>
        <p className="text-sm text-gray-500 mb-3">
          Arsanın fotoğrafları, mimari render'lar veya proje planı PDF'ini yükleyin
        </p>
        <FileUpload onKeysChange={setFileKeys} />
      </section>

      {/* Avatar Seçimi */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Avatar Seç <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-500 mb-3">Tanıtım videosunda konuşacak avatar'ı seçin</p>
        <AvatarPicker value={form.avatar_id} onChange={(id) => setForm((p) => ({ ...p, avatar_id: id }))} />
      </section>

      {/* Hata */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Gönder */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
      >
        {submitting ? "Gönderiliyor..." : "Sipariş Ver"}
      </button>
    </form>
  );
}
