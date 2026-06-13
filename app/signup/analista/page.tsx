"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signupAnalista, type SignupState } from "../actions";
import { HeartPulseIcon, CreditCardIcon, CheckCircleIcon, ShieldCheckIcon } from "@/components/ui/icons";

type Plan = "basico" | "avanzado";
type Step = "plan" | "datos" | "pago" | "exito";

const PLANES = {
  basico: {
    nombre: "Básico",
    precio: "$4.990",
    periodo: "/mes",
    descripcion: "Para clínicas pequeñas que dan sus primeros pasos.",
    features: [
      "Hasta 10 médicos",
      "Check-in diario con IA",
      "Análisis de bienestar básico",
      "Historial de 30 días",
      "Soporte por email",
    ],
    color: "var(--color-primary-soft)",
    colorText: "var(--color-primary)",
  },
  avanzado: {
    nombre: "Avanzado",
    precio: "$9.990",
    periodo: "/mes",
    descripcion: "Para instituciones con equipos médicos grandes.",
    features: [
      "Médicos ilimitados",
      "Check-in con audio IA (Azure Speech)",
      "Análisis predictivo de burnout",
      "Historial ilimitado + exportación",
      "Dashboard analista completo",
      "Soporte prioritario 24/7",
    ],
    color: "var(--color-primary)",
    colorText: "#fff",
    destacado: true,
  },
} as const;

export default function SignupAnalistaPage() {
  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<Plan>("avanzado");
  const [formData, setFormData] = useState({
    fullName: "", clinicName: "", email: "", password: "",
  });
  const [cardData, setCardData] = useState({
    numero: "", titular: "", vencimiento: "", cvv: "",
  });
  const [clinicCode, setClinicCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Paso 1: Selección de plan ──────────────────────────────────────
  if (step === "plan") {
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
                Elegí tu plan
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
                Podés cambiarlo en cualquier momento
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(["basico", "avanzado"] as Plan[]).map((p) => {
              const info = PLANES[p];
              const selected = plan === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className="w-full text-left rounded-2xl p-5 border-2 transition-all"
                  style={{
                    borderColor: selected ? "var(--color-primary)" : "var(--color-border)",
                    background: selected ? "var(--color-primary-light)" : "var(--color-bg-card)",
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: "var(--color-text)" }}>
                          {info.nombre}
                        </span>
                        {"destacado" in info && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ background: "var(--color-primary)" }}>
                            POPULAR
                          </span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {info.descripcion}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
                        {info.precio}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                        {info.periodo}
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1 mt-3">
                    {info.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs"
                          style={{ color: "var(--color-text-muted)" }}>
                        <span style={{ color: "var(--color-risk-low)" }}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep("datos")}
            className="btn-primary mt-6"
          >
            Continuar con plan {PLANES[plan].nombre} →
          </button>

          <p className="mt-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/signup" className="underline underline-offset-2"
                  style={{ color: "var(--color-primary)" }}>
              ← Volver
            </Link>
          </p>
        </div>
      </main>
    );
  }

  // ── Paso 2: Datos de la cuenta ─────────────────────────────────────
  if (step === "datos") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
            style={{ background: "var(--color-bg)" }}>
        <div className="w-full max-w-sm">
          <StepIndicator current={2} total={3} />
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Datos de tu clínica
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Plan <strong>{PLANES[plan].nombre}</strong> · {PLANES[plan].precio}{PLANES[plan].periodo}
            </p>
          </div>

          <div className="card space-y-4" style={{ borderColor: "var(--color-border)" }}>
            <Field label="Nombre completo" name="fullName" type="text"
                   placeholder="Lic. García" value={formData.fullName}
                   onChange={(v) => setFormData((p) => ({ ...p, fullName: v }))} />
            <Field label="Nombre de la clínica" name="clinicName" type="text"
                   placeholder="Clínica Central Bago" value={formData.clinicName}
                   onChange={(v) => setFormData((p) => ({ ...p, clinicName: v }))} />
            <Field label="Email institucional" name="email" type="email"
                   placeholder="analista@clinica.com" value={formData.email}
                   onChange={(v) => setFormData((p) => ({ ...p, email: v }))} />
            <Field label="Contraseña" name="password" type="password"
                   placeholder="Mínimo 6 caracteres" value={formData.password}
                   onChange={(v) => setFormData((p) => ({ ...p, password: v }))} />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!formData.fullName || !formData.clinicName || !formData.email || !formData.password)
                return setError("Completá todos los campos.");
              if (formData.password.length < 6)
                return setError("La contraseña debe tener al menos 6 caracteres.");
              setError(null);
              setStep("pago");
            }}
            className="btn-primary mt-4"
          >
            Continuar al pago →
          </button>

          {error && (
            <p className="rounded-xl px-4 py-3 text-sm mt-3"
               style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {error}
            </p>
          )}

          <p className="mt-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            <button type="button" onClick={() => setStep("plan")}
                    className="underline underline-offset-2"
                    style={{ color: "var(--color-primary)" }}>
              ← Cambiar plan
            </button>
          </p>
        </div>
      </main>
    );
  }

  // ── Paso 3: Pago con tarjeta ───────────────────────────────────────
  if (step === "pago") {
    const handlePagar = () => {
      if (!cardData.numero || !cardData.titular || !cardData.vencimiento || !cardData.cvv)
        return setError("Completá todos los datos de la tarjeta.");
      if (cardData.numero.replace(/\s/g, "").length < 16)
        return setError("El número de tarjeta debe tener 16 dígitos.");
      if (cardData.cvv.length < 3)
        return setError("El CVV debe tener 3 o 4 dígitos.");

      setError(null);
      const fd = new FormData();
      fd.set("fullName", formData.fullName);
      fd.set("clinicName", formData.clinicName);
      fd.set("email", formData.email);
      fd.set("password", formData.password);

      startTransition(async () => {
        const result: SignupState = await signupAnalista({}, fd);
        if (result.error) {
          setError(result.error);
        } else if (result.clinicCode) {
          setClinicCode(result.clinicCode);
          setStep("exito");
        }
      });
    };

    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
            style={{ background: "var(--color-bg)" }}>
        <div className="w-full max-w-sm">
          <StepIndicator current={3} total={3} />
          <div className="mb-6 text-center">
            <CreditCardIcon className="h-8 w-8 mx-auto mb-3"
                            style={{ color: "var(--color-primary)" } as React.CSSProperties} />
            <h1 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              Datos de pago
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Plan {PLANES[plan].nombre} · <strong>{PLANES[plan].precio}</strong>{PLANES[plan].periodo}
            </p>
          </div>

          {/* Resumen */}
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
               style={{ background: "var(--color-primary-light)" }}>
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--color-primary)" }}>
                {formData.clinicName || "Tu clínica"}
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Plan {PLANES[plan].nombre}
              </p>
            </div>
            <p className="font-bold" style={{ color: "var(--color-primary)" }}>
              {PLANES[plan].precio}<span className="text-xs font-normal">{PLANES[plan].periodo}</span>
            </p>
          </div>

          <div className="card space-y-4">
            {/* Número de tarjeta */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                Número de tarjeta
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="input"
                value={cardData.numero}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = raw.replace(/(.{4})/g, "$1 ").trim();
                  setCardData((p) => ({ ...p, numero: formatted }));
                }}
              />
            </label>

            {/* Titular */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                Nombre del titular
              </span>
              <input
                type="text"
                placeholder="JUAN GARCIA"
                className="input"
                value={cardData.titular}
                onChange={(e) => setCardData((p) => ({ ...p, titular: e.target.value.toUpperCase() }))}
              />
            </label>

            {/* Vencimiento y CVV */}
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                  Vencimiento
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  maxLength={5}
                  className="input"
                  value={cardData.vencimiento}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const formatted = raw.length > 2 ? raw.slice(0, 2) + "/" + raw.slice(2) : raw;
                    setCardData((p) => ({ ...p, vencimiento: formatted }));
                  }}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                  CVV
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  className="input"
                  value={cardData.cvv}
                  onChange={(e) => setCardData((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                />
              </label>
            </div>

            {/* Aceptar tarjetas */}
            <div className="flex items-center gap-2 pt-1">
              {["VISA", "MC", "AMEX", "Naranja"].map((c) => (
                <span key={c} className="text-[10px] font-bold px-2 py-1 rounded border"
                      style={{ color: "var(--color-text-subtle)", borderColor: "var(--color-border)" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-xl px-4 py-3 text-sm mt-3"
               style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handlePagar}
            disabled={isPending}
            className="btn-primary mt-4"
          >
            {isPending ? "Procesando pago…" : `Pagar ${PLANES[plan].precio} y crear cuenta`}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-3">
            <ShieldCheckIcon className="h-4 w-4" style={{ color: "var(--color-text-subtle)" } as React.CSSProperties} />
            <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
              Pago simulado — sin cobro real
            </span>
          </div>

          <p className="mt-4 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            <button type="button" onClick={() => setStep("datos")}
                    className="underline underline-offset-2"
                    style={{ color: "var(--color-primary)" }}>
              ← Volver a datos
            </button>
          </p>
        </div>
      </main>
    );
  }

  // ── Paso 4: Éxito ─────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
          style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        <div className="card text-center">
          <CheckCircleIcon
            className="h-14 w-14 mx-auto mb-4"
            style={{ color: "var(--color-risk-low)" } as React.CSSProperties}
          />
          <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
            ¡Bienvenida a Previtaly!
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Tu suscripción al plan <strong>{PLANES[plan].nombre}</strong> fue procesada con éxito.
            Compartí este código con tus médicos:
          </p>
          <div className="my-5 rounded-xl py-4 px-6 text-center text-2xl font-bold tracking-widest"
               style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            {clinicCode}
          </div>
          <p className="mb-6 text-xs" style={{ color: "var(--color-text-subtle)" }}>
            Guardá este código. Lo vas a necesitar para incorporar médicos.
          </p>
          <Link href="/login" className="btn-primary">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

// ── Componentes auxiliares ───────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: n <= current ? "var(--color-primary)" : "var(--color-border)",
              color: n <= current ? "#fff" : "var(--color-text-subtle)",
            }}
          >
            {n < current ? "✓" : n}
          </div>
          {n < total && (
            <div className="w-8 h-0.5 rounded"
                 style={{ background: n < current ? "var(--color-primary)" : "var(--color-border)" }} />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...props
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <input
        {...props}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </label>
  );
}
