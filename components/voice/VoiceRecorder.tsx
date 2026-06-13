"use client";

import { useState, useRef, useCallback, useEffect } from "react";

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

/**
 * Grabador por voz (Web Speech API, es-AR). Mantené presionado para hablar,
 * soltá para terminar. Visual alineado al diseño (círculo 128px con glow y
 * ondas mientras graba). Al soltar, devuelve la transcripción por onTranscript.
 */
export function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef("");
  const isHoldingRef = useRef(false);

  const stopRecording = useCallback((cancelled = false) => {
    isHoldingRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setRecording(false);
    if (!cancelled) {
      const full = (finalRef.current + " " + interim).trim();
      onTranscript(full);
    }
    setInterim("");
  }, [interim, onTranscript]);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Tu navegador no soporta reconocimiento de voz. Podés escribir tu respuesta directamente.");
      return;
    }
    finalRef.current = "";
    setInterim("");
    isHoldingRef.current = true;
    setRecording(true);

    const recognition = new SR();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let fin = "";
      let inter = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) fin += t + " ";
        else inter += t;
      }
      finalRef.current += fin;
      setInterim(inter);
    };
    recognition.onerror = () => { if (isHoldingRef.current) stopRecording(); };
    recognition.onend = () => {
      if (isHoldingRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [stopRecording]);

  useEffect(() => () => { recognitionRef.current?.stop(); }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!disabled && !recording) startRecording();
  };
  const handlePointerUp = () => { if (recording) stopRecording(); };

  return (
    <div className="flex flex-col items-center" style={{ gap: 18 }}>
      <button
        type="button"
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        aria-label="Mantené presionado para hablar"
        className="relative flex items-center justify-center select-none touch-none"
        style={{
          width: 128,
          height: 128,
          borderRadius: "50%",
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: "var(--color-primary)",
          boxShadow: "0 16px 40px -12px rgba(45,82,70,.6)",
          animation: recording ? undefined : "glow 2.4s ease infinite",
          userSelect: "none",
        }}
      >
        {recording ? (
          <span className="flex items-center" style={{ gap: 4, height: 46 }}>
            {[0, 0.12, 0.24, 0.36, 0.48].map((d, i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: "100%",
                  background: "#fff",
                  borderRadius: 3,
                  transformOrigin: "center",
                  animation: `wave .8s ease ${d}s infinite`,
                }}
              />
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
      <div style={{ fontSize: 13.5, color: "var(--color-text-muted)", fontWeight: 500 }}>
        {recording ? "Soltá para terminar" : "Mantené presionado para hablar"}
      </div>
    </div>
  );
}
