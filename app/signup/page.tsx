import Link from "next/link";
import { HeartPulseIcon } from "@/components/ui/icons";

export default function SignupRolePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12"
          style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
               style={{ background: "var(--color-primary)" }}>
            <HeartPulseIcon className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Previtaly
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-muted)" }}>
              ¿Cómo vas a usar la plataforma?
            </p>
          </div>
        </div>

        {/* Role cards */}
        <div className="space-y-4">
          <Link href="/signup/medico">
            <div className="card cursor-pointer transition-all hover:shadow-md active:scale-95"
                 style={{ borderColor: "var(--color-primary-soft)" }}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                     style={{ background: "var(--color-primary-lt)" }}>
                  🩺
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                    Soy médico
                  </p>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Registro mi bienestar y carga laboral diaria
                  </p>
                </div>
                <svg className="ml-auto h-5 w-5 flex-shrink-0" style={{ color: "var(--color-text-subtle)" }}
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link href="/signup/analista">
            <div className="card cursor-pointer transition-all hover:shadow-md active:scale-95"
                 style={{ borderColor: "var(--color-primary-soft)" }}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                     style={{ background: "var(--color-primary-lt)" }}>
                  📊
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                    Soy analista
                  </p>
                  <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    Monitoreo el estado del equipo médico de mi clínica
                  </p>
                </div>
                <svg className="ml-auto h-5 w-5 flex-shrink-0" style={{ color: "var(--color-text-subtle)" }}
                     fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-medium underline underline-offset-2"
                style={{ color: "var(--color-primary)" }}>
            Iniciá sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
