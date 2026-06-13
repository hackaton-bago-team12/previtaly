"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { isNavRoute } from "./BottomNav";

export function SettingsSheet({
  role,
  name,
  subtitle,
  initial,
  signOutAction,
  widthClass = "max-w-md",
}: {
  role: "medico" | "analista";
  name: string;
  subtitle: string;
  initial: string;
  signOutAction: () => Promise<void>;
  widthClass?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // El engranaje sólo aparece en las pantallas con barra de navegación.
  if (!isNavRoute(role, pathname)) return null;

  return (
    <>
      {/* Engranaje flotante, anclado arriba-derecha de la columna centrada */}
      <div className="fixed inset-x-0 top-0 z-30 pointer-events-none">
        <div className={`${widthClass} mx-auto relative`}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Configuración"
            className="pointer-events-auto absolute flex items-center justify-center"
            style={{
              top: 14,
              right: 16,
              width: 42,
              height: 42,
              borderRadius: 13,
              background: "#fff",
              border: "1px solid var(--color-border)",
              color: "var(--color-primary)",
              boxShadow: "0 4px 14px -4px rgba(26,46,38,.22)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2.6l1.2 1.9 2.2-.5.6 2.2 2 1-.7 2.1 1.5 1.7-1.5 1.7.7 2.1-2 1-.6 2.2-2.2-.5L12 21.4l-1.2-1.9-2.2.5-.6-2.2-2-1 .7-2.1L5 12l-1.5-1.7.7-2.1 2-1 .6-2.2 2.2.5Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hoja de configuración */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[60] flex items-end"
          style={{ background: "rgba(20,36,30,.4)", animation: "fadeIn .2s ease" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${widthClass} mx-auto`}
            style={{
              background: "var(--color-bg)",
              borderRadius: "28px 28px 0 0",
              padding: "10px 22px calc(30px + env(safe-area-inset-bottom,0px))",
              animation: "sheetUp .28s cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div style={{ width: 42, height: 5, borderRadius: 3, background: "var(--color-primary-soft)", margin: "8px auto 18px" }} />

            {/* Perfil */}
            <div className="flex items-center gap-[14px]" style={{ marginBottom: 20 }}>
              <div
                className="flex items-center justify-center"
                style={{ width: 54, height: 54, borderRadius: 16, background: "var(--color-primary)", color: "#fff", fontSize: 20, fontWeight: 700 }}
              >
                {initial}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>{name}</div>
                <div style={{ fontSize: 13.5, color: "var(--color-text-muted)" }}>{subtitle}</div>
              </div>
            </div>

            {/* Cerrar sesión */}
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => signOutAction())}
              className="flex w-full items-center justify-center gap-[9px]"
              style={{
                background: "var(--color-risk-high-bg)",
                color: "var(--color-risk-high)",
                border: "none",
                borderRadius: 14,
                padding: 15,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                opacity: pending ? 0.6 : 1,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4H6v16h8" /><path d="M11 12h9M17 8l4 4-4 4" /></svg>
              {pending ? "Cerrando…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
