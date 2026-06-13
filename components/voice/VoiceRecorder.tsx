"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Errores transitorios que NO deben cortar la sesión (los reinicia onend).
const TRANSIENT = new Set(["no-speech", "aborted", "network"]);

/**
 * Grabador por voz (Web Speech API, es-PE). Toca para empezar, toca para
 * terminar. Visual del diseño (círculo 128px con glow y ondas). Muestra la
 * transcripción en vivo y deja escribir a mano si el navegador no soporta voz.
 */
export function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [supported, setSupported] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef("");
  const recordingRef = useRef(false);

  useEffect(() => {
    const SR =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    // Deteccion de capacidad una sola vez al montar (correccion post-hidratacion).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(Boolean(SR));
  }, []);

  // Cleanup al desmontar.
  useEffect(() => {
    return () => {
      recordingRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    };
  }, []);

  const stop = () => {
    recordingRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    recognitionRef.current = null;
    setRecording(false);
    setInterim("");
    const full = (finalRef.current + " " + interim).trim();
    if (full) onTranscript(full);
  };

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); setTyping(true); return; }

    finalRef.current = "";
    setInterim("");
    setError("");
    recordingRef.current = true;
    setRecording(true);

    const recognition = new SR();
    recognition.lang = "es-PE";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let inter = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalRef.current += t + " ";
        else inter += t;
      }
      setInterim(inter);
      // Actualizamos al padre en vivo para que aparezca "Continuar".
      const live = (finalRef.current + " " + inter).trim();
      if (live) onTranscript(live);
    };

    recognition.onerror = (e: any) => {
      const err = e?.error ?? "";
      if (TRANSIENT.has(err)) return; // onend lo reinicia mientras grabamos
      if (err === "not-allowed" || err === "service-not-allowed") {
        setError("Necesito permiso para usar el micrófono. Activalo o escribí tu respuesta.");
        setTyping(true);
      } else if (err === "audio-capture") {
        setError("No detecto micrófono. Podés escribir tu respuesta.");
        setTyping(true);
      }
      recordingRef.current = false;
      setRecording(false);
    };

    // Algunos navegadores cortan solos; si seguimos grabando, reanudamos.
    recognition.onend = () => {
      if (recordingRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      } else {
        setRecording(false);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      recordingRef.current = false;
      setRecording(false);
    }
  };

  const toggle = () => {
    if (disabled) return;
    if (recording) stop();
    else start();
  };

  // ── Fallback de texto ───────────────────────────────────────────────
  if (typing || !supported) {
    return (
      <div className="flex flex-col items-center w-full" style={{ gap: 12 }}>
        {error && (
          <p style={{ fontSize: 13, color: "var(--color-risk-high)", textAlign: "center" }}>{error}</p>
        )}
        <textarea
          autoFocus
          rows={4}
          placeholder="Escribí cómo estuvo tu día…"
          onChange={(e) => onTranscript(e.target.value)}
          disabled={disabled}
          className="w-full"
          style={{
            background: "#fff",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            padding: "14px 16px",
            fontSize: 15,
            lineHeight: 1.5,
            color: "var(--color-text)",
            outline: "none",
            resize: "none",
          }}
        />
        {supported && (
          <button
            type="button"
            onClick={() => { setTyping(false); setError(""); }}
            style={{ fontSize: 13, color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Volver al micrófono
          </button>
        )}
      </div>
    );
  }

  // ── Micrófono ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center w-full" style={{ gap: 18 }}>
      <button
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-label={recording ? "Toca para terminar" : "Toca para hablar"}
        className="relative flex items-center justify-center select-none"
        style={{
          width: 128,
          height: 128,
          borderRadius: "50%",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: "var(--color-primary)",
          boxShadow: "0 16px 40px -12px rgba(45,82,70,.6)",
          animation: recording ? undefined : "glow 2.4s ease infinite",
        }}
      >
        {recording ? (
          <span className="flex items-center" style={{ gap: 4, height: 46 }}>
            {[0, 0.12, 0.24, 0.36, 0.48].map((d, i) => (
              <span key={i} style={{ width: 5, height: "100%", background: "#fff", borderRadius: 3, transformOrigin: "center", animation: `wave .8s ease ${d}s infinite` }} />
            ))}
          </span>
        ) : (
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <path d="M12 18v3" />
            <path d="M8.5 21h7" />
          </svg>
        )}
      </button>

      <div style={{ fontSize: 13.5, color: "var(--color-text-muted)", fontWeight: 500, textAlign: "center" }}>
        {recording ? "Grabando… toca para terminar" : "Toca para hablar"}
      </div>

      {recording && interim && (
        <p style={{ fontSize: 13.5, color: "var(--color-text-subtle)", fontStyle: "italic", textAlign: "center", maxWidth: 300 }}>
          {interim}
        </p>
      )}

      <button
        type="button"
        onClick={() => setTyping(true)}
        style={{ fontSize: 12.5, color: "var(--color-text-subtle)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}
      >
        Prefiero escribir
      </button>
    </div>
  );
}
