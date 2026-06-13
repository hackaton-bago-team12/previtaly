"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { login, type AuthState } from "./actions";
import { hasEnvVars } from "@/lib/utils";
import { SetupNotice } from "@/components/setup-notice";
import { HeartPulseIcon, CheckIcon } from "@/components/ui/icons";
import { GoogleButton } from "@/components/auth/GoogleButton";

const initialState: AuthState = {};

function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const params = useSearchParams();
  const registered = params.get("registered") === "1";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
          style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
               style={{ background: "var(--color-primary)" }}>
            <HeartPulseIcon className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Previtaly
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Iniciá sesión en tu cuenta
            </p>
          </div>
        </div>

        {!hasEnvVars && <SetupNotice />}

        {registered && (
          <div className="mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
               style={{ background: "var(--color-primary-lt)", color: "var(--color-primary)" }}>
            <CheckIcon className="h-4 w-4 mt-0.5 shrink-0" />
            <span>Cuenta creada. Revisá tu email para confirmarla, luego iniciá sesión.</span>
          </div>
        )}

        <GoogleButton />

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "var(--color-border)" }} />
          <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>o con tu email</span>
          <span className="h-px flex-1" style={{ background: "var(--color-border)" }} />
        </div>

        <form action={formAction} className="card space-y-4" style={{ borderColor: "var(--color-border)" }}>
          <Field label="Email" name="email" type="email"
                 autoComplete="email" placeholder="tu@email.com" required />
          <Field label="Contraseña" name="password" type="password"
                 autoComplete="current-password" placeholder="••••••••" required />

          {state.error && (
            <p className="rounded-xl px-4 py-3 text-sm"
               style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium underline underline-offset-2"
                style={{ color: "var(--color-primary)" }}>
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <input {...props} className="input" />
    </label>
  );
}
