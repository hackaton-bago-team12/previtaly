"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAnalista, type SignupState } from "../actions";
import { HeartPulseIcon } from "@/components/ui/icons";

const initial: SignupState = {};

export default function SignupAnalistaPage() {
  const [state, formAction, pending] = useActionState(signupAnalista, initial);

  if (state.clinicCode) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
            style={{ background: "var(--color-bg)" }}>
        <div className="w-full max-w-sm">
          <div className="card text-center" style={{ borderColor: "var(--color-primary-soft)" }}>
            <div className="mb-4 text-4xl">🎉</div>
            <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              ¡Clínica creada!
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Compartí este código con tus médicos para que se registren:
            </p>
            <div className="my-5 rounded-xl py-4 px-6 text-center text-2xl font-bold tracking-widest"
                 style={{ background: "var(--color-primary-lt)", color: "var(--color-primary)" }}>
              {state.clinicCode}
            </div>
            <p className="mb-6 text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Guardá este código. Lo vas a necesitar para incorporar médicos a tu clínica.
            </p>
            <Link href="/login" className="btn-primary">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
          style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
               style={{ background: "var(--color-primary)" }}>
            <HeartPulseIcon className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Crear cuenta de analista
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Tu clínica recibirá un código único
            </p>
          </div>
        </div>

        <form action={formAction} className="card space-y-4" style={{ borderColor: "var(--color-border)" }}>
          <Field label="Nombre completo" name="fullName" type="text"
                 placeholder="Lic. García" autoComplete="name" />
          <Field label="Nombre de la clínica" name="clinicName" type="text"
                 placeholder="Clínica Central Bago" />
          <Field label="Email institucional" name="email" type="email"
                 placeholder="analista@clinica.com" autoComplete="email" />
          <Field label="Contraseña" name="password" type="password"
                 placeholder="Mínimo 6 caracteres" autoComplete="new-password" />

          {state.error && (
            <p className="rounded-xl px-4 py-3 text-sm"
               style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Creando clínica…" : "Crear cuenta y clínica"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/signup" className="underline underline-offset-2"
                style={{ color: "var(--color-primary)" }}>
            ← Volver
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
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <input {...props} className="input" />
    </label>
  );
}
