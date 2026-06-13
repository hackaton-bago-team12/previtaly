const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Etiqueta relativa: "Hoy · 13 jun", "Ayer · 12 jun" o "11 jun". */
export function relativeDia(fechaISO: string): string {
  const d = new Date(fechaISO + "T00:00:00");
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diff = Math.round((hoy.getTime() - d.getTime()) / 86400000);
  const corta = `${d.getDate()} ${MESES[d.getMonth()]}`;
  if (diff === 0) return `Hoy · ${corta}`;
  if (diff === 1) return `Ayer · ${corta}`;
  return corta;
}
