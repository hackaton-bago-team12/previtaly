/**
 * Aviso que se muestra mientras no estén configuradas las variables de
 * entorno de Supabase. Se oculta automáticamente una vez que cargás
 * `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
 */
export function SetupNotice() {
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
      <p className="font-medium">Falta conectar Supabase</p>
      <p className="mt-1 text-amber-700/90 dark:text-amber-400/90">
        Copiá tu URL y publishable key en{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/60">
          .env.local
        </code>{" "}
        y reiniciá el servidor. Mirá el{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/60">
          README.md
        </code>
        .
      </p>
    </div>
  );
}
