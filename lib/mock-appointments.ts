/** Turnos mock que simulan datos del CRM de la clínica (vista médico) */
export function getMockAppointments(medicoId: string, fecha: string) {
  const base = fecha + "T";
  return [
    {
      id: "mock-1",
      medico_id: medicoId,
      titulo: "Consulta · Ana Rodríguez",
      descripcion: "Control de rutina anual",
      paciente: "Ana Rodríguez",
      tipo: "consulta",
      fecha_inicio: base + "08:00:00",
      fecha_fin:    base + "08:30:00",
      is_mock: true,
    },
    {
      id: "mock-2",
      medico_id: medicoId,
      titulo: "Consulta · Carlos Fernández",
      descripcion: "Revisión post-operatoria",
      paciente: "Carlos Fernández",
      tipo: "consulta",
      fecha_inicio: base + "09:00:00",
      fecha_fin:    base + "09:45:00",
      is_mock: true,
    },
    {
      id: "mock-3",
      medico_id: medicoId,
      titulo: "Cirugía · María González",
      descripcion: "Extirpación laparoscópica",
      paciente: "María González",
      tipo: "cirugia",
      fecha_inicio: base + "11:00:00",
      fecha_fin:    base + "13:00:00",
      is_mock: true,
    },
    {
      id: "mock-4",
      medico_id: medicoId,
      titulo: "Guardia",
      descripcion: "Guardia de urgencias",
      paciente: null,
      tipo: "guardia",
      fecha_inicio: base + "16:00:00",
      fecha_fin:    base + "22:00:00",
      is_mock: true,
    },
  ];
}

/** Genera turnos mock para el equipo del analista, distribuidos en los próximos 7 días */
export function getMockTeamAppointments(
  medicos: { id: string; full_name: string | null; specialty: string | null }[]
) {
  if (medicos.length === 0) return [];

  const PACIENTES = [
    "Ana Rodríguez", "Carlos Fernández", "María González", "Luis Peralta",
    "Sofía Martínez", "Javier López", "Valentina Torres", "Ricardo Gómez",
    "Camila Díaz", "Sebastián Ruiz", "Florencia Sosa", "Matías Herrera",
    "Lucía Castro", "Nicolás Álvarez", "Daniela Moreno",
  ];

  const CIRUGIAS = [
    "Colecistectomía laparoscópica", "Apendicectomía de urgencia",
    "Hernioplastía inguinal", "Tiroidectomía total", "Cirugía bariátrica",
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments: {
    id: string; medico_id: string; titulo: string; descripcion: string;
    paciente: string | null; tipo: string;
    fecha_inicio: string; fecha_fin: string; is_mock: boolean;
  }[] = [];

  let idx = 0;
  const pad = (n: number) => String(n).padStart(2, "0");

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    for (const medico of medicos) {
      // 3-5 consultas por médico por día
      const nConsultas = 3 + (idx % 3);
      let hora = 8;

      for (let c = 0; c < nConsultas; c++) {
        const paciente = PACIENTES[(idx + c) % PACIENTES.length];
        const durMin = 30 + (c % 2 === 0 ? 0 : 15);
        const horaFin = hora + Math.floor(durMin / 60);
        const minFin  = durMin % 60;

        appointments.push({
          id: `mock-team-${dayOffset}-${medico.id}-c${c}`,
          medico_id: medico.id,
          titulo: `Consulta · ${paciente}`,
          descripcion: c % 3 === 0 ? "Control anual" : c % 3 === 1 ? "Seguimiento" : "Primera vez",
          paciente,
          tipo: "consulta",
          fecha_inicio: `${dateStr}T${pad(hora)}:00:00`,
          fecha_fin:    `${dateStr}T${pad(horaFin)}:${pad(minFin)}:00`,
          is_mock: true,
        });

        hora += 1;
        idx++;
      }

      // Una cirugía cada 2 días por médico
      if (dayOffset % 2 === (medicos.indexOf(medico) % 2)) {
        const cirugia = CIRUGIAS[idx % CIRUGIAS.length];
        appointments.push({
          id: `mock-team-${dayOffset}-${medico.id}-cir`,
          medico_id: medico.id,
          titulo: `Cirugía · ${cirugia}`,
          descripcion: cirugia,
          paciente: PACIENTES[(idx + 7) % PACIENTES.length],
          tipo: "cirugia",
          fecha_inicio: `${dateStr}T11:00:00`,
          fecha_fin:    `${dateStr}T13:30:00`,
          is_mock: true,
        });
        idx++;
      }

      // Guardia nocturna: primer médico en días pares, segundo en impares, etc.
      if (medicos.indexOf(medico) === dayOffset % Math.max(medicos.length, 1)) {
        appointments.push({
          id: `mock-team-${dayOffset}-${medico.id}-guard`,
          medico_id: medico.id,
          titulo: "Guardia de urgencias",
          descripcion: "Guardia nocturna rotativa",
          paciente: null,
          tipo: "guardia",
          fecha_inicio: `${dateStr}T20:00:00`,
          fecha_fin:    `${dateStr}T08:00:00`,
          is_mock: true,
        });
        idx++;
      }

      // Reunión semanal (solo lunes)
      if (d.getDay() === 1 && medicos.indexOf(medico) === 0) {
        appointments.push({
          id: `mock-team-${dayOffset}-reunion`,
          medico_id: medico.id,
          titulo: "Reunión de equipo",
          descripcion: "Revisión semanal de carga y bienestar",
          paciente: null,
          tipo: "reunion",
          fecha_inicio: `${dateStr}T07:00:00`,
          fecha_fin:    `${dateStr}T07:45:00`,
          is_mock: true,
        });
      }
    }
  }

  return appointments.sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));
}

export const TIPO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  consulta: { bg: "var(--color-primary-lt)", text: "var(--color-primary)",     label: "Consulta" },
  cirugia:  { bg: "#fef3c7",                text: "#b45309",                   label: "Cirugía" },
  guardia:  { bg: "#fee2e2",                text: "#b91c1c",                   label: "Guardia" },
  reunion:  { bg: "#ede9fe",                text: "#7c3aed",                   label: "Reunión" },
  otro:     { bg: "var(--color-bg)",        text: "var(--color-text-muted)",   label: "Otro" },
};
