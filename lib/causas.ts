import type { CSSProperties, ReactElement } from "react";
import type { CausaKey } from "@/lib/mock-analysis";
import {
  ClipboardIcon,
  MoonIcon,
  ForkKnifeIcon,
  HeartPulseIcon,
  UsersIcon,
  BoltIcon,
} from "@/components/ui/icons";

type IconCmp = (p: { className?: string; style?: CSSProperties }) => ReactElement;

/** Etiqueta, descripción e icono de cada dimensión causal. */
export const CAUSAS: Record<CausaKey, { label: string; descripcion: string; Icon: IconCmp }> = {
  sobrecarga: {
    label: "Sobrecarga laboral",
    descripcion: "Demasiadas horas, guardias o consultas seguidas.",
    Icon: ClipboardIcon,
  },
  descanso: {
    label: "Falta de descanso",
    descripcion: "Sueño insuficiente o recuperación pobre.",
    Icon: MoonIcon,
  },
  alimentacion: {
    label: "Alimentación y autocuidado",
    descripcion: "Comidas salteadas o poco autocuidado físico.",
    Icon: ForkKnifeIcon,
  },
  emocional: {
    label: "Carga emocional",
    descripcion: "Agotamiento emocional o desmotivación.",
    Icon: HeartPulseIcon,
  },
  aislamiento: {
    label: "Aislamiento y soporte",
    descripcion: "Falta de apoyo o red donde apoyarse.",
    Icon: UsersIcon,
  },
  autoexigencia: {
    label: "Autoexigencia",
    descripcion: "Presión propia por rendir cada vez más.",
    Icon: BoltIcon,
  },
};
