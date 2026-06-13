"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon } from "@/components/ui/icons";

/**
 * Dropdown con diseño propio (reemplaza al <select> nativo).
 * Mantiene un <input type="hidden" name=...> para enviarse en formularios.
 */
export function SelectField({
  name,
  label,
  options,
  placeholder = "Seleccioná una opción",
  defaultValue = "",
}: {
  name: string;
  label: string;
  options: string[];
  placeholder?: string;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </span>
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between"
        style={{ cursor: "pointer", color: value ? "var(--color-text)" : "var(--color-text-subtle)" }}
      >
        <span>{value || placeholder}</span>
        <svg
          className="h-4 w-4 shrink-0"
          style={{ color: "var(--color-text-subtle)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute z-30 mt-1.5 max-h-64 w-full overflow-auto rounded-xl border py-1 shadow-lg"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-card)" }}
        >
          {options.map((opt) => {
            const selected = value === opt;
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { setValue(opt); setOpen(false); }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                    selected ? "bg-[var(--color-primary-light)]" : "hover:bg-[var(--color-primary-light)]"
                  }`}
                  style={{ color: "var(--color-text)" }}
                >
                  {opt}
                  {selected && <CheckIcon className="h-4 w-4" style={{ color: "var(--color-primary)" }} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
