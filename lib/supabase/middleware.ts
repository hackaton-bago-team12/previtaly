import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "@/lib/utils";

export async function updateSession(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Rutas protegidas
  const isMedicoRoute   = pathname.startsWith("/medico");
  const isAnalistaRoute = pathname.startsWith("/analista");
  const isProtected     = isMedicoRoute || isAnalistaRoute;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si hay sesión y el usuario intenta acceder a una ruta del rol incorrecto
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "medico";

    if (isAnalistaRoute && role !== "analista") {
      const url = request.nextUrl.clone();
      url.pathname = "/medico";
      return NextResponse.redirect(url);
    }
    if (isMedicoRoute && role === "analista") {
      const url = request.nextUrl.clone();
      url.pathname = "/analista";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
