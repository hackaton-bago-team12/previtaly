/** Turnos mock que simulan datos del CRM de la clínica */
export function getMockAppointments(medicoId: string, fecha: string) {
  const base = fecha + "T";
  return [
    {
      id: "mock-1",
      medico_id: medicoId,
      titulo: "Consulta — Ana Rodríguez",
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
      titulo: "Consulta — Carlos Fernández",
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
      titulo: "Cirugía — María González",
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

export const TIPO_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  consulta: { bg: "var(--color-primary-lt)", text: "var(--color-primary)",     label: "Consulta" },
  cirugia:  { bg: "#fef3c7",                text: "#b45309",                   label: "Cirugía" },
  guardia:  { bg: "#fee2e2",                text: "#b91c1c",                   label: "Guardia" },
  reunion:  { bg: "#ede9fe",                text: "#7c3aed",                   label: "Reunión" },
  otro:     { bg: "var(--color-bg)",        text: "var(--color-text-muted)",   label: "Otro" },
};
