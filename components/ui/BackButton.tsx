"use client";

import Link from "next/link";

const base: React.CSSProperties = {
  position: "absolute",
  top: 14,
  left: 16,
  zIndex: 20,
  width: 42,
  height: 42,
  borderRadius: 13,
  background: "#fff",
  border: "1px solid var(--color-border)",
  color: "var(--color-primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 14px -4px rgba(26,46,38,.22)",
};

const Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
);

/** Botón flotante "volver" (arriba-izquierda). Pasá `href` o `onClick`. */
export function BackButton({ href, onClick }: { href?: string; onClick?: () => void }) {
  if (href) {
    return (
      <Link href={href} aria-label="Volver" style={base}>
        <Icon />
      </Link>
    );
  }
  return (
    <button type="button" aria-label="Volver" onClick={onClick} style={base}>
      <Icon />
    </button>
  );
}
