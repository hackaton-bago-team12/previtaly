/**
 * Predicción por TRAYECTORIA — honesta, sin "ML mágico".
 * Sobre la serie de check-ins calculamos un riesgo compuesto, su pendiente
 * (regresión lineal) y proyectamos cuántos días faltan para entrar en zona alta.
 */

export type Trayectoria = {
  estado: "mejorando" | "estable" | "empeorando" | "critico" | "sin-datos";
  riesgoActual: number; // 0-100 (más alto = peor)
  pendientePorDia: number;
  diasHastaAlto: number | null;
  mensaje: string;
};

const UMBRAL_ALTO = 65;

/** Pendiente por regresión lineal de una serie equiespaciada (puntos/paso). */
export function pendiente(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export type PuntoRiesgo = { indicePulso: number; estres: number; cargaAcumulada: number };

/** Riesgo compuesto 0-100 (combina estrés, carga y el inverso del bienestar). */
export function riesgoDe(p: PuntoRiesgo): number {
  return Math.round((p.estres + p.cargaAcumulada + (100 - p.indicePulso)) / 3);
}

/** Calcula la trayectoria a partir de la serie ordenada (más viejo → más nuevo). */
export function calcularTrayectoria(serie: PuntoRiesgo[]): Trayectoria {
  if (serie.length < 2) {
    return {
      estado: "sin-datos",
      riesgoActual: serie[0] ? riesgoDe(serie[0]) : 0,
      pendientePorDia: 0,
      diasHastaAlto: null,
      mensaje: "Necesitás algunos check-ins más para proyectar tu trayectoria.",
    };
  }

  const riesgos = serie.map(riesgoDe);
  const ventana = riesgos.slice(-7); // últimos 7
  const m = pendiente(ventana);
  const actual = riesgos[riesgos.length - 1];

  if (actual >= UMBRAL_ALTO) {
    return {
      estado: "critico",
      riesgoActual: actual,
      pendientePorDia: m,
      diasHastaAlto: 0,
      mensaje: "Ya estás en zona de riesgo alto. Es momento de frenar y apoyarte en tu equipo.",
    };
  }

  if (m > 1) {
    const dias = Math.max(1, Math.round((UMBRAL_ALTO - actual) / m));
    return {
      estado: "empeorando",
      riesgoActual: actual,
      pendientePorDia: m,
      diasHastaAlto: dias <= 30 ? dias : null,
      mensaje:
        dias <= 30
          ? `A este ritmo, en ~${dias} día${dias === 1 ? "" : "s"} entrarías en zona de riesgo alto. Conviene ajustar ahora.`
          : "Tu carga viene en aumento. Pequeños ajustes hoy evitan llegar al límite.",
    };
  }

  if (m < -1) {
    return {
      estado: "mejorando",
      riesgoActual: actual,
      pendientePorDia: m,
      diasHastaAlto: null,
      mensaje: "Venís mejorando. Mantené lo que estás haciendo.",
    };
  }

  return {
    estado: "estable",
    riesgoActual: actual,
    pendientePorDia: m,
    diasHastaAlto: null,
    mensaje: "Tu trayectoria viene estable. Seguí cuidando tu descanso y tu carga.",
  };
}
