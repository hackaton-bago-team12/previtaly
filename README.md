<div align="center">

# 🩺 Previtaly

### Bienestar y prevención de burnout para médicos

Check-in diario por voz → una IA lo convierte en un **Índice de Pulso** y métricas de estado.
La clínica monitorea el bienestar de su equipo y actúa antes de que alguien colapse.

`Next.js 16` · `React 19` · `TypeScript` · `Tailwind v4` · `Supabase` · `Azure`

</div>

---

## 📑 Tabla de contenido

- [¿Qué es?](#-qué-es)
- [Stack](#-stack)
- [Arquitectura](#-arquitectura)
- [Puesta en marcha](#-puesta-en-marcha)
- [Variables de entorno](#-variables-de-entorno)
- [Servicio de IA](#-servicio-de-ia)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Deploy](#-deploy)
- [Scripts](#-scripts)

---

## 🧭 ¿Qué es?

Previtaly es un MVP (producto de **Bago**) con **dos roles**:

| Rol | Quién es | Qué hace |
|-----|----------|----------|
| 👨‍⚕️ **Médico** (`role = 'medico'`) | Profesional de la salud | Análisis y Consejería del día por voz, ve su resultado, historial y consejos |
| 🏥 **Analista** (`role = 'analista'`) | La clínica | Monitorea el bienestar del equipo, gestiona guardias y recibe alertas |

**Índice de Pulso:** número 0–100 que resume el bienestar del día, con métricas
(concentración, estrés, energía, carga), **nivel de riesgo** (bajo/medio/alto),
**tendencia** y **causa principal**.

---

## 🧱 Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (design tokens en `app/globals.css`)
- **Supabase** — Auth (email + contraseña) y Postgres con RLS
- **Microservicio de IA** aparte ([`previtaly-ai`](https://github.com/hackaton-bago-team12/previtaly-ai)) — Azure Speech + Azure OpenAI
- **Deploy:** Docker → Azure Container Registry → Azure App Service (vía GitHub Actions)

---

## 🗺️ Arquitectura

### Flujo principal (médico)
```
Inicio ──▶ Análisis del Día ──▶ voz/datos ──▶ IA ──▶ Resultado (Índice de Pulso)
   └─────▶ Consejería del Día ─▶ voz ───────▶ IA ──▶ Consejos
                                              │
                          ai_analysis (tipo) ─┴─▶ Historial (con detalle por tipo)
```

### Rutas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing pública (o redirige según sesión/rol) |
| `/login`, `/signup` | Auth y registro por rol |
| `/medico` | Inicio: Análisis / Consejería del día + racha |
| `/medico/analisis`, `/medico/consejeria` | Flujos por voz |
| `/medico/resultados`, `/medico/historial`, `/medico/historial/[id]` | Resultado y historial |
| `/medico/sugerencias`, `/medico/calendario` | Consejos y agenda |
| `/analista`, `/analista/calendario`, `/analista/sugerencias` | Panel de la clínica |
| `/auth/confirm`, `/auth/callback` | Confirmación de email / OAuth |

La sesión se refresca en `proxy.ts` (convención de Next 16) y protege las rutas privadas.

---

## 🚀 Puesta en marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el proyecto en Supabase
1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutá [`supabase/schema.sql`](./supabase/schema.sql)
   (tablas, RLS, funciones y triggers).

### 3. Configurar variables de entorno
Copiá `.env.example` a `.env.local` y completá los valores (ver [abajo](#-variables-de-entorno)).

### 4. Correr en desarrollo
```bash
npm run dev
```
Abrí **http://localhost:3000**.

> Mientras falten las variables de Supabase, la app arranca igual y muestra un
> aviso de configuración en el login.

---

## 🔑 Variables de entorno

`.env.local` (no se versiona):

```env
# Supabase (Project Settings → Data API / API Keys)
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# Microservicio de IA (opcional en local; si falta, usa un mock determinístico)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_KEY=el-mismo-INTERNAL_API_KEY-del-ai-service
```

| Variable | Pública | Para qué |
|----------|:------:|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ | Llave publicable (cliente) |
| `AI_SERVICE_URL` | ❌ | Endpoint del microservicio de IA |
| `AI_SERVICE_KEY` | ❌ | Secreto compartido con el servicio de IA |

---

## 🤖 Servicio de IA

El análisis y las sugerencias los genera el microservicio
[`previtaly-ai`](https://github.com/hackaton-bago-team12/previtaly-ai) (FastAPI + Azure).
La integración vive en `lib/ai-service.ts`: si el servicio no está configurado o falla,
**cae automáticamente a un mock determinístico** (`lib/mock-analysis.ts`), así la app
nunca se rompe.

---

## 📁 Estructura del proyecto

```
app/
  page.tsx                  # landing / redirección por rol
  login/  signup/           # auth y registro
  medico/                   # rol médico (inicio, análisis, consejería, resultados, historial, consejos, agenda)
  analista/                 # rol clínica (dashboard, sugerencias, agenda)
  auth/                     # confirm / callback
components/
  ui/                       # BottomNav, SettingsSheet, BackButton, charts, icons…
  medico/                   # AnalisisResult, ConsejeriaResult, ConsejosCards
  voice/VoiceRecorder.tsx   # grabador (Web Speech API) con fallback de texto
  landing/Landing.tsx       # landing pública
lib/
  supabase/                 # clientes browser / server / proxy
  ai-service.ts             # llamada al microservicio (con fallback a mock)
  mock-analysis.ts          # análisis determinístico de respaldo
  causas.ts, trayectoria.ts # motor de causas y predicción
supabase/schema.sql         # esquema completo (tablas, RLS, funciones)
proxy.ts                    # refresco de sesión + protección de rutas
Dockerfile                  # imagen de producción
.github/workflows/deploy.yml# CD a Azure
```

---

## ☁️ Deploy

CD automático con **GitHub Actions** en cada push a **`main`**:

```
push a main → build Docker → push a Azure Container Registry → App Service se actualiza solo
```

- Web en vivo: `https://previtaly-web-dgqyt3.azurewebsites.net`
- Secret requerido en el repo: `ACR_PASSWORD`
- Las variables `NEXT_PUBLIC_*` se inyectan en build (ver `.github/workflows/deploy.yml`).

---

## 📜 Scripts

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint |

---

<div align="center">
<sub>Hecho para la hackathon de Bago · equipo 12</sub>
</div>
