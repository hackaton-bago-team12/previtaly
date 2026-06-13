"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { submitCheckin, type CheckinState } from "./actions";
import { BackButton } from "@/components/ui/BackButton";
import { AnalyzingOverlay } from "@/components/ui/AnalyzingOverlay";

const initial: CheckinState = {};

export function CheckinClient() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitCheckin, initial);
  const [step, setStep] = useState<"voice" | "details">("voice");
  const [transcript, setTranscript] = useState("");
  const [comidas, setComidas] = useState(2);
  const [energia, setEnergia] = useState(6);
  const [actividad, setActividad] = useState(4);

  const goBack = () => (step === "details" ? setStep("voice") : router.push("/medico"));

  return (
    <div style={{ minHeight: "100%", animation: "screenIn .35s ease" }}>
      <BackButton onClick={goBack} />
      {pending && <AnalyzingOverlay />}

      {/* ───── VOZ ───── */}
      {step === "voice" && (
        <div style={{ padding: "78px 22px 24px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div style={eyebrow}>Análisis del día</div>
            <h1 style={{ margin: "10px 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>¿Cómo estuvo tu día?</h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
              Cuéntame en ~20 segundos. Yo lo convierto en tu Índice de Pulso.
            </p>
          </div>

          <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "14px 0" }}>
            <VoiceRecorder onTranscript={setTranscript} disabled={pending} />
            {transcript && (
              <div style={{ width: "100%", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "16px 18px" }}>
                <div style={transLabel}>Transcripción</div>
                <div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-text)" }}>{transcript}</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: "auto" }}>
            {transcript && (
              <button type="button" onClick={() => setStep("details")} style={primaryBtn}>
                Continuar <Arrow />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ───── DETALLES ───── */}
      {step === "details" && (
        <form action={formAction} style={{ padding: "78px 22px 24px" }}>
          <input type="hidden" name="transcripcion" value={transcript} />
          <input type="hidden" name="modo" value="completo" />
          <input type="hidden" name="comidas" value={comidas} />
          <input type="hidden" name="energia" value={energia} />
          <input type="hidden" name="actividad" value={actividad} />

          <div style={eyebrow}>Casi listo</div>
          <h1 style={{ margin: "8px 0 18px", fontSize: 23, fontWeight: 700, letterSpacing: "-.02em" }}>Unos datos del día</h1>

          <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "18px 18px 6px", marginBottom: 14 }}>
            {/* Comidas */}
            <div className="flex items-center justify-between" style={{ paddingBottom: 16, borderBottom: "1px solid #eef4f1" }}>
              <div className="flex items-center" style={{ gap: 11 }}>
                <span className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3v7a2 2 0 0 0 4 0V3M9 10v11" /><path d="M16 3c-1.5 0-2.5 2-2.5 5 0 2 1 3 2.5 3v10" /></svg>
                </span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Comidas</span>
              </div>
              <div className="flex items-center" style={{ gap: 14 }}>
                <button type="button" onClick={() => setComidas((c) => Math.max(1, c - 1))} style={stepBtn}>−</button>
                <span style={{ fontSize: 19, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{comidas}</span>
                <button type="button" onClick={() => setComidas((c) => Math.min(3, c + 1))} style={stepBtn}>+</button>
              </div>
            </div>
            {/* Energía */}
            <div style={{ padding: "16px 0" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Energía</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{energia}/10</span>
              </div>
              <input type="range" min={1} max={10} value={energia} onChange={(e) => setEnergia(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--color-primary)", height: 6 }} />
            </div>
            {/* Actividad */}
            <div style={{ padding: "6px 0 14px" }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Actividad física</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "var(--color-primary)" }}>{actividad}/10</span>
              </div>
              <input type="range" min={1} max={10} value={actividad} onChange={(e) => setActividad(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--color-primary)", height: 6 }} />
            </div>
          </div>

          {transcript && (
            <div style={{ background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "16px 18px", marginBottom: 22 }}>
              <div style={transLabel}>Tu relato</div>
              <div style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--color-text-muted)" }}>{transcript}</div>
            </div>
          )}

          {state.error && (
            <p style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 14, background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>{state.error}</p>
          )}

          <button type="submit" disabled={pending} style={primaryBtn}>
            Analizar mi día <Arrow />
          </button>
        </form>
      )}
    </div>
  );
}

const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 };
const transLabel: React.CSSProperties = { fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600, marginBottom: 7 };
const primaryBtn: React.CSSProperties = { width: "100%", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontSize: 15.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
const stepBtn: React.CSSProperties = { width: 34, height: 34, borderRadius: 10, border: "1px solid var(--color-border)", background: "#f6faf8", color: "var(--color-primary)", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };

function Arrow() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
