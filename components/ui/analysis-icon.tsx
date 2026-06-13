import type { CSSProperties, ReactElement } from "react";
import {
  ChatIcon,
  ForkKnifeIcon,
  BoltIcon,
  ClipboardIcon,
  CheckIcon,
  WindIcon,
  LifebuoyIcon,
  MoonIcon,
  RefreshIcon,
  ActivityIcon,
  DropletIcon,
  LeafIcon,
  AlertIcon,
  LightbulbIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
} from "@/components/ui/icons";

type IconCmp = (p: { className?: string; style?: CSSProperties }) => ReactElement;

/**
 * Mapa de icono por CLAVE semántica (lo nuevo) o por EMOJI (compatibilidad con
 * datos viejos y respuestas de la IA). Así NUNCA renderizamos un emoji crudo.
 */
const MAP: Record<string, IconCmp> = {
  // claves semánticas
  chat: ChatIcon,
  food: ForkKnifeIcon,
  energy: BoltIcon,
  clipboard: ClipboardIcon,
  ok: CheckIcon,
  breath: WindIcon,
  support: LifebuoyIcon,
  rest: MoonIcon,
  refresh: RefreshIcon,
  activity: ActivityIcon,
  water: DropletIcon,
  leaf: LeafIcon,
  alert: AlertIcon,
  idea: LightbulbIcon,
  calendar: CalendarIcon,
  team: UsersIcon,
  // emojis -> icono (fallback de compatibilidad)
  "💬": ChatIcon,
  "🗣️": ChatIcon,
  "🍽️": ForkKnifeIcon,
  "🍎": ForkKnifeIcon,
  "⚡": BoltIcon,
  "📋": ClipboardIcon,
  "✅": CheckIcon,
  "✓": CheckIcon,
  "🌬️": WindIcon,
  "🧠": LifebuoyIcon,
  "🌙": MoonIcon,
  "🔄": RefreshIcon,
  "🏃": ActivityIcon,
  "🚶": ActivityIcon,
  "💧": DropletIcon,
  "🧘": LeafIcon,
  "💡": LightbulbIcon,
  "⚠️": AlertIcon,
  "🚫": AlertIcon,
  "📊": ClipboardIcon,
  "👥": UsersIcon,
  "📅": CalendarIcon,
  "🏥": BuildingIcon,
};

export function AnalysisIcon({
  name,
  className,
  style,
}: {
  name?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Cmp = (name && MAP[name]) || ClipboardIcon;
  return <Cmp className={className} style={style} />;
}

/** Punto de color para indicar nivel de riesgo (reemplaza 🔴🟡🟢). */
export function StatusDot({
  level,
  className,
}: {
  level: "bajo" | "medio" | "alto";
  className?: string;
}) {
  const color =
    level === "alto"
      ? "var(--color-risk-high)"
      : level === "medio"
        ? "var(--color-risk-mid)"
        : "var(--color-risk-low)";
  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "0.625rem",
        height: "0.625rem",
        borderRadius: "9999px",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}
