"use client";

import { useState, useRef, useActionState } from "react";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { submitCheckin, type CheckinState } from "./actions";
import { HeartPulseIcon } from "@/components/ui/icons";

const initial: CheckinState = {};

type Step = "voice" | "quick" | "details";

export function CheckinClient({ nombre }: { nombre: string }) {
  const [state, formAction, pending] = useActionState(submitCheckin, initial);
  const [step, setStep] = useState<Step>("voice");
  const [transcript, setTranscript] = useState("");
  const [comidas, setComidas] = useState<number>(0);
  const [energia, setEnergia] = useState<number>(5);
  const [actividad, setActividad] = useState<number>(5);
  const formRef = useRef<HTMLFormElement>(null);

  const handleTranscript = (text: string) => {
    setTranscript(text);
    if (text) setStep("details");
  };

  return (
    <div className="flex flex-col min-h-screen px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <HeartPulseIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
          <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Preva</span>
        </div>
        <div className="flex gap-1.5">
          {(["voice", "details"] as const).map((s, i) => (
            <div key={s} className="h-1.5 rounded-full transition-all"
                 style={{
                   width: step === s ? "20px" : "8px",
                   background: step === s ? "var(--color-primary)" : "var(--color-primary-soft)",
                 }} />
          ))}
          <div className="h-1.5 w-2 rounded-full" style={{ background: "var(--color-primary-soft)" }} />
        </div>
      </div>

      {/* Voice step */}
      {step === "voice" && (
        <div className="flex flex-col flex-1">
          <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>
            Hola, Dr. {nombre}
          </p>
          <h1 className="text-3xl font-bold leading-tight mb-12"
              style={{ color: "var(--color-text)" }}>
            ¿Cómo estuvo tu día?
          </h1>

          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <VoiceRecorder onTranscript={handleTranscript} />
          </div>

          <div className="mt-auto pt-6 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => setStep("quick")}
              className="btn-ghost"
            >
              Prefiero responder rápido
            </button>
            {transcript && (
              <button
                type="button"
                onClick={() => setStep("details")}
                className="btn-primary"
              >
                Continuar →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick / Details step */}
      {(step === "quick" || step === "details") && (
        <div className="flex flex-col flex-1">
          <button
            type="button"
            onClick={() => setStep("voice")}
            className="flex items-center gap-1 text-sm mb-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Volver
          </button>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text)" }}>
            Un poco más de info
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            Esto ayuda a afinar el análisis.
          </p>

          <form ref={formRef} action={formAction} className="flex flex-col gap-6 flex-1">
            <input type="hidden" name="transcripcion" value={transcript} />

            {/* Comidas */}
            <div>
              <label className="block text-sm font-semibold mb-3"
                     style={{ color: "var(--color-text)" }}>
                ¿Cuántas comidas hiciste hoy?
              </label>
              <div className="flex gap-3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setComidas(n)}
                    className="flex-1 py-3 rounded-xl text-lg font-bold border-2 transition-all"
                    style={{
                      borderColor: comidas === n ? "var(--color-primary)" : "var(--color-border)",
                      background:  comidas === n ? "var(--color-primary-lt)" : "var(--color-bg-card)",
                      color:       comidas === n ? "var(--color-primary)" : "var(--color-text-muted)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <input type="hidden" name="comidas" value={comidas} />
            </div>

            {/* Energía */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  Nivel de energía percibido
                </label>
                <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                  {energia}/10
                </span>
              </div>
              <input
                type="range" name="energia" min={1} max={10}
                value={energia}
                onChange={(e) => setEnergia(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-subtle)" }}>
                <span>Sin energía</span>
                <span>Plena energía</span>
              </div>
            </div>

            {/* Actividad física */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  Actividad física
                </label>
                <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                  {actividad}/10
                </span>
              </div>
              <input
                type="range" name="actividad" min={1} max={10}
                value={actividad}
                onChange={(e) => setActividad(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: "var(--color-primary)" }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-subtle)" }}>
                <span>Ninguna</span>
                <span>Intensa</span>
              </div>
            </div>

            {state.error && (
              <p className="rounded-xl px-4 py-3 text-sm"
                 style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
                {state.error}
              </p>
            )}

            <div className="mt-auto pt-4">
              {transcript && (
                <div className="mb-4 rounded-xl p-3 text-sm"
                     style={{ background: "var(--color-primary-lt)", color: "var(--color-primary-mid)" }}>
                  <p className="font-semibold text-xs mb-1">Tu respuesta en voz:</p>
                  <p className="italic line-clamp-3">"{transcript}"</p>
                </div>
              )}
              <button type="submit" disabled={pending} className="btn-primary">
                {pending ? "Analizando tu día…" : "Analizar mi día →"}
              </button>
              <p className="text-center text-xs mt-3" style={{ color: "var(--color-text-subtle)" }}>
                + Generado por IA según tu estado y carga
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
