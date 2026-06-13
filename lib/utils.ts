/**
 * Indica si las variables de entorno de Supabase están configuradas.
 * Permite que la app arranque y muestre un aviso de configuración en lugar
 * de romper cuando todavía no cargaste tus credenciales en `.env.local`.
 */
export const hasEnvVars =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
