/**
 * Supabase client — Next.js 16 App Router + @supabase/ssr
 *
 * createBrowserClient: cookie-based session → middleware ile uyumlu
 * createClient (eski): localStorage-based → middleware cookie göremez
 */
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Browser-side singleton — cookie'ye yazar, middleware okuyabilir */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnon);
