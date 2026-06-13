"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MicIcon, CalendarIcon, ChartIcon, LightbulbIcon, UsersIcon } from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const medicoItems: NavItem[] = [
  {
    href: "/medico",
    label: "Inicio",
    icon: (a) => <HomeIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/calendario",
    label: "Agenda",
    icon: (a) => <CalendarIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/resultados",
    label: "Resultados",
    icon: (a) => <ChartIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/medico/sugerencias",
    label: "Sugerencias",
    icon: (a) => <LightbulbIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
];

const analistaItems: NavItem[] = [
  {
    href: "/analista",
    label: "Médicos",
    icon: (a) => <UsersIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/analista/calendario",
    label: "Agenda",
    icon: (a) => <CalendarIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
  {
    href: "/analista/sugerencias",
    label: "Sugerencias",
    icon: (a) => <LightbulbIcon className={`h-6 w-6 ${a ? "stroke-[2.2]" : ""}`} />,
  },
];

export function BottomNav({ role }: { role: "medico" | "analista" }) {
  const pathname = usePathname();
  const items = role === "analista" ? analistaItems : medicoItems;

  const isActive = (href: string) => {
    if (href === "/medico" || href === "/analista") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[60px]"
              style={{
                color: active ? "var(--color-primary)" : "var(--color-text-subtle)",
                background: active ? "var(--color-primary-lt)" : "transparent",
              }}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
