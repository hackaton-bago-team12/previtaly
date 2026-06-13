import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";
import { signOut } from "./actions";

export default async function DashboardPage() {
  // Sin Supabase configurado no hay forma de autenticar: volvemos al login.
  if (!hasEnvVars) {
    redirect("/login");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege esta ruta, pero reforzamos por las dudas.
  if (!user) {
    redirect("/login");
  }

  // Datos del perfil (tabla `profiles`, creada por el trigger en schema.sql).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, specialty")
    .eq("id", user.id)
    .maybeSingle();

  const nombre =
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Profesional";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
              <HeartPulseIcon className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              Previtaly
            </span>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Hola, {nombre} 👋
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Estás autenticado con Supabase. Este es tu panel de inicio.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Sesión activa"
            value={user.email ?? "—"}
            hint="Autenticación real vía Supabase"
          />
          <Card
            title="Especialidad"
            value={profile?.specialty || "Sin definir"}
            hint="Editá tu perfil en la tabla profiles"
          />
          <Card
            title="ID de usuario"
            value={`${user.id.slice(0, 8)}…`}
            hint="UUID generado por Supabase Auth"
          />
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          🚀 Base lista. Empezá a construir tus pantallas (agenda, perfil,
          estadísticas, asistente) creando rutas dentro de{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-xs dark:bg-zinc-800">
            app/dashboard/
          </code>
          .
        </div>
      </main>
    </div>
  );
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {title}
      </p>
      <p className="mt-2 truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-400">{hint}</p>
    </div>
  );
}

function HeartPulseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12h3l2-5 3 9 2-4h5"
      />
    </svg>
  );
}
