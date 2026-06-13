"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthState } from "../login/actions";
import { hasEnvVars } from "@/lib/utils";
import { SetupNotice } from "@/components/setup-notice";

const initialState: AuthState = {};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
            <HeartPulseIcon className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Creá tu cuenta
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Empezá a usar Previtaly
          </p>
        </div>

        {!hasEnvVars && <SetupNotice />}

        {state.message ? (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300">
            {state.message}
            <div className="mt-4">
              <Link
                href="/login"
                className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
              >
                Ir a iniciar sesión →
              </Link>
            </div>
          </div>
        ) : (
          <form
            action={formAction}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <Field
              label="Nombre completo"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Dra. García"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="medico@previtaly.com"
              required
            />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
            />

            {state.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </span>
      <input
        {...props}
        className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </label>
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
