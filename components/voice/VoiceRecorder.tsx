"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MicIcon, CheckIcon } from "@/components/ui/icons";

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

export function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");

  const recognitionRef  = useRef<any>(null);
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalRef        = useRef("");
  const isHoldingRef    = useRef(false);

  // Limpia el timer
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecording = useCallback((cancelled = false) => {
    isHoldingRef.current = false;
    clearTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;

    if (!cancelled) {
      const full = (finalRef.current + " " + interim).trim();
      setFinalText(full);
      onTranscript(full);
      setState("done");
    } else {
      setState("idle");
    }
    setInterim("");
  }, [interim, onTranscript]);

  const startRecording = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Tu navegador no soporta reconocimiento de voz. Puedes escribir tu respuesta directamente.");
      return;
    }

    finalRef.current = "";
    setInterim("");
    setFinalText("");
    setElapsed(0);
    isHoldingRef.current = true;
    setState("recording");

    const recognition = new SR();
    recognition.lang          = "es-AR";
    recognition.continuous    = true;
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

    recognition.onerror = () => {
      if (isHoldingRef.current) stopRecording();
    };

    // Algunos navegadores paran el recognition solos; si sigue presionado, lo reinicia
    recognition.onend = () => {
      if (isHoldingRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, [stopRecording]);

  // Cleanup al desmontar
  useEffect(() => () => { clearTimer(); recognitionRef.current?.stop(); }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!disabled && state !== "recording") startRecording();
  };

  const handlePointerUp = () => {
    if (state === "recording") stopRecording();
  };

  const fmtElapsed = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // ── IDLE ───────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="flex flex-col items-center gap-3 select-none touch-none group"
          aria-label="Mantené presionado para grabar"
          style={{ userSelect: "none" }}
        >
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-90"
            style={{ background: "var(--color-primary)" }}
          >
            <MicIcon className="h-12 w-12 text-white" />
          </div>
        </button>
        <p className="text-sm text-center" style={{ color: "var(--color-text-muted)" }}>
          Mantené presionado y contame cómo estuvo tu día.
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
          Suelta cuando termines — sin límite de tiempo.
        </p>
      </div>
    );
  }

  // ── RECORDING ─────────────────────────────────────────────────────
  if (state === "recording") {
    const liveText = (finalRef.current + interim).trim();
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Botón presionado — efecto pulsante */}
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="relative flex items-center justify-center select-none touch-none"
          style={{ userSelect: "none" }}
          aria-label="Suelta para detener"
        >
          {/* Onda exterior pulsante */}
          <span className="absolute w-32 h-32 rounded-full animate-ping opacity-20"
                style={{ background: "var(--color-primary)" }} />
          <span className="absolute w-28 h-28 rounded-full animate-pulse opacity-30"
                style={{ background: "var(--color-primary)" }} />

          <div className="relative w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl"
               style={{ background: "var(--color-primary)" }}>
            <div className="w-3 h-3 rounded-full bg-red-400 mb-1" />
            <span className="text-white text-base font-bold">{fmtElapsed(elapsed)}</span>
          </div>
        </button>

        {/* Transcripción en vivo */}
        <div className="w-full min-h-[56px] rounded-xl px-4 py-3 text-sm italic text-center"
             style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
          {liveText
            ? `"${liveText}"`
            : <span style={{ color: "var(--color-text-subtle)" }}>Escuchando…</span>}
        </div>

        <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
          Suelta el botón para terminar
        </p>
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: "var(--color-primary-light)" }}>
        <CheckIcon className="h-7 w-7" style={{ color: "var(--color-primary)" }} />
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
        Grabación completada · {fmtElapsed(elapsed)}
      </p>
      {finalText && (
        <div className="w-full rounded-xl px-4 py-3 text-sm italic"
             style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
          &ldquo;{finalText}&rdquo;
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setState("idle");
          finalRef.current = "";
          setInterim("");
          setFinalText("");
          setElapsed(0);
          onTranscript("");
        }}
        className="text-xs underline underline-offset-2"
        style={{ color: "var(--color-text-subtle)" }}
      >
        Grabar de nuevo
      </button>
    </div>
  );
}
