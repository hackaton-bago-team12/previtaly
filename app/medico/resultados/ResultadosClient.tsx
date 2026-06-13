"use client";

import { useState } from "react";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { PulseChart, DonutChart, PerformanceCurveChart } from "@/components/ui/PulseChart";
import { AnalysisIcon } from "@/components/ui/analysis-icon";
import { AlertIcon } from "@/components/ui/icons";
import { CAUSAS } from "@/lib/causas";
import type { CausaKey, Factor } from "@/lib/mock-analysis";
import Link from "next/link";

type Sugerencia = {
  tipo: "primaria" | "secundaria";
  titulo: string;
  descripcion: string;
  icono: string;
};

type Detectado = { icono: string; texto: string };

type Trayectoria = {
  estado: "sin-datos" | "critico" | "empeorando" | "estable" | "mejorando";
  mensaje: string;
  diasHastaAlto: number | null;
};

type Props = {
  latest: Record<string, unknown>;
  prev: Record<string, unknown> | null;
  chartData: { label: string; value: number }[];
  horasTrabajadas: number;
  fuenteHoras: string;
  trayectoria: Trayectoria;
};

const GENERALES = [
  {
    titulo: "Respiración 4-7-8",
    descripcion: "Inhalá 4 s, retené 7 s, exhalá 8 s. Repite 4 veces. Activa el sistema nervioso parasimpático.",
    icono: "breath",
  },
  {
    titulo: "Caminata de 10 minutos",
    descripcion: "Salir a caminar entre consultas reduce el cortisol y mejora la claridad mental.",
    icono: "activity",
  },
  {
    titulo: "Hidratación consciente",
    descripcion: "Un vaso de agua cada hora de guardia. La deshidratación leve afecta la concentración un 15 %.",
    icono: "water",
  },
];

export function ResultadosClient({ latest, prev, chartData, horasTrabajadas, fuenteHoras, trayectoria }: Props) {
  const [expanded, setExpanded] = useState(false);

  const sugerencias = (latest.sugerencias as Sugerencia[] | null) ?? [];
  const primaria    = sugerencias.find((s) => s.tipo === "primaria");
  const secundarias = sugerencias.filter((s) => s.tipo === "secundaria");
  const detectados  = (latest.detectados as Detectado[] | null) ?? [];
  const causaKey    = latest.causa_principal as CausaKey | null;
  const causa       = causaKey ? CAUSAS[causaKey] : null;
  const factores    = (latest.factores as Factor[] | null) ?? [];

  const delta = (key: string) => {
    if (!prev || latest[key] == null || prev[key] == null) return undefined;
    return (latest[key] as number) - (prev[key] as number);
  };

  // Consejo visible por defecto: sugerencia primaria de la IA o el primero general
  const consejo = primaria ?? GENERALES[0];

  const trayLabel: Record<string, string> = {
    critico: "En zona crítica", empeorando: "En aumento", estable: "Estable", mejorando: "Mejorando",
  };
  const trayColor = (trayectoria.estado === "critico" || trayectoria.estado === "empeorando")
    ? "var(--color-risk-high)"
    : trayectoria.estado === "mejorando"
      ? "var(--color-risk-low)"
      : "var(--color-text-muted)";

  return (
    <div className="px-5 py-8 space-y-4 pb-32">

      {/* Risk badge compacto */}
      <RiskBadge
        nivel={latest.nivel_riesgo as "bajo" | "medio" | "alto"}
        tendencia={latest.tendencia as "subiendo" | "estable" | "bajando"}
        showTrafficLight
      />

      {/* Métricas clave — siempre visibles */}
      <div className="card">
        <p className="text-xs font-bold uppercase tracking-widest mb-3"
           style={{ color: "var(--color-text-subtle)" }}>
          Métricas clave{prev && <span className="ml-2 normal-case font-normal">(vs. ayer)</span>}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <DonutChart
            value={latest.indice_pulso as number}
            label="Bienestar"
            sublabel="general"
            color={(latest.indice_pulso as number) >= 70 ? "var(--color-risk-low)" :
                   (latest.indice_pulso as number) >= 45 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
            size={90}
            delta={delta("indice_pulso")}
          />
          <DonutChart
            value={latest.capacidad_restante as number}
            label="Energía"
            sublabel="restante"
            color={(latest.capacidad_restante as number) >= 60 ? "var(--color-risk-low)" :
                   (latest.capacidad_restante as number) >= 30 ? "var(--color-risk-mid)" : "var(--color-risk-high)"}
            size={90}
            delta={delta("capacidad_restante")}
          />
          <DonutChart
            value={latest.concentracion as number}
            label="Foco"
            sublabel="mental"
            color="var(--color-primary)"
            size={90}
            delta={delta("concentracion")}
          />
        </div>
      </div>

      {/* Tendencia compacta — siempre visible */}
      {chartData.length >= 2 && (
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest mb-3"
             style={{ color: "var(--color-text-subtle)" }}>
            Tendencia — últimos {chartData.length} días
          </p>
          <PulseChart data={chartData} />
        </div>
      )}

      {/* Consejo principal — siempre visible */}
      <div className="rounded-2xl p-5 text-white" style={{ background: "var(--color-primary)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-75">
          {primaria ? "Acción recomendada" : "Técnica de bienestar"}
        </p>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: "rgba(255,255,255,0.18)" }}>
            <AnalysisIcon name={consejo.icono} className="h-5 w-5" style={{ color: "#fff" }} />
          </div>
          <div>
            <p className="font-semibold leading-tight">{consejo.titulo}</p>
            <p className="text-sm mt-1 opacity-85">{consejo.descripcion}</p>
          </div>
        </div>
        {primaria && (
        )}
      </div>

      {/* Toggle expandir */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all"
        style={{
          background: "var(--color-bg)",
          color: "var(--color-text-muted)",
          border: "1px solid var(--color-border)",
        }}
      >
        <span>{expanded ? "Ocultar detalle" : "Ver análisis completo"}</span>
        <span style={{ transform: expanded ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>
          ↓
        </span>
      </button>

      {/* Sección expandible */}
      {expanded && (
        <div className="space-y-4">

          {/* Estrés y Carga */}
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
               style={{ color: "var(--color-text-subtle)" }}>
              Carga del día <span className="normal-case font-normal">(menos es mejor)</span>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <DonutChart
                value={latest.estres as number}
                label="Estrés"
                sublabel="menos es mejor"
                color={(latest.estres as number) >= 70 ? "var(--color-risk-high)" :
                       (latest.estres as number) >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                size={88}
                delta={delta("estres") !== undefined ? -(delta("estres")!) : undefined}
              />
              <DonutChart
                value={latest.carga_acumulada as number}
                label="Carga acumulada"
                sublabel="menos es mejor"
                color={(latest.carga_acumulada as number) >= 70 ? "var(--color-risk-high)" :
                       (latest.carga_acumulada as number) >= 40 ? "var(--color-risk-mid)" : "var(--color-risk-low)"}
                size={88}
                delta={delta("carga_acumulada") !== undefined ? -(delta("carga_acumulada")!) : undefined}
              />
            </div>
          </div>

          {/* Causa principal */}
          {causa && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: "var(--color-text-subtle)" }}>
                Causa principal
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                     style={{ background: "var(--color-primary-lt)" }}>
                  <causa.Icon className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{causa.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{causa.descripcion}</p>
                </div>
              </div>
              {factores.length > 0 && (
                <div className="mt-4 space-y-2">
                  {factores.map((f) => {
                    const info = CAUSAS[f.dimension];
                    if (!info) return null;
                    return (
                      <div key={f.dimension}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "var(--color-text-muted)" }}>{info.label}</span>
                          <span className="font-semibold" style={{ color: "var(--color-text)" }}>{f.peso}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-border)" }}>
                          <div className="h-full rounded-full"
                               style={{ width: `${f.peso}%`, background: "var(--color-primary)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Rendimiento vs horas */}
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest mb-1"
               style={{ color: "var(--color-text-subtle)" }}>
              Rendimiento vs. horas trabajadas
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
              Jornada estimada: <strong>{horasTrabajadas}h</strong>
              <span style={{ color: "var(--color-text-subtle)" }}> · {fuenteHoras}</span>
            </p>
            <PerformanceCurveChart
              horasTrabajadas={horasTrabajadas}
              indicePulso={latest.indice_pulso as number}
              concentracion={latest.concentracion as number}
              capacidadRestante={latest.capacidad_restante as number}
            />
          </div>

          {/* Qué detecté */}
          {detectados.length > 0 && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: "var(--color-text-subtle)" }}>
                Qué detecté hoy
              </p>
              <div className="space-y-2.5">
                {detectados.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                       style={{ background: "var(--color-bg)" }}>
                    <AnalysisIcon name={d.icono} className="h-4 w-4 flex-shrink-0 mt-0.5"
                                  style={{ color: "var(--color-primary)" }} />
                    <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias secundarias */}
          {secundarias.length > 0 && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: "var(--color-text-subtle)" }}>
                Más acciones para hoy
              </p>
              <div className="space-y-3">
                {secundarias.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: "var(--color-primary-lt)" }}>
                      <AnalysisIcon name={s.icono} className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{s.titulo}</p>
                      <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proyección */}
          {trayectoria.estado !== "sin-datos" && (
            <div className="card">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                 style={{ color: "var(--color-text-subtle)" }}>
                Proyección
              </p>
              <div className="flex items-center gap-3">
                {trayectoria.diasHastaAlto != null && trayectoria.diasHastaAlto > 0 ? (
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl flex-shrink-0"
                       style={{ background: "var(--color-risk-high-bg)" }}>
                    <span className="text-lg font-bold leading-none" style={{ color: "var(--color-risk-high)" }}>
                      {trayectoria.diasHastaAlto}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-risk-high)" }}>días</span>
                  </div>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                        style={{ color: trayColor, background: "var(--color-bg)", border: `1px solid ${trayColor}` }}>
                    {trayLabel[trayectoria.estado] ?? trayectoria.estado}
                  </span>
                )}
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{trayectoria.mensaje}</p>
              </div>
            </div>
          )}

          {/* Técnicas generales de bienestar */}
          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
               style={{ color: "var(--color-text-subtle)" }}>
              Técnicas de bienestar
            </p>
            <div className="space-y-3">
              {GENERALES.map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: "var(--color-primary-lt)" }}>
                    <AnalysisIcon name={g.icono} className="h-4 w-4" style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{g.titulo}</p>
                    <p className="text-sm mt-0.5" style={{ color: "var(--color-text-muted)" }}>{g.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerta riesgo alto */}
          {latest.nivel_riesgo === "alto" && (
            <div className="rounded-2xl p-4 border-2"
                 style={{ borderColor: "var(--color-risk-high)", background: "var(--color-risk-high-bg)" }}>
              <p className="font-bold mb-1 flex items-center gap-1.5 text-sm"
                 style={{ color: "var(--color-risk-high)" }}>
                <AlertIcon className="h-4 w-4" />
                Evaluación recomendada
              </p>
              <p className="text-sm" style={{ color: "#7f1d1d" }}>
                Tu analista puede agendar una sesión con el equipo de salud mental de tu clínica.
                No es una señal de debilidad — es parte del protocolo de cuidado.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Links secundarios */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <Link href="/medico/historial"
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--color-text-subtle)" }}>
          Ver historial completo
        </Link>
        <Link href="/medico"
              className="text-sm underline underline-offset-2"
              style={{ color: "var(--color-text-subtle)" }}>
          Hacer nuevo check-in
        </Link>
      </div>
    </div>
  );
}
