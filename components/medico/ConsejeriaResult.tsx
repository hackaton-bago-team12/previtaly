import Link from "next/link";
import { BackButton } from "@/components/ui/BackButton";
import { ConsejosCards, SeguimientoBanner, type Sugerencia } from "./ConsejosCards";
import { relativeDia } from "@/lib/fecha";

/** Pantalla de resultado de una Consejería (fresca o detalle del historial). */
export function ConsejeriaResult({
  fecha,
  sugerencias,
  nivelRiesgo,
  backHref,
  ctaHref,
  ctaLabel,
}: {
  fecha: string;
  sugerencias: Sugerencia[];
  nivelRiesgo?: "bajo" | "medio" | "alto" | null;
  backHref: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  const mostrarSeguimiento = nivelRiesgo === "medio" || nivelRiesgo === "alto";

  return (
    <div style={{ padding: "74px 22px 30px", animation: "screenIn .35s ease" }}>
      <BackButton href={backHref} />

      <div style={{ fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--color-text-subtle)", fontWeight: 600 }}>
        Consejería · {relativeDia(fecha)}
      </div>
      <h1 style={{ margin: "8px 0 4px", fontSize: 23, fontWeight: 700, letterSpacing: "-.02em", color: "var(--color-text)" }}>Tu consejería del día</h1>
      <p style={{ margin: "0 0 20px", fontSize: 14.5, color: "var(--color-text-muted)", lineHeight: 1.45 }}>
        Según tu jornada, esto es lo que más te va a ayudar.
      </p>

      <ConsejosCards sugerencias={sugerencias} />
      {mostrarSeguimiento && <SeguimientoBanner />}

      <Link href={ctaHref} className="flex items-center justify-center" style={{ width: "100%", background: "var(--color-primary)", color: "#fff", borderRadius: 14, padding: 16, fontSize: 15.5, fontWeight: 600, marginTop: 18 }}>
        {ctaLabel}
      </Link>
    </div>
  );
}
