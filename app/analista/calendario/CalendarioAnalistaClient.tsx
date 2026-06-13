"use client";

import { useState, useActionState } from "react";
import { assignShift, unassignShift, addExtraShift } from "../actions";
import { TIPO_COLORS } from "@/lib/mock-appointments";
import { CalendarIcon, PlusIcon } from "@/components/ui/icons";
import { RiskChip } from "@/components/ui/RiskBadge";

type Medico = { id: string; full_name: string | null; specialty: string | null };
type Appointment = {
  id: string; medico_id: string; titulo: string; fecha_inicio: string;
  fecha_fin: string; tipo: string; paciente?: string | null; is_mock?: boolean;
};
type ExtraShift = {
  id: string; titulo: string; fecha_inicio: string; fecha_fin: string;
  medico_asignado_id: string | null; bloqueado: boolean; motivo_bloqueo: string | null;
};
type RiskMap = Record<string, { nivel: string; capacidad: number | null }>;

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function CalendarioAnalistaClient({
  medicos, appointments, extraShifts, riskMap, today,
}: {
  medicos: Medico[];
  appointments: Appointment[];
  extraShifts: ExtraShift[];
  riskMap: RiskMap;
  today: string;
}) {
  const todayStr = today;
  const [filterMedico, setFilterMedico] = useState<string>("todos");
  const [tab, setTab] = useState<"agenda" | "guardias">("agenda");
  const [showAddShift, setShowAddShift] = useState(false);
  const [assignError, setAssignError] = useState<{ id: string; msg: string } | null>(null);
  const [shiftState, addShiftAction, shiftPending] = useActionState(addExtraShift, {});

  const filteredAppts = appointments.filter(
    (a) => filterMedico === "todos" || a.medico_id === filterMedico
  );

  const medicoName = (id: string) =>
    medicos.find((m) => m.id === id)?.full_name ?? "—";

  async function handleAssign(shiftId: string, medicoId: string) {
    setAssignError(null);
    const result = await assignShift(shiftId, medicoId);
    if (result.error) setAssignError({ id: shiftId, msg: result.error });
  }

  async function handleUnassign(shiftId: string) {
    setAssignError(null);
    await unassignShift(shiftId);
  }

  return (
    <div className="px-5 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <CalendarIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
        <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Agenda clínica</span>
      </div>
      <h1 className="text-2xl font-bold mb-5" style={{ color: "var(--color-text)" }}>
        Horarios del equipo
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 p-1 rounded-xl" style={{ background: "var(--color-border)" }}>
        {(["agenda", "guardias"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: tab === t ? "var(--color-bg-card)" : "transparent",
                    color:      tab === t ? "var(--color-primary)" : "var(--color-text-muted)",
                    boxShadow:  tab === t ? "0 1px 3px rgba(0,0,0,.08)" : "none",
                  }}>
            {t === "agenda" ? "Agenda" : `Guardias extra (${extraShifts.length})`}
          </button>
        ))}
      </div>

      {/* ── AGENDA ── */}
      {tab === "agenda" && (
        <>
          {/* Filtro por médico */}
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            <FilterBtn active={filterMedico === "todos"} onClick={() => setFilterMedico("todos")}>
              Todos
            </FilterBtn>
            {medicos.map((m) => (
              <FilterBtn key={m.id} active={filterMedico === m.id}
                         onClick={() => setFilterMedico(m.id)}>
                {m.full_name?.split(" ").slice(-1)[0] ?? "—"}
                {riskMap[m.id] && (
                  <span className="ml-1.5 text-[10px]">
                    {riskMap[m.id].nivel === "alto" ? "🔴" : riskMap[m.id].nivel === "medio" ? "🟡" : "🟢"}
                  </span>
                )}
              </FilterBtn>
            ))}
          </div>

          {filteredAppts.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-2">📅</p>
              <p style={{ color: "var(--color-text-muted)" }}>
                {filterMedico === "todos"
                  ? "No hay turnos registrados"
                  : `${medicoName(filterMedico)} no tiene turnos`}
              </p>
            </div>
          ) : (() => {
            // Agrupar por día
            const hasMock = filteredAppts.some((a) => a.is_mock);
            const groups: Record<string, Appointment[]> = {};
            for (const apt of filteredAppts) {
              const day = apt.fecha_inicio.split("T")[0];
              if (!groups[day]) groups[day] = [];
              groups[day].push(apt);
            }
            return (
              <div className="space-y-5">
                {hasMock && (
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
                       style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                    <span>📋</span>
                    <span>Datos de demostración — se reemplazarán al integrar el CRM de la clínica.</span>
                  </div>
                )}
                {Object.entries(groups).map(([day, apts]) => {
                  const d = new Date(day + "T12:00:00");
                  const isToday = day === todayStr;
                  const dayLabel = isToday
                    ? "Hoy"
                    : d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" });

                  return (
                    <div key={day}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider capitalize"
                           style={{ color: isToday ? "var(--color-primary)" : "var(--color-text-subtle)" }}>
                          {dayLabel}
                        </p>
                        <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
                        <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                          {apts.length} turnos
                        </span>
                      </div>
                      <div className="space-y-2">
                        {apts.map((apt) => {
                          const cfg  = TIPO_COLORS[apt.tipo] ?? TIPO_COLORS.otro;
                          const risk = riskMap[apt.medico_id];
                          return (
                            <div key={apt.id} className="card p-3 flex gap-3 items-start">
                              {/* Franja de color */}
                              <div className="w-1 self-stretch rounded-full flex-shrink-0"
                                   style={{ background: cfg.text }} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-semibold text-sm leading-tight" style={{ color: "var(--color-text)" }}>
                                    {apt.titulo}
                                  </p>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                                        style={{ background: cfg.bg, color: cfg.text }}>
                                    {cfg.label}
                                  </span>
                                </div>
                                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                                  {fmt(apt.fecha_inicio)} – {fmt(apt.fecha_fin)}
                                  {filterMedico === "todos" && (
                                    <span style={{ color: "var(--color-text-subtle)" }}>
                                      {" · "}{medicoName(apt.medico_id).split(" ").slice(-1)[0]}
                                    </span>
                                  )}
                                </p>
                                {risk && filterMedico === "todos" && (
                                  <div className="mt-1">
                                    <RiskChip nivel={risk.nivel as "bajo" | "medio" | "alto"} />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </>
      )}

      {/* ── GUARDIAS EXTRA ── */}
      {tab === "guardias" && (
        <>
          <button type="button" onClick={() => setShowAddShift(!showAddShift)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white mb-4"
                  style={{ background: "var(--color-primary)" }}>
            <PlusIcon className="h-4 w-4" />
            Nueva guardia extra
          </button>

          {showAddShift && (
            <form action={addShiftAction} className="card mb-4 space-y-3"
                  style={{ borderColor: "var(--color-primary-soft)" }}>
              <h3 className="font-bold" style={{ color: "var(--color-text)" }}>Nueva guardia</h3>
              <input name="titulo" type="text" placeholder="Título *" className="input" required />
              <input name="fecha" type="date" defaultValue={today} className="input" required />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-muted)" }}>Inicio</label>
                  <input name="horaInicio" type="time" defaultValue="08:00" className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-muted)" }}>Fin</label>
                  <input name="horaFin" type="time" defaultValue="16:00" className="input" />
                </div>
              </div>
              {shiftState.error && (
                <p className="text-sm" style={{ color: "var(--color-risk-high)" }}>{shiftState.error}</p>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddShift(false)}
                        className="flex-1 py-2.5 rounded-xl border text-sm"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={shiftPending}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ background: "var(--color-primary)", opacity: shiftPending ? 0.6 : 1 }}>
                  {shiftPending ? "Guardando…" : "Crear"}
                </button>
              </div>
            </form>
          )}

          {extraShifts.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-3xl mb-2">🏥</p>
              <p style={{ color: "var(--color-text-muted)" }}>No hay guardias extra creadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {extraShifts.map((shift) => {
                const assigned = shift.medico_asignado_id;
                const assignedName = assigned ? medicoName(assigned) : null;
                const isBlockError = assignError?.id === shift.id;

                return (
                  <div key={shift.id} className="card">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold" style={{ color: "var(--color-text)" }}>{shift.titulo}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          {fmtDate(shift.fecha_inicio)} · {fmt(shift.fecha_inicio)}–{fmt(shift.fecha_fin)}
                        </p>
                      </div>
                      {assigned ? (
                        <span className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "var(--color-primary-lt)", color: "var(--color-primary)" }}>
                          Asignada
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "var(--color-bg)", color: "var(--color-text-subtle)" }}>
                          Disponible
                        </span>
                      )}
                    </div>

                    {assigned && (
                      <div className="flex items-center justify-between mb-3 p-2 rounded-xl"
                           style={{ background: "var(--color-primary-lt)" }}>
                        <p className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                          {assignedName}
                        </p>
                        <button type="button"
                                onClick={() => handleUnassign(shift.id)}
                                className="text-xs underline"
                                style={{ color: "var(--color-text-subtle)" }}>
                          Quitar
                        </button>
                      </div>
                    )}

                    {/* Bloqueo error banner */}
                    {isBlockError && (
                      <div className="mb-3 rounded-xl p-3 text-sm"
                           style={{ background: "var(--color-risk-high-bg)", color: "var(--color-risk-high)" }}>
                        🚫 {assignError.msg}
                      </div>
                    )}

                    {/* Selector de médico */}
                    {!assigned && medicos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: "var(--color-text-muted)" }}>
                          Asignar médico:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {medicos.map((m) => {
                            const risk = riskMap[m.id];
                            const blocked = risk?.nivel === "alto" ||
                              (risk?.capacidad !== null && (risk?.capacidad ?? 100) < 30);
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => handleAssign(shift.id, m.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all"
                                style={{
                                  borderColor: blocked ? "var(--color-risk-high)" : "var(--color-border)",
                                  background:  blocked ? "var(--color-risk-high-bg)" : "var(--color-bg-card)",
                                  color:       blocked ? "var(--color-risk-high)" : "var(--color-text)",
                                }}
                              >
                                {blocked ? "⚠️" : "✓"}{" "}
                                {m.full_name?.split(" ").slice(-1)[0] ?? "—"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FilterBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
            className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all"
            style={{
              background: active ? "var(--color-primary)" : "var(--color-bg-card)",
              color:      active ? "#fff" : "var(--color-text-muted)",
              border:     `1px solid ${active ? "transparent" : "var(--color-border)"}`,
            }}>
      {children}
    </button>
  );
}
