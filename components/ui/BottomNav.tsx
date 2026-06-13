"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  /** activo si el pathname coincide exacto (true) o por prefijo (false) */
  exact?: boolean;
  icon: React.ReactNode;
};

const medicoItems: NavItem[] = [
  {
    href: "/medico",
    label: "Inicio",
    exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></svg>
    ),
  },
  {
    href: "/medico/calendario",
    label: "Agenda",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
    ),
  },
  {
    href: "/medico/historial",
    label: "Historial",
    exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12a8.5 8.5 0 1 0 2.6-6" /><path d="M6.1 3v3.4h3.4" /><path d="M12 8v4.2l2.6 1.6" /></svg>
    ),
  },
  {
    href: "/medico/sugerencias",
    label: "Consejos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.4c.7.7 1 1.4 1 2.6h6c0-1.2.3-1.9 1-2.6A6 6 0 0 0 12 3Z" /></svg>
    ),
  },
];

const analistaItems: NavItem[] = [
  {
    href: "/analista",
    label: "Médicos",
    exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 19c0-2.8-2-4.5-4-4.5S8 16.2 8 19" /><circle cx="12" cy="9" r="3" /><path d="M3 19c0-2 1.3-3.3 2.8-3.7M21 19c0-2-1.3-3.3-2.8-3.7" /></svg>
    ),
  },
  {
    href: "/analista/calendario",
    label: "Agenda",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
    ),
  },
  {
    href: "/analista/sugerencias",
    label: "Sugerencias",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.4c.7.7 1 1.4 1 2.6h6c0-1.2.3-1.9 1-2.6A6 6 0 0 0 12 3Z" /></svg>
    ),
  },
];

/** Rutas que muestran la barra inferior (las demás son flujos/detalle). */
export function isNavRoute(role: "medico" | "analista", pathname: string): boolean {
  const items = role === "analista" ? analistaItems : medicoItems;
  return items.some((it) =>
    it.exact ? pathname === it.href : pathname.startsWith(it.href),
  );
}

export function BottomNav({
  role,
  widthClass = "max-w-md",
}: {
  role: "medico" | "analista";
  widthClass?: string;
}) {
  const pathname = usePathname();
  const items = role === "analista" ? analistaItems : medicoItems;

  if (!isNavRoute(role, pathname)) return null;

  const isActive = (it: NavItem) =>
    it.exact ? pathname === it.href : pathname.startsWith(it.href);

  return (
    <nav className={`bottom-nav ${widthClass} mx-auto`}>
      <div className="flex" style={{ padding: "8px 10px 22px" }}>
        {items.map((it) => {
          const active = isActive(it);
          return (
            <Link
              key={it.href}
              href={it.href}
              className="flex flex-col items-center gap-[5px] flex-1"
              style={{ padding: "6px 0", color: active ? "var(--color-primary)" : "var(--color-text-subtle)" }}
            >
              <span
                className="flex items-center justify-center"
                style={{
                  width: 46,
                  height: 28,
                  borderRadius: 14,
                  background: active ? "var(--color-primary-light)" : "transparent",
                }}
              >
                {it.icon}
              </span>
              <span style={{ fontSize: "10.5px", fontWeight: 600 }}>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
