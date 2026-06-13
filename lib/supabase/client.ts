import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para usar en componentes del lado del navegador
 * (componentes "use client").
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
