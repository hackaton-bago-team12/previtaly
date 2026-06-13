/** Overlay a pantalla completa mientras la IA procesa el check-in. */
export function AnalyzingOverlay({
  title = "Analizando tu día…",
  subtitle = "Convirtiendo tu relato en métricas",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(240,244,242,.95)", gap: 24 }}
    >
      <div style={{ position: "relative", width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "5px solid var(--color-primary-light)", borderTopColor: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 12.5h4l1.5-3.5 2.6 7 1.6-3.5h4.3" /></svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text)" }}>{title}</div>
        <div style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginTop: 5 }}>{subtitle}</div>
      </div>
    </div>
  );
}
