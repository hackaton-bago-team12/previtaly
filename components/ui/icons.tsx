import type { CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

export function HeartPulseIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 12h3l2-5 3 9 2-4h5" />
    </svg>
  );
}

export function MicIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

export function ChatIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 10.5h8M8 14h5m-8.5 5.5L3 21V6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H8.5a2 2 0 00-1.4.58z" />
    </svg>
  );
}

export function CalendarIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export function ChartIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export function LightbulbIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

export function UsersIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export function HomeIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

export function ChevronRightIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function PlusIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

export function TrashIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export function SignOutIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

export function ClockIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function CreditCardIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

export function CheckCircleIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function ShieldCheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

export function CheckIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export function StethoscopeIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3v5a5 5 0 0010 0V3" />
      <path d="M5 3h2M13 3h2" />
      <path d="M10 13v2a6 6 0 0012 0" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

export function BuildingIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V5a2 2 0 012-2h12a2 2 0 012 2v16M2 21h20M9 21v-4h6v4" />
      <path d="M12 6v4M10 8h4" />
    </svg>
  );
}

export function ClipboardIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

export function LifebuoyIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M5.6 5.6l3.3 3.3m6.2 6.2l3.3 3.3m0-12.8l-3.3 3.3m-6.2 6.2l-3.3 3.3" />
    </svg>
  );
}

export function LeafIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

export function WindIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
    </svg>
  );
}

export function MoonIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export function RefreshIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0115.5-6.36L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.36L3 16M3 21v-5h5" />
    </svg>
  );
}

export function ActivityIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function ForkKnifeIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3v6a2 2 0 004 0V3M6 11v10M17 3c-1.66 0-3 1.79-3 4v5h3m0-9v18" />
    </svg>
  );
}

export function DropletIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  );
}

export function BoltIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

export function AlertIcon({ className, style }: IconProps) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor"
         strokeWidth={1.8} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4m0 4h.01" />
    </svg>
  );
}
