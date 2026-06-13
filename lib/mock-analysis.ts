export type MockAnalysisInput = {
  transcripcion: string;
  comidas: number;
  energia: number;
  actividad: number;
};

// Dimensiones de causa del desgaste (por qué sube el riesgo).
export type CausaKey =
  | "sobrecarga"
  | "descanso"
  | "alimentacion"
  | "emocional"
  | "aislamiento"
  | "autoexigencia";

export type Factor = { dimension: CausaKey; peso: number };

export type MockAnalysisResult = {
  indicePulso:       number;
  concentracion:     number;
  estres:            number;
  capacidadRestante: number;
  cargaAcumulada:    number;
  nivelRiesgo:       "bajo" | "medio" | "alto";
  tendencia:         "subiendo" | "estable" | "bajando";
  causaPrincipal:    CausaKey;
  factores:          Factor[];
  detectados:        { icono: string; texto: string }[];
  sugerencias:       { tipo: "primaria" | "secundaria"; titulo: string; descripcion: string; icono: string }[];
};

const STRESS_WORDS = ["cansado", "agotado", "estresado", "difícil", "mucho", "muchos", "pesado", "mal", "saturado", "sin energía"];
const POSITIVE_WORDS = ["bien", "tranquilo", "positivo", "descanso", "descansé", "bueno", "excelente", "genial"];

function countWords(text: string, wordList: string[]): number {
  const lower = text.toLowerCase();
  return wordList.filter((w) => lower.includes(w)).length;
}

/** Genera un análisis determinístico basado en los inputs del check-in. */
export function generateMockAnalysis(input: MockAnalysisInput): MockAnalysisResult {
  const { transcripcion, comidas, energia, actividad } = input;

  const stressSignals  = countWords(transcripcion, STRESS_WORDS);
  const positiveSignals = countWords(transcripcion, POSITIVE_WORDS);

  // Scores base (0-100, más alto = más estrés/peor)
  const voiceStress    = Math.min(100, stressSignals * 15 - positiveSignals * 10);
  const energiaScore   = (10 - energia) * 10;           // energía baja → mayor estrés
  const comidasScore   = (3 - comidas) * 15;             // pocas comidas → mayor carga
  const actividadScore = actividad > 5 ? 0 : (5 - actividad) * 8;

  const rawStress = Math.max(0, Math.min(100,
    voiceStress * 0.4 + energiaScore * 0.3 + comidasScore * 0.2 + actividadScore * 0.1 + Math.random() * 10
  ));

  const estres             = Math.round(rawStress);
  const indicePulso        = Math.round(Math.max(10, Math.min(100, 100 - rawStress * 0.7 + Math.random() * 8)));
  const concentracion      = Math.round(Math.max(20, Math.min(100, 100 - rawStress * 0.6)));
  const capacidadRestante  = Math.round(Math.max(10, Math.min(100, energia * 8 + actividad * 3 - stressSignals * 5)));
  const cargaAcumulada     = Math.round(Math.min(100, 30 + rawStress * 0.5 + (3 - comidas) * 8));

  const nivelRiesgo: "bajo" | "medio" | "alto" =
    rawStress >= 65 ? "alto" :
    rawStress >= 35 ? "medio" :
    "bajo";

  const tendencia: "subiendo" | "estable" | "bajando" =
    rawStress >= 50 ? "subiendo" :
    rawStress >= 25 ? "estable"  :
    "bajando";

  // Detectados
  const detectados: { icono: string; texto: string }[] = [];
  if (stressSignals >= 2)
    detectados.push({ icono: "chat", texto: "Tu lenguaje muestra cansancio y desconexión." });
  if (comidas < 3)
    detectados.push({ icono: "food", texto: `Salteaste ${3 - comidas} comida(s) hoy.` });
  if (energia <= 4)
    detectados.push({ icono: "energy", texto: "Reportaste un nivel de energía muy bajo." });
  if (capacidadRestante < 30)
    detectados.push({ icono: "clipboard", texto: "Carga 30% mayor a tu promedio habitual." });
  if (detectados.length === 0)
    detectados.push({ icono: "ok", texto: "No detecté señales de alerta significativas hoy." });

  // Sugerencias
  const sugerencias: MockAnalysisResult["sugerencias"] = [];

  if (nivelRiesgo === "alto") {
    sugerencias.push({
      tipo: "primaria",
      titulo: "Toma un descanso ahora",
      descripcion: "Cinco minutos de respiración profunda antes de tu próxima consulta reducen el cortisol un 23%.",
      icono: "breath",
    });
    sugerencias.push({
      tipo: "secundaria",
      titulo: "Considerá hablar con alguien",
      descripcion: "Tu analista puede gestionar una evaluación psicológica si esta carga persiste.",
      icono: "support",
    });
  } else if (nivelRiesgo === "medio") {
    sugerencias.push({
      tipo: "primaria",
      titulo: "Protege tu descanso de hoy",
      descripcion: "Evitá revisar mensajes de trabajo después de las 20 hs. Tu recuperación nocturna es crítica.",
      icono: "rest",
    });
    sugerencias.push({
      tipo: "secundaria",
      titulo: "Redistribuí una consulta del jueves",
      descripcion: "Llevas 3 días seguidos en alza de carga.",
      icono: "refresh",
    });
  } else {
    sugerencias.push({
      tipo: "primaria",
      titulo: "¡Buen trabajo hoy!",
      descripcion: "Tu estado es óptimo. Mantén la rutina de actividad física que está funcionando.",
      icono: "activity",
    });
  }

  if (comidas < 3) {
    sugerencias.push({
      tipo: "secundaria",
      titulo: "Planificá tus comidas mañana",
      descripcion: "Saltear comidas afecta tu concentración y estado de ánimo durante la jornada.",
      icono: "food",
    });
  }

  // Causa: pesamos cada dimensión y elegimos la dominante.
  const lower = transcripcion.toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => lower.includes(w));
  const rawCausas: Record<CausaKey, number> = {
    emocional:     Math.max(0, voiceStress) + (has("desmotiv", "no tengo ganas", "superad", "no puedo más", "no puedo mas") ? 25 : 0),
    descanso:      energiaScore + (has("no dormí", "no dormi", "sueño", "cansado", "agotado") ? 20 : 0),
    alimentacion:  comidasScore * 1.6,
    sobrecarga:    stressSignals * 12 + (has("guardia", "muchas", "consultas", "turno", "ritmo", "doble") ? 30 : 0),
    autoexigencia: has("tengo que", "rendir", "exig", "más y más", "mas y mas", "perfecto", "no puedo parar") ? 45 : 0,
    aislamiento:   has("solo", "sola", "nadie", "sin apoyo", "no delego") ? 40 : 0,
  };

  const ordenadas = (Object.entries(rawCausas) as [CausaKey, number][])
    .map(([dimension, v]) => ({ dimension, v: Math.max(0, v) }))
    .filter((f) => f.v > 0)
    .sort((a, b) => b.v - a.v)
    .slice(0, 4);
  if (ordenadas.length === 0) ordenadas.push({ dimension: "sobrecarga", v: 1 });

  const total = ordenadas.reduce((s, f) => s + f.v, 0);
  const factores: Factor[] = ordenadas.map((f) => ({
    dimension: f.dimension,
    peso: Math.round((f.v / total) * 100),
  }));
  const causaPrincipal = factores[0].dimension;

  return {
    indicePulso,
    concentracion,
    estres,
    capacidadRestante,
    cargaAcumulada,
    nivelRiesgo,
    tendencia,
    causaPrincipal,
    factores,
    detectados,
    sugerencias,
  };
}
