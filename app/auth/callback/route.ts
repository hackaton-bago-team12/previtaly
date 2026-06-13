import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback del login OAuth (Google). Supabase redirige acá con ?code=...
 * Intercambiamos el código por una sesión y mandamos al usuario a su panel.
 *
 * En Supabase → Authentication → URL Configuration agregá a "Redirect URLs":
 *   http://localhost:3000/auth/callback
 *   https://previtaly-web-dgqyt3.azurewebsites.net/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Detrás del proxy de App Service, usamos el host público reenviado.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal ? origin : forwardedHost ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // "/" decide a qué panel ir según el rol del perfil.
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/login?error=oauth`);
}
