"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  HeartPulseIcon,
  MicIcon,
  ChartIcon,
  ChatIcon,
  LightbulbIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@/components/ui/icons";

/* Línea de electrocardiograma reutilizable (el hilo conductor de la página). */
function EkgLine({ className }: { className?: string }) {
  const d =
    "M0 110 H210 l18 -64 l14 104 l16 -82 l12 42 H520 l18 -64 l14 104 l16 -82 l12 42 " +
    "H840 l18 -64 l14 104 l16 -82 l12 42 H1200";
  return (
    <svg
      className={className}
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      <path className="lp-ekg-base" d={d} strokeWidth={2} pathLength={1000} />
      <path
        className="lp-ekg-glow"
        d={d}
        strokeWidth={2.5}
        strokeLinecap="round"
        pathLength={1000}
      />
      {/* Punto que late en el pico central */}
      <circle className="lp-dot" cx={538} cy={46} r={4} fill="var(--lp-glow)" />
    </svg>
  );
}

export function Landing() {
  // Reveal progresivo al hacer scroll.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".lp-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lp">
      {/* ── Nav ───────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.78)", borderBottom: "1px solid var(--lp-border)" }}>
        <nav className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulseIcon className="h-5 w-5" style={{ color: "var(--lp-line)" }} />
            <span className="font-semibold tracking-tight">Previtaly</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-sm px-3 py-2" style={{ color: "var(--lp-muted)" }}>
              Iniciar sesión
            </Link>
            <Link href="/signup" className="lp-btn lp-btn-primary !py-2 !px-3.5 !text-[0.82rem]">
              Registrate
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="lp-bg-radial relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:pt-44 sm:pb-32 relative">
          <p className="lp-reveal text-sm font-medium mb-6"
             style={{ color: "var(--lp-line)" }}>
            Prevención de burnout para quienes cuidan
          </p>

          <h1 className="lp-reveal font-bold tracking-tight leading-[1.05] text-4xl sm:text-6xl max-w-3xl"
              style={{ transitionDelay: "60ms" }}>
            Tu cuerpo avisa antes de quebrarse.
            <br />
            <span style={{ color: "var(--lp-line)" }}>Nosotros lo escuchamos.</span>
          </h1>

          <p className="lp-reveal mt-7 text-lg sm:text-xl max-w-2xl leading-relaxed"
             style={{ color: "var(--lp-muted)", transitionDelay: "120ms" }}>
            20 segundos de tu voz al día. Nuestra IA lee las señales del agotamiento
            —tono, palabras, descanso— y te avisa <span style={{ color: "var(--lp-text)" }}>antes</span> de
            que el burnout te alcance.
          </p>

          <div className="lp-reveal mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4"
               style={{ transitionDelay: "180ms" }}>
            <Link href="/signup" className="lp-btn lp-btn-primary w-full sm:w-auto">
              <MicIcon className="h-5 w-5" />
              Probar el check-in
            </Link>
            <a href="#como" className="lp-btn lp-btn-ghost w-full sm:w-auto">
              Ver cómo funciona
              <ChevronRightIcon className="h-4 w-4" />
            </a>
          </div>

          <p className="lp-reveal mt-6 text-sm" style={{ color: "var(--lp-subtle)", transitionDelay: "240ms" }}>
            Sin tests largos. Sin sentirte vigilado. Solo tu voz, una vez al día.
          </p>
        </div>

        {/* Pulso vivo que cruza el hero */}
        <div className="relative h-28 sm:h-40 -mt-6">
          <EkgLine className="absolute inset-0 w-full h-full opacity-90" />
        </div>
      </section>

      {/* ── Problema ──────────────────────────────────────────── */}
      <section className="border-t" style={{ borderColor: "var(--lp-border)", background: "var(--lp-bg-2)" }}>
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h2 className="lp-reveal text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            El agotamiento no avisa con tiempo.
          </h2>
          <p className="lp-reveal mt-5 text-lg max-w-2xl leading-relaxed"
             style={{ color: "var(--lp-muted)", transitionDelay: "80ms" }}>
            Cuando el burnout se vuelve visible, ya lleva meses instalado. El personal de salud
            es el más expuesto y el que menos espacio tiene para frenar y mirarse.
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              { big: "1 de cada 2", txt: "profesionales de la salud reporta síntomas de burnout." },
              { big: "Meses", txt: "tarda en hacerse evidente. Casi siempre, demasiado tarde." },
              { big: "20 seg", txt: "es todo lo que pide Previtaly para empezar a escucharte." },
            ].map((s, i) => (
              <div key={s.big} className="lp-reveal lp-card" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="text-3xl sm:text-4xl font-bold"
                     style={{ color: i === 2 ? "var(--lp-line)" : "var(--lp-accent)" }}>
                  {s.big}
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  {s.txt}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────── */}
      <section id="como" className="relative" style={{ background: "var(--lp-bg)" }}>
        <div className="mx-auto max-w-6xl px-5 py-24">
          <p className="lp-reveal text-sm font-medium mb-4" style={{ color: "var(--lp-line)" }}>
            Así funciona
          </p>
          <h2 className="lp-reveal text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Tres pasos. Una vez al día.
          </h2>

          <div className="mt-14 grid gap-6 md:grid-cols-3 relative">
            {[
              {
                icon: <MicIcon className="h-6 w-6" />,
                step: "01",
                title: "Hablás 20 segundos",
                txt: "Contás cómo fue tu día, como un audio a un amigo. Nada de formularios eternos.",
              },
              {
                icon: <ChartIcon className="h-6 w-6" />,
                step: "02",
                title: "La IA te escucha",
                txt: "Lee tu voz y tus señales —energía, descanso, carga—. No solo qué decís: cómo lo decís.",
              },
              {
                icon: <HeartPulseIcon className="h-6 w-6" />,
                step: "03",
                title: "Te adelantás al colapso",
                txt: "Recibís tu Índice de Pulso y sugerencias concretas, antes de que la carga te gane.",
              },
            ].map((s, i) => (
              <div key={s.step} className="lp-reveal lp-card" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="inline-flex items-center justify-center h-11 w-11 rounded-xl"
                        style={{ background: "var(--lp-surface-2)", color: "var(--lp-line)" }}>
                    {s.icon}
                  </span>
                  <span className="text-sm font-mono" style={{ color: "var(--lp-subtle)" }}>{s.step}</span>
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--lp-muted)" }}>{s.txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── La métrica: Índice de Pulso ───────────────────────── */}
      <section style={{ background: "var(--lp-bg-2)", borderTop: "1px solid var(--lp-border)" }}>
        <div className="mx-auto max-w-6xl px-5 py-24 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="lp-reveal text-sm font-medium mb-4" style={{ color: "var(--lp-line)" }}>
              Tu Índice de Pulso
            </p>
            <h2 className="lp-reveal text-3xl sm:text-4xl font-bold tracking-tight">
              No es un número más.
            </h2>
            <p className="lp-reveal mt-5 text-lg leading-relaxed" style={{ color: "var(--lp-muted)", transitionDelay: "80ms" }}>
              Es una lectura diaria de cómo estás —en tu propio lenguaje— que se vuelve tendencia
              con el tiempo. Cuando algo se desvía, lo ves venir. Y sabes qué hacer.
            </p>
            <Link href="/signup" className="lp-reveal lp-btn lp-btn-ghost mt-8" style={{ transitionDelay: "140ms" }}>
              Quiero mi lectura
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Mockup del resultado real */}
          <div className="lp-reveal lp-card" style={{ transitionDelay: "120ms" }}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="lp-breathe absolute inset-0 rounded-full"
                     style={{ background: "radial-gradient(circle, rgba(111,174,147,0.28), transparent 70%)" }} />
                <div className="relative h-24 w-24 rounded-full flex flex-col items-center justify-center"
                     style={{ border: "2px solid var(--lp-line)" }}>
                  <span className="text-3xl font-bold" style={{ color: "var(--lp-line)" }}>72</span>
                  <span className="text-[10px]" style={{ color: "var(--lp-subtle)" }}>pulso</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs" style={{ color: "var(--lp-subtle)" }}>Nivel de riesgo hoy</span>
                <div className="flex gap-2">
                  {[
                    { l: "bajo", c: "var(--color-risk-low)", bg: "var(--color-risk-low-bg)" },
                    { l: "medio", c: "var(--color-risk-mid)", bg: "var(--color-risk-mid-bg)", active: true },
                    { l: "alto", c: "var(--color-risk-high)", bg: "var(--color-risk-high-bg)" },
                  ].map((r) => (
                    <span key={r.l}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            color: r.c,
                            background: r.active ? r.bg : "transparent",
                            border: `1px solid ${r.active ? r.c : "var(--lp-border)"}`,
                            opacity: r.active ? 1 : 0.4,
                          }}>
                      {r.l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <ChatIcon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--lp-line)" }} />
                <span style={{ color: "var(--lp-muted)" }}>Tu lenguaje muestra cansancio acumulado.</span>
              </div>
              <div className="rounded-xl p-4" style={{ background: "var(--lp-surface-2)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <LightbulbIcon className="h-4 w-4" style={{ color: "var(--lp-accent)" }} />
                  <span className="text-sm font-semibold">Protegé tu descanso de hoy</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--lp-muted)" }}>
                  Evitá revisar mensajes de trabajo después de las 20 hs. Tu recuperación nocturna es crítica.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Para clínicas ─────────────────────────────────────── */}
      <section style={{ background: "var(--lp-bg)" }}>
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="lp-reveal lp-card flex flex-col md:flex-row md:items-center gap-8"
               style={{ background: "linear-gradient(120deg, var(--lp-surface-2), var(--lp-bg-2))" }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3" style={{ color: "var(--lp-line)" }}>
                <UsersIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Para clínicas y RR.HH.</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Cuidá a tu equipo antes de perderlo.
              </h2>
              <p className="mt-4 leading-relaxed max-w-xl" style={{ color: "var(--lp-muted)" }}>
                Una vista agregada y anónima del estado de tu personal. Detectá focos de carga,
                redistribuí guardias y reducí rotación y ausentismo —sin invadir la privacidad de nadie.
              </p>
            </div>
            <Link href="/signup/analista" className="lp-btn lp-btn-ghost shrink-0 w-full md:w-auto">
              Ver el panel del analista
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────── */}
      <section className="lp-bg-radial relative overflow-hidden"
               style={{ borderTop: "1px solid var(--lp-border)" }}>
        <EkgLine className="absolute top-0 inset-x-0 w-full h-24 opacity-30" />
        <div className="mx-auto max-w-6xl px-5 py-28 text-center relative">
          <h2 className="lp-reveal text-3xl sm:text-5xl font-bold tracking-tight">
            Empieza a cuidar
            <br />
            <span style={{ color: "var(--lp-line)" }}>a quien cuida.</span>
          </h2>
          <p className="lp-reveal mt-6 text-lg max-w-xl mx-auto" style={{ color: "var(--lp-muted)", transitionDelay: "80ms" }}>
            Tu primer check-in lleva menos de lo que tarda un café.
          </p>
          <div className="lp-reveal mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto sm:max-w-none"
               style={{ transitionDelay: "140ms" }}>
            <Link href="/signup" className="lp-btn lp-btn-primary w-full sm:w-auto">
              <MicIcon className="h-5 w-5" />
              Probar el check-in
            </Link>
            <Link href="/login" className="lp-btn lp-btn-ghost w-full sm:w-auto">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ background: "var(--lp-bg-2)", borderTop: "1px solid var(--lp-border)" }}>
        <div className="mx-auto max-w-6xl px-5 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulseIcon className="h-4 w-4" style={{ color: "var(--lp-line)" }} />
            <span className="text-sm font-medium">Previtaly</span>
          </div>
          <p className="text-xs" style={{ color: "var(--lp-subtle)" }}>
            Hecho para el personal de salud que sostiene a todos los demás.
          </p>
        </div>
      </footer>
    </div>
  );
}
