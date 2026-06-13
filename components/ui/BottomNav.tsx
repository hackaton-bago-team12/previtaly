"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { HomeIcon, CalendarIcon, ChartIcon, UsersIcon, ClockIcon, LightbulbIcon, SignOutIcon } from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const medicoItems: NavItem[] = [
  {
    href: "/medico",
    label: "Inicio",
    icon: (a) => <HomeIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/calendario",
    label: "Agenda",
    icon: (a) => <CalendarIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/resultados",
    label: "Resultados",
    icon: (a) => <ChartIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/historial",
    label: "Historial",
    icon: (a) => <ClockIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
];

const analistaItems: NavItem[] = [
  {
    href: "/analista",
    label: "Médicos",
    icon: (a) => <UsersIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/analista/calendario",
    label: "Agenda",
    icon: (a) => <CalendarIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/analista/sugerencias",
    label: "Sugerencias",
    icon: (a) => <LightbulbIcon className={`h-5 w-5 ${a ? "stroke-[2.2]" : ""}`} />,
  },
];

export function BottomNav({
  role,
  signOutAction,
}: {
  role: "medico" | "analista";
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const items = role === "analista" ? analistaItems : medicoItems;

  const isActive = (href: string) => {
    if (href === "/medico" || href === "/analista") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px]"
              style={{
                color: active ? "var(--color-primary)" : "var(--color-text-subtle)",
                background: active ? "var(--color-primary-light)" : "transparent",
              }}
            >
              {item.icon(active)}
              <span className="text-[9px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}

        {/* Botón de logout */}
        <button
          onClick={() => startTransition(() => signOutAction())}
          disabled={isPending}
          className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px]"
          style={{ color: isPending ? "var(--color-text-subtle)" : "var(--color-risk-high)", background: "transparent" }}
          aria-label="Cerrar sesión"
        >
          <SignOutIcon className="h-5 w-5" />
          <span className="text-[9px] font-medium leading-tight">Salir</span>
        </button>
      </div>
    </nav>
  );
}
