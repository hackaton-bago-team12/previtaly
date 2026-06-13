"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupMedico, type SignupState } from "../actions";
import { HeartPulseIcon } from "@/components/ui/icons";

const initial: SignupState = {};

const ESPECIALIDADES = [
  "Medicina General",
  "Cardiología",
  "Cirugía General",
  "Pediatría",
  "Ginecología",
  "Neurología",
  "Traumatología",
  "Oncología",
  "Psiquiatría",
  "Dermatología",
  "Otra",
];

export default function SignupMedicoPage() {
  const [state, formAction, pending] = useActionState(signupMedico, initial);

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
              Crear cuenta de médico
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Necesitás el código de tu clínica
            </p>
          </div>
        </div>

        <form action={formAction} className="card space-y-4" style={{ borderColor: "var(--color-border)" }}>
          <Field label="Nombre completo" name="fullName" type="text"
                 placeholder="Dr. Martín García" autoComplete="name" />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              Especialidad
            </span>
            <select name="specialty" className="input" style={{ color: "var(--color-text)" }}>
              <option value="">Seleccioná tu especialidad</option>
              {ESPECIALIDADES.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>

          <Field label="Email" name="email" type="email"
                 placeholder="dr.garcia@clinica.com" autoComplete="email" />
          <Field label="Contraseña" name="password" type="password"
                 placeholder="Mínimo 6 caracteres" autoComplete="new-password" />

          {/* Clinic code with visual callout */}
          <div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                Código de clínica
              </span>
              <input name="clinicCode" type="text" placeholder="ej. BAGO-4721"
                     className="input font-mono tracking-wider"
                     style={{ textTransform: "uppercase" }} />
            </label>
            <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Tu analista tiene este código. Pedíselo si no lo tenés.
            </p>
          </div>

          {state.error && (
            <p className="rounded-xl px-4 py-3 text-sm"
               style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Registrando…" : "Crear cuenta"}
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
