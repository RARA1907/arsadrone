/**
 * Supabase client — Next.js 16 App Router uyumlu
 *
 * Faz 1'de Supabase doğrudan frontend'den kullanılmıyor;
 * tüm işlemler FastAPI üzerinden.
 * Bu modül ileride auth eklendiğinde kullanılacak.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Build-time warning — runtime'da env eksikse app çalışmaz
  if (typeof window !== "undefined") {
    console.warn("[ArsaDrone] NEXT_PUBLIC_SUPABASE_URL veya NEXT_PUBLIC_SUPABASE_ANON_KEY eksik");
  }
}

/** Browser-side singleton client (anon key — RLS korumalı) */
export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
