"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MicIcon } from "@/components/ui/icons";

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

const COUNTDOWN_SECONDS = 20;

export function VoiceRecorder({ onTranscript, disabled }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "done">("idle");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setState("done");
    onTranscript(finalTranscriptRef.current + (interim ? " " + interim : ""));
  }, [interim, onTranscript]);

  useEffect(() => {
    if (state === "recording" && countdown === 0) {
      stopRecording();
    }
  }, [countdown, state, stopRecording]);

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Tu navegador no soporta reconocimiento de voz. Podés escribir tu respuesta.");
      return;
    }

    finalTranscriptRef.current = "";
    setInterim("");
    setCountdown(COUNTDOWN_SECONDS);
    setState("recording");

    const recognition = new SR();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let final = "";
      let inter = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + " ";
        } else {
          inter += t;
        }
      }
      finalTranscriptRef.current += final;
      setInterim(inter);
    };

    recognition.onerror = () => {
      stopRecording();
    };

    recognition.start();
    recognitionRef.current = recognition;

    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference * (1 - countdown / COUNTDOWN_SECONDS);

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={startRecording}
        disabled={disabled}
        className="flex flex-col items-center gap-3 group"
        aria-label="Iniciar grabación de voz"
      >
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95"
          style={{ background: "var(--color-primary)" }}
        >
          <MicIcon className="h-12 w-12 text-white" />
        </div>
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Cuéntame en {COUNTDOWN_SECONDS} segundos cómo te sentiste.
        </span>
      </button>
    );
  }

  if (state === "recording") {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* Circular countdown */}
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none"
                    stroke="var(--color-primary-soft)" strokeWidth="4" />
            <circle cx="40" cy="40" r="36" fill="none"
                    stroke="var(--color-primary)" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mb-1" />
            <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
              {countdown}s
            </span>
          </div>
        </div>

        {/* Interim transcript */}
        {(finalTranscriptRef.current || interim) && (
          <p className="text-sm text-center px-4 italic max-h-24 overflow-y-auto"
             style={{ color: "var(--color-text-muted)" }}>
            "{finalTranscriptRef.current}{interim}"
          </p>
        )}

        <button
          type="button"
          onClick={stopRecording}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#ef4444" }}
        >
          Detener
        </button>
      </div>
    );
  }

  // done
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full flex items-center justify-center"
           style={{ background: "var(--color-primary-lt)" }}>
        <span className="text-2xl">✓</span>
      </div>
      <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
        Grabación completada
      </p>
      <button
        type="button"
        onClick={() => { setState("idle"); finalTranscriptRef.current = ""; setInterim(""); onTranscript(""); }}
        className="text-xs underline underline-offset-2"
        style={{ color: "var(--color-text-subtle)" }}
      >
        Grabar de nuevo
      </button>
    </div>
  );
}
