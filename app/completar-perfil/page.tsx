"use client";

import { useActionState } from "react";
import { completarPerfil, type CompletarPerfilState } from "./actions";
import { HeartPulseIcon } from "@/components/ui/icons";

const initial: CompletarPerfilState = {};

export default function CompletarPerfilPage() {
  const [state, formAction, pending] = useActionState(completarPerfil, initial);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: "var(--color-primary)" }}
          >
            <HeartPulseIcon className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Un último paso
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Ingresa el código de tu clínica para continuar
            </p>
          </div>
        </div>

        <form action={formAction} className="card space-y-4" style={{ borderColor: "var(--color-border)" }}>
          <div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                Código de clínica
              </span>
              <input
                name="clinicCode"
                type="text"
                placeholder="ej. BAGO-4721"
                className="input font-mono tracking-wider"
                style={{ textTransform: "uppercase" }}
                autoFocus
              />
            </label>
            <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Tu analista tiene este código. Pídelo si no lo tienes.
            </p>
          </div>

          {state.error && (
            <p
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}
            >
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Verificando…" : "Unirme a mi clínica →"}
          </button>
        </form>
      </div>
    </main>
  );
}
