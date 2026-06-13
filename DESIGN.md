# Previtaly — Documento de Diseño

> Brief de diseño para Claude. Cubre el contexto del producto, el sistema de
> diseño, cada pantalla (estado actual) y **los cambios solicitados** (sección 6).
> App **mobile-first** (contenedor `max-w-md`, ~390px), en español (es-AR).

---

## 1. Qué es Previtaly

Plataforma de **bienestar y prevención de burnout para médicos** (producto de Bago,
MVP de hackathon). El médico hace un *check-in* diario hablando ~20 segundos; una IA
convierte ese relato + unos pocos datos en un **"Índice de Pulso"** y métricas de
estado. La clínica (rol *analista*) ve el bienestar agregado de su equipo y puede
actuar antes de que alguien colapse.

### Dos roles
| Rol | Quién es | Qué hace |
|-----|----------|----------|
| **Médico** (`role = 'medico'`) | Profesional de la salud | Check-in diario por voz, ve sus resultados, historial y consejos |
| **Analista** (`role = 'analista'`) | La clínica | Monitorea el bienestar del equipo, gestiona guardias, recibe alertas |

### Concepto clave: el "Índice de Pulso"
Número 0–100 que resume el bienestar del día. Se acompaña de métricas
(concentración, estrés, energía restante, carga acumulada), un **nivel de riesgo**
(bajo / medio / alto), una **tendencia** (subiendo / estable / bajando) y una
**causa principal** (sobrecarga, descanso, alimentación, emocional, aislamiento,
autoexigencia).

---

## 2. Sistema de diseño

### Paleta (tokens reales en `app/globals.css`)
Estética **forest green + sage**, clínica y serena.

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg` | `#f0f4f2` | Fondo de la app |
| `--color-bg-card` | `#ffffff` | Tarjetas |
| `--color-primary` | `#2d5246` | Verde bosque — color de marca, botones, activos |
| `--color-primary-mid` | `#3d6b5a` | Hover de primario |
| `--color-primary-light` | `#e8f0ec` | Fondos suaves, chips activos |
| `--color-primary-soft` | `#c8ddd5` | Bordes suaves, dots inactivos |
| `--color-text` | `#1a2e26` | Texto principal |
| `--color-text-muted` | `#5a7268` | Texto secundario |
| `--color-text-subtle` | `#8fa89f` | Texto terciario / labels |
| `--color-border` | `#dce8e2` | Bordes |
| `--color-risk-low` / `-bg` | `#2d7a4e` / `#dcfce7` | Riesgo bajo (verde) |
| `--color-risk-mid` / `-bg` | `#b45309` / `#fef3c7` | Riesgo medio (ámbar) |
| `--color-risk-high` / `-bg` | `#b91c1c` / `#fee2e2` | Riesgo alto (rojo) |
| `--radius-card` | `1rem` | Radio de tarjetas |
| `--radius-btn` | `0.75rem` | Radio de botones |

> **Regla de color de métricas:** en Bienestar/Concentración/Energía *más = mejor*
> (verde alto); en Estrés/Carga *menos = mejor* (color invertido).

Tipografía: **Geist Sans** (`--font-sans`), mono Geist Mono. Antialiased.

### Clases utilitarias (en `globals.css`)
- `.card` — tarjeta blanca, borde `--color-border`, radio 1rem, padding 1.25rem.
- `.btn-primary` — botón sólido verde, ancho completo, peso 600.
- `.btn-ghost` — botón texto con subrayado, color primario.
- `.input` — campo de formulario con focus ring `--color-primary-light`.
- `.bottom-nav` — barra inferior fija; `.safe-pb` reserva el espacio del contenido.
- Prefijo `.lp-*` — **exclusivo de la landing** (tema propio, animaciones EKG).

### Componentes reutilizables (`components/ui/`)
- **`PulseChart`** — gráfico de área+línea con gradiente (tendencia del Índice).
- **`SparkLine`** — mini-línea para listas/dashboards.
- **`DonutChart`** — anillo 0–100 con valor central y `delta` opcional (vs. ayer).
- **`PerformanceCurveChart`** — rendimiento vs. horas trabajadas (zonas óptimo /
  fatiga / crítico).
- **`RiskBadge`** / **`RiskChip`** — badge/chip de nivel de riesgo con semáforo y
  flecha de tendencia.
- **`ProgressBar`** — barra horizontal 0–100 con color automático.
- **`SelectField`** — dropdown custom para formularios.
- **`BottomNav`** — navegación inferior por rol.
- **`VoiceRecorder`** — grabador por **Web Speech API** (`es-AR`, mantener presionado
  para hablar, transcripción en vivo; si el navegador no soporta, permite escribir).
- **`AnalysisIcon`** — resuelve iconos por nombre string (`"breath"`, `"activity"`,
  `"water"`, etc.) usado en sugerencias/detecciones.

### Iconos disponibles (`components/ui/icons.tsx`, stroke 1.8, 24×24)
`HeartPulse, Mic, Chat, Calendar, Chart, Lightbulb, Users, Home, ChevronRight,
Plus, Trash, SignOut, Clock, CreditCard, CheckCircle, ShieldCheck, Check,
Stethoscope, Building, Clipboard, Lifebuoy, Leaf, Wind, Moon, Refresh, Activity,
ForkKnife, Droplet, Bolt, Alert`.

### Principios visuales
- Mobile-first, una columna, `max-w-md` centrado.
- Jerarquía: label en `uppercase tracking-widest` + `--color-text-subtle`, título
  en bold, cuerpo en `--color-text-muted`.
- Acciones primarias siempre como `.btn-primary` ancho completo abajo.
- Nada de emojis en UI: iconos SVG dibujados (incluso las caritas de ánimo).
- Respeta `prefers-reduced-motion` (la landing desactiva animaciones).

---

## 3. Modelo de datos (Supabase)

| Tabla | Campos clave | Notas |
|-------|--------------|-------|
| `clinics` | `id, name, code` (ej. `BAGO-4721`) | Código de invitación |
| `profiles` | `id, full_name, specialty, role, clinic_id, avatar_url` | 1:1 con `auth.users`, creado por trigger |
| `daily_checkins` | `medico_id, fecha, transcripcion_voz, comidas, energia, actividad_fisica, modo('completo'|'express')` | Input crudo del check-in |
| `ai_analysis` | `medico_id, checkin_id, fecha, indice_pulso, concentracion, estres, capacidad_restante, carga_acumulada, nivel_riesgo, tendencia, detectados[], sugerencias[], causa_principal, factores[]` | Salida de la IA |
| `appointments` | `medico_id, titulo, descripcion, paciente, tipo, fecha_inicio, fecha_fin` | Agenda del médico |
| `extra_shifts` | `clinic_id, titulo, fecha_inicio, fecha_fin, medico_asignado_id, bloqueado, motivo_bloqueo` | Guardias extra de la clínica |

RLS activo: el médico solo ve lo suyo; el analista ve los datos de su `clinic_id`.
La IA vive en `lib/ai-service.ts` (microservicio externo opcional con **fallback a
mock determinístico** `lib/mock-analysis.ts`, nunca rompe la app).

---

## 4. Navegación

### Estado ACTUAL
**Médico** (`BottomNav`): `Inicio · Agenda · Resultados · Historial · Consejos` + botón **Salir** (rojo).
**Analista**: `Médicos · Agenda · Sugerencias` + botón **Salir**.

### Estado PROPUESTO (ver sección 6)
**Médico**: `Inicio · Agenda · Historial · Consejos` — se fusiona Resultados→Historial
y **se elimina "Salir"** del nav. Configuración pasa a un **botón flotante arriba a la
derecha** (engranaje) presente en todas las pantallas.

---

## 5. Pantallas — estado actual

### PÚBLICAS

**`/` Landing** (`components/landing/Landing.tsx`)
Hero con línea EKG animada → Problema (3 cifras) → Cómo funciona (3 pasos) → "Tu
Índice de Pulso" (mockup de resultado) → bloque "Para clínicas" → CTA + footer.
Si hay sesión, redirige a `/medico` o `/analista` según rol.

**`/login`** — Logo, botón Google (`GoogleButton`), divisor "o con tu email", form
(email + contraseña), avisos de error/registro. Redirige según rol del perfil.

**`/signup`** — Elección de rol: tarjeta "Soy médico" / "Soy una clínica".
**`/signup/medico`** — nombre, especialidad (`SelectField`), email, contraseña,
**código de clínica**.
**`/signup/analista`** — wizard 4 pasos: plan (Básico/Avanzado) → datos → pago
(simulado) → éxito con **código de clínica** para compartir.

---

### ROL MÉDICO

**`/medico` — Inicio / Check-in** (`CheckinClient.tsx`)
Header "Preva" + indicador de pasos. Flujo multi-step:
- **voice**: saludo "Hola, Dr. {nombre}", título "¿Cómo estuvo tu día?", botón de
  micrófono grande (mantener presionado). Atajos: "Responder en 10 segundos" (modo
  express) y "Prefiero responder rápido".
- **details/quick**: comidas (1–3), energía (slider 1–10), actividad (slider 1–10),
  muestra la transcripción, botón "Analizar mi día →".
- **express**: 5 caritas de ánimo (SVG), un toque y listo.
Escribe en `daily_checkins`, dispara la IA → `ai_analysis`.

**`/medico/resultados` — "Tu día, analizado"**
El análisis del último check-in: `RiskBadge`, **Causa principal** con factores
(barras), **Métricas del día** (donuts vs. ayer), **Rendimiento vs. horas
trabajadas** (curva; cruza horas del calendario y horas mencionadas en la voz),
**Qué detecté** (chips), **Tendencia** (línea), **Proyección** (días hasta zona
alta). CTAs a Consejos / Historial / nuevo check-in.

**`/medico/historial` — "Historial de bienestar"**
Últimos 30 registros: gráfico de evolución (`PulseChart`), promedios (donuts),
**timeline** de registros (tarjeta por día con cabecera coloreada por riesgo,
mini-barras de métricas, chips de señales, badge "Express").

**`/medico/sugerencias` — "Tu plan de hoy"**
Sugerencias IA del último análisis: **acción primaria** (tarjeta verde destacada) +
secundarias (tarjetas). Bloque fijo "Técnicas de bienestar" (respiración 4-7-8,
caminata, hidratación). Si riesgo **alto**: bloque rojo "Evaluación recomendada".

**`/medico/calendario` — Agenda**
Turnos del día (de `appointments` o mock "CRM"), alta/baja de turnos propios
(form con título, paciente, tipo, horas), pills de resumen.

---

### ROL ANALISTA

**`/analista` — Dashboard de la clínica**
Header con nombre + código de clínica. Pills (sin datos / riesgo medio / alto),
banner de médicos en descenso (predicción), **"Por qué sube el equipo"** (ranking de
causas con barras), lista de médicos ordenada por riesgo (avatar, riesgo, índice,
sparkline de 5 registros).

**`/analista/sugerencias` — Estado de la clínica**
Grid de KPIs (bienestar prom., estrés prom., alto riesgo, check-ins hoy), "Qué
detectamos" (cards por severidad), "Acciones sugeridas" (con urgencia).

**`/analista/calendario` — Agenda clínica**
Tabs Agenda / Guardias extra. Filtro por médico (con dot de riesgo). Alta de
guardias y **asignación bloqueada** si el médico está en riesgo alto o energía <30%.

---

## 6. CAMBIOS SOLICITADOS  ⬅️ implementar

> Cuatro cambios. Mantener **siempre** la paleta verde bosque y los componentes
> existentes. Mobile-first.

### 6.1 — Rediseñar la pantalla de Inicio: 2 acciones simples

Hoy el Inicio es directamente el flujo de check-in por voz. **Cambio:** el Inicio
debe ser una **pantalla simple que ofrece 2 opciones** (los "2 tipos de análisis"):

1. **Análisis del Día** → el check-in de bienestar actual (voz + datos → métricas,
   riesgo, causa). Es el flujo que hoy vive en `/medico` + resultado en
   `/medico/resultados`.
2. **Consejería del Día** → un análisis orientado a **recomendaciones/consejos**
   personalizados a partir del relato del día.

Ambas acciones, al terminar de analizar, llevan a una **pantalla de resultado
directa** (ver 6.3) y ese resultado **queda guardado en el Historial**.

```
┌──────────────────────────────┐
│ ◔ Preva              ⚙ (6.4) │   ← engranaje flotante arriba-derecha
│                              │
│  Hola, Dr. Gael              │
│  ¿Qué querés hacer hoy?      │
│                              │
│  ┌────────────────────────┐  │
│  │ 〰  Análisis del Día    │  │   ← tarjeta grande, icono HeartPulse/Chart
│  │ Contame cómo estuvo tu │  │
│  │ día y lo analizo  →    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 💡 Consejería del Día   │  │   ← tarjeta grande, icono Lightbulb/Chat
│  │ Recomendaciones según  │  │
│  │ tu jornada        →    │  │
│  └────────────────────────┘  │
│                              │
├──────────────────────────────┤
│ Inicio  Agenda  Historial  Consejos │  ← nav (sin "Salir")
└──────────────────────────────┘
```

- Dos tarjetas tipo `.card` grandes, con icono en cuadro `--color-primary-lt`,
  título bold y subtítulo `--color-text-muted`, chevron a la derecha.
- "Análisis del Día" abre el flujo de voz actual (`CheckinClient`).
- "Consejería del Día" abre un flujo análogo (voz / relato) cuyo resultado es una
  lista de consejos (reutiliza la estética de `/medico/sugerencias`).

### 6.2 — Fusionar **Resultados** + **Historial** en una sola sección

**Por qué:** el Historial es, en realidad, el **conjunto de resultados del día**, y
como hay **2 tipos de análisis**, conviven en el mismo lugar.

- Eliminar **Resultados** como ítem de navegación.
- **Historial** pasa a ser el listado de todos los resultados (de ambos tipos),
  ordenados por fecha. Cada tarjeta indica su **tipo** (badge "Análisis" /
  "Consejería") junto al badge "Express" ya existente.
- Sugerencia de datos: agregar `tipo text check (tipo in ('analisis','consejeria'))`
  a `ai_analysis` (o tabla equivalente) para distinguirlos. Filtros/segmentos
  opcionales arriba del listado ("Todos · Análisis · Consejería").

### 6.3 — Resultado en pantalla directa + recordar desde Historial

- Al terminar de analizar el diálogo, mostrar el resultado en una **pantalla
  directa** (no es un ítem del nav): para "Análisis" reutilizar la vista de
  `/medico/resultados`; para "Consejería" la vista de consejos.
- Esa pantalla incluye un CTA tipo "Listo" que vuelve al Inicio.
- Para **recordar** un resultado pasado, el usuario entra a **Historial** y toca la
  tarjeta → abre la **misma vista de detalle** de ese resultado.
- Ruta sugerida: `/medico/historial/[id]` (detalle según `tipo`).

### 6.4 — Quitar "Salir" del nav → botón flotante de **Configuración**

El botón **Salir** del bottom nav "no es dinámico y queda raro". **Cambio:**

- **Eliminar** el botón "Salir" de `BottomNav` (médico y analista).
- Agregar un **botón flotante de configuración** (icono engranaje) **arriba a la
  derecha**, presente en todas las pantallas del rol (idealmente en el `layout`).
- Al tocarlo abre un panel/hoja (sheet o menú) con **opciones típicas de cuenta**,
  misma paleta verde:
  - Perfil (nombre, especialidad, avatar)
  - Mi cuenta / datos
  - Notificaciones
  - Cambiar contraseña
  - Ayuda / soporte
  - **Cerrar sesión** (acá vive ahora el logout, en rojo `--color-risk-high`)

```
                                    ┌─────────────┐
   ⚙  ← flotante, top-right         │ Perfil       │
                                    │ Mi cuenta    │
   (al tocar abre →)                │ Notificac.   │
                                    │ Contraseña   │
                                    │ Ayuda        │
                                    │ ───────────  │
                                    │ Cerrar sesión│ (rojo)
                                    └─────────────┘
```

- Estilo del botón: círculo/cuadrado redondeado, fondo `--color-bg-card` con borde
  `--color-border` o `--color-primary` sutil, icono en `--color-primary`. Sombra
  suave. No tapar el contenido (respetar safe area / header).

### Resumen de impacto por archivo (orientativo)
- `components/ui/BottomNav.tsx` — quitar botón Salir; nav médico = Inicio/Agenda/
  Historial/Consejos.
- `app/medico/layout.tsx` y `app/analista/layout.tsx` — agregar botón flotante de
  configuración + panel de cuenta (mover ahí el `signOut`).
- `app/medico/page.tsx` — convertir en la pantalla de 2 acciones.
- Nuevo flujo "Consejería del Día" + su pantalla de resultado.
- `app/medico/historial/` — listar ambos tipos + detalle `/[id]`; retirar Resultados
  del nav (la vista de resultados se reusa como detalle).
- `supabase/schema.sql` — columna `tipo` en `ai_analysis` (o nueva tabla de consejería).

---

## 7. Tono y voz
Cercano, en **vos** (es-AR), respetuoso y no alarmista. El riesgo se comunica con
cuidado ("no es una señal de debilidad — es parte del protocolo de cuidado"). Los
textos de IA cierran con "+ Generado por IA según tu estado y carga".
