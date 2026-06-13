# Previtaly

MVP para hackathon — plataforma para profesionales de la salud (Bago).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Auth + DB).

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto nuevo.
2. En **SQL Editor**, pegá y ejecutá el contenido de [`supabase/schema.sql`](./supabase/schema.sql)
   (crea la tabla `profiles`, las políticas RLS y el trigger que arma el perfil al registrarse).

### 3. Configurar variables de entorno

En **Project Settings → Data API** copiá la URL, y en **API Keys** la `publishable key`
(formato nuevo `sb_publishable_...`). Pegalas en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

> Mientras estas variables estén vacías, la app arranca igual y muestra un aviso
> de configuración en la pantalla de login.

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Autenticación

- **Registro** (`/signup`) y **login** (`/login`) con email + contraseña vía Supabase Auth.
- El `middleware.ts` refresca la sesión en cada request y protege `/dashboard`.
- `/auth/confirm` confirma el email desde el enlace que envía Supabase.

> **Tip hackathon:** para probar sin confirmar el email, desactivá
> *Authentication → Sign In / Providers → Email → Confirm email* en Supabase.

## Estructura

```
app/
  page.tsx              # redirige según haya sesión
  layout.tsx            # layout raíz (es, fuentes, branding)
  login/
    page.tsx            # formulario de login
    actions.ts          # server actions: login() y signup()
  signup/page.tsx       # formulario de registro
  dashboard/
    page.tsx            # panel protegido (server component)
    actions.ts          # server action: signOut()
  auth/confirm/route.ts # confirmación de email (OTP)
components/
  setup-notice.tsx      # aviso cuando falta configurar Supabase
lib/
  supabase/
    client.ts           # cliente para el navegador
    server.ts           # cliente para server components / actions
    middleware.ts       # refresco de sesión + protección de rutas
  utils.ts              # hasEnvVars
supabase/
  schema.sql            # tablas, RLS y triggers
```

## Próximos pasos

Construí tus pantallas dentro de `app/dashboard/` (agenda, perfil, estadísticas,
asistente). Usá `createClient()` de `lib/supabase/server.ts` en server components
y el de `lib/supabase/client.ts` en componentes interactivos.
