"use client";

import { useState, useActionState } from "react";
import { addAppointment, deleteAppointment, type AppointmentState } from "./actions";
import { getMockAppointments, TIPO_COLORS } from "@/lib/mock-appointments";
import { PlusIcon, TrashIcon, CalendarIcon } from "@/components/ui/icons";

type Appointment = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  paciente?: string | null;
  tipo: string;
  fecha_inicio: string;
  fecha_fin: string;
  is_mock?: boolean;
};

const initial: AppointmentState = {};

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export function CalendarioClient({
  appointments,
  today,
  medicoId,
}: {
  appointments: Appointment[];
  today: string;
  medicoId: string;
}) {
  const [state, formAction, pending] = useActionState(addAppointment, initial);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayDate = new Date(today + "T12:00:00");
  const mockAppointments = getMockAppointments(medicoId, today);

  // Merge: real first, then mock (labeled)
  const allAppointments: (Appointment & { is_mock?: boolean })[] = [
    ...appointments,
    ...mockAppointments,
  ].sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));

  async function handleDelete(id: string, isMock?: boolean) {
    if (isMock) return; // Mock can't be deleted
    setDeletingId(id);
    await deleteAppointment(id);
    setDeletingId(null);
  }

  return (
    <div className="px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-5 w-5" style={{ color: "var(--color-primary)" } as React.CSSProperties} />
            <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Mi Agenda</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            {DAYS_ES[todayDate.getDay()]}, {todayDate.getDate()} de {MONTHS_ES[todayDate.getMonth()]}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "var(--color-primary)" }}
        >
          <PlusIcon className="h-4 w-4" />
          Agregar
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form action={formAction} className="card mb-5 space-y-3"
              style={{ borderColor: "var(--color-primary-soft)" }}>
          <h3 className="font-bold" style={{ color: "var(--color-text)" }}>Nuevo turno</h3>
          <input name="titulo" type="text" placeholder="Título *" className="input" required />
          <input name="paciente" type="text" placeholder="Paciente" className="input" />
          <input name="descripcion" type="text" placeholder="Descripción (opcional)" className="input" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                Hora inicio
              </label>
              <input name="horaInicio" type="time" defaultValue="08:00" className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                Hora fin
              </label>
              <input name="horaFin" type="time" defaultValue="09:00" className="input" />
            </div>
          </div>

          <select name="tipo" className="input" style={{ color: "var(--color-text)" }}>
            <option value="consulta">Consulta</option>
            <option value="cirugia">Cirugía</option>
            <option value="guardia">Guardia</option>
            <option value="reunion">Reunión</option>
            <option value="otro">Otro</option>
          </select>

          <input type="hidden" name="fecha" value={today} />

          {state.error && (
            <p className="text-sm" style={{ color: "var(--color-risk-high)" }}>{state.error}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
              Cancelar
            </button>
            <button type="submit" disabled={pending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "var(--color-primary)", opacity: pending ? 0.6 : 1 }}>
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {/* Summary badges */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "var(--color-primary-lt)", color: "var(--color-primary)" }}>
          {allAppointments.length} turnos
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "#fef3c7", color: "#b45309" }}>
          {allAppointments.filter(a => a.tipo === "cirugia").length} cirugías
        </span>
        <span className="text-xs px-3 py-1.5 rounded-full font-medium"
              style={{ background: "#fee2e2", color: "#b91c1c" }}>
          {allAppointments.filter(a => a.tipo === "guardia").length} guardias
        </span>
      </div>

      {/* Appointment list */}
      {allAppointments.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-3xl mb-2">📅</p>
          <p className="font-medium" style={{ color: "var(--color-text-muted)" }}>
            No hay turnos para hoy
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-subtle)" }}>
            Agregá un turno con el botón de arriba
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allAppointments.map((apt) => {
            const cfg = TIPO_COLORS[apt.tipo] ?? TIPO_COLORS.otro;
            return (
              <div key={apt.id} className="card flex gap-4 items-start">
                {/* Time column */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold" style={{ color: "var(--color-text)" }}>
                    {formatTime(apt.fecha_inicio)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                    {formatTime(apt.fecha_fin)}
                  </p>
                </div>

                {/* Left border accent */}
                <div className="w-1 self-stretch rounded-full flex-shrink-0"
                     style={{ background: cfg.text }} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 justify-between">
                    <div>
                      <p className="font-semibold text-sm leading-tight"
                         style={{ color: "var(--color-text)" }}>
                        {apt.titulo}
                      </p>
                      {apt.descripcion && (
                        <p className="text-xs mt-0.5 line-clamp-1"
                           style={{ color: "var(--color-text-muted)" }}>
                          {apt.descripcion}
                        </p>
                      )}
                    </div>
                    {!apt.is_mock && (
                      <button
                        type="button"
                        onClick={() => handleDelete(apt.id, apt.is_mock)}
                        disabled={deletingId === apt.id}
                        className="p-1.5 rounded-lg flex-shrink-0"
                        style={{ color: "var(--color-text-subtle)" }}
                        aria-label="Eliminar turno"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: cfg.bg, color: cfg.text }}>
                      {cfg.label}
                    </span>
                    {apt.is_mock && (
                      <span className="text-xs" style={{ color: "var(--color-text-subtle)" }}>
                        · CRM
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
