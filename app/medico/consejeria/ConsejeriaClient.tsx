"use client";

import { useState, useActionState } from "react";
import { VoiceRecorder } from "@/components/voice/VoiceRecorder";
import { submitConsejeria, type ConsejeriaState } from "../actions";
import { BackButton } from "@/components/ui/BackButton";
import { AnalyzingOverlay } from "@/components/ui/AnalyzingOverlay";
import { ConsejeriaResult } from "@/components/medico/ConsejeriaResult";
import type { Sugerencia } from "@/components/medico/ConsejosCards";

const initial: ConsejeriaState = {};

export function ConsejeriaClient() {
  const [state, formAction, pending] = useActionState(submitConsejeria, initial);
  const [transcript, setTranscript] = useState("");

  // Resultado listo → mostramos los consejos.
  if (state.ok) {
    return (
      <ConsejeriaResult
        fecha={state.fecha ?? new Date().toISOString().split("T")[0]}
        sugerencias={(state.sugerencias as Sugerencia[]) ?? []}
        nivelRiesgo={state.nivelRiesgo}
        backHref="/medico"
        ctaHref="/medico"
        ctaLabel="Listo"
      />
    );
  }

  return (
    <div style={{ minHeight: "100%", animation: "screenIn .35s ease" }}>
      <BackButton href="/medico" />
      {pending && <AnalyzingOverlay title="Armando tus consejos…" subtitle="Según lo que me contaste" />}

      <div style={{ padding: "78px 22px 24px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>Consejería del día</div>
          <h1 style={{ margin: "10px 0 4px", fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>Contame tu jornada</h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
            Según lo que me cuentes, te armo recomendaciones para hoy.
          </p>
        </div>

        <div style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, padding: "14px 0" }}>
          <VoiceRecorder onTranscript={setTranscript} disabled={pending} />
          {transcript && (
            <div style={{ width: "100%", background: "#fff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600, marginBottom: 7 }}>Transcripción</div>
              <div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--color-text)" }}>{transcript}</div>
            </div>
          )}
        </div>

        {state.error && (
          <p style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 14, background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>{state.error}</p>
        )}

        {transcript && (
          <form action={formAction} style={{ marginTop: "auto" }}>
            <input type="hidden" name="transcripcion" value={transcript} />
            <button type="submit" disabled={pending} className="flex items-center justify-center" style={{ width: "100%", background: "var(--color-primary)", color: "#fff", border: "none", borderRadius: 14, padding: 16, fontSize: 15.5, fontWeight: 600, cursor: "pointer", gap: 8 }}>
              Armar mis consejos
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
