-- ===========================================================================
-- Previtaly · Esquema completo de Supabase
-- Ejecutá este script en: Supabase Dashboard → SQL Editor → New query
-- ===========================================================================

-- ── Tabla de clínicas ──────────────────────────────────────────────────────
create table if not exists public.clinics (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  code       text unique not null,  -- ej. "BAGO-4721"
  created_at timestamptz not null default now()
);

alter table public.clinics enable row level security;

-- Cualquiera puede insertar una clínica (el analista aún no tiene sesión al registrarse)
drop policy if exists "Cualquiera puede crear una clinica" on public.clinics;
create policy "Cualquiera puede crear una clinica"
  on public.clinics for insert
  with check (true);

-- ── Función para buscar clínica por código sin restricciones de RLS ─────────
-- Necesaria para el registro de médicos, que aún no tienen perfil vinculado.
create or replace function public.get_clinic_by_code(p_code text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.clinics where code = p_code limit 1;
$$;

-- ── Función para crear clínica sin restricciones de RLS ─────────────────────
create or replace function public.create_clinic(p_name text, p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.clinics (name, code)
  values (p_name, p_code)
  returning id into v_id;
  return v_id;
end;
$$;

-- ── Funciones helper con security definer (evitan recursión en RLS) ────────
create or replace function public.my_clinic_id()
returns uuid
language sql
security definer
stable
as $$
  select clinic_id from public.profiles where id = auth.uid()
$$;

create or replace function public.my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── Tabla de perfiles ──────────────────────────────────────────────────────
-- (La política SELECT de clinics se crea más abajo, después de profiles)
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  specialty   text,
  avatar_url  text,
  role        text not null default 'medico' check (role in ('medico', 'analista')),
  clinic_id   uuid references public.clinics(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Los perfiles son visibles por su dueño" on public.profiles;
create policy "Los perfiles son visibles por su dueño"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "El analista ve los perfiles de su clinica" on public.profiles;
create policy "El analista ve los perfiles de su clinica"
  on public.profiles for select
  using (
    public.my_role() = 'analista'
    and clinic_id = public.my_clinic_id()
  );

drop policy if exists "El usuario puede insertar su perfil" on public.profiles;
create policy "El usuario puede insertar su perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "El usuario puede actualizar su perfil" on public.profiles;
create policy "El usuario puede actualizar su perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Política SELECT de clinics (requiere que profiles ya exista)
drop policy if exists "Usuarios ven su propia clinica" on public.clinics;
create policy "Usuarios ven su propia clinica"
  on public.clinics for select
  using (
    id in (
      select clinic_id from public.profiles where id = auth.uid()
    )
  );

-- ── Check-ins diarios del médico ───────────────────────────────────────────
create table if not exists public.daily_checkins (
  id                uuid primary key default gen_random_uuid(),
  medico_id         uuid not null references auth.users(id) on delete cascade,
  fecha             date not null default current_date,
  transcripcion_voz text,
  comidas           smallint check (comidas between 1 and 3),
  energia           smallint check (energia between 1 and 10),
  actividad_fisica  smallint check (actividad_fisica between 1 and 10),
  modo              text check (modo in ('completo', 'express')) default 'completo',
  created_at        timestamptz not null default now()
);
-- Migración para bases ya creadas:
--   alter table public.daily_checkins
--     add column if not exists modo text
--       check (modo in ('completo','express')) default 'completo';

alter table public.daily_checkins enable row level security;

drop policy if exists "Medico gestiona sus checkins" on public.daily_checkins;
create policy "Medico gestiona sus checkins"
  on public.daily_checkins for all
  using (auth.uid() = medico_id)
  with check (auth.uid() = medico_id);

drop policy if exists "Analista lee checkins de su clinica" on public.daily_checkins;
create policy "Analista lee checkins de su clinica"
  on public.daily_checkins for select
  using (
    exists (
      select 1 from public.profiles analista
      join public.profiles medico on medico.clinic_id = analista.clinic_id
      where analista.id = auth.uid()
        and analista.role = 'analista'
        and medico.id = daily_checkins.medico_id
    )
  );

-- ── Análisis IA ────────────────────────────────────────────────────────────
create table if not exists public.ai_analysis (
  id                  uuid primary key default gen_random_uuid(),
  checkin_id          uuid references public.daily_checkins(id) on delete cascade,
  medico_id           uuid not null references auth.users(id) on delete cascade,
  fecha               date not null,
  indice_pulso        smallint check (indice_pulso between 0 and 100),
  concentracion       smallint check (concentracion between 0 and 100),
  estres              smallint check (estres between 0 and 100),
  capacidad_restante  smallint check (capacidad_restante between 0 and 100),
  carga_acumulada     smallint check (carga_acumulada between 0 and 100),
  nivel_riesgo        text check (nivel_riesgo in ('bajo', 'medio', 'alto')),
  detectados          jsonb not null default '[]',
  sugerencias         jsonb not null default '[]',
  tendencia           text check (tendencia in ('subiendo', 'estable', 'bajando')) default 'estable',
  causa_principal     text check (causa_principal in ('sobrecarga','descanso','alimentacion','emocional','aislamiento','autoexigencia')),
  factores            jsonb not null default '[]',
  created_at          timestamptz not null default now()
);

-- Migración para bases ya creadas (ejecutar una vez en Supabase → SQL Editor):
--   alter table public.ai_analysis
--     add column if not exists causa_principal text
--       check (causa_principal in ('sobrecarga','descanso','alimentacion','emocional','aislamiento','autoexigencia')),
--     add column if not exists factores jsonb not null default '[]';

alter table public.ai_analysis enable row level security;

drop policy if exists "Medico ve su propio analisis" on public.ai_analysis;
create policy "Medico ve su propio analisis"
  on public.ai_analysis for all
  using (auth.uid() = medico_id)
  with check (auth.uid() = medico_id);

drop policy if exists "Analista lee analisis de su clinica" on public.ai_analysis;
create policy "Analista lee analisis de su clinica"
  on public.ai_analysis for select
  using (
    exists (
      select 1 from public.profiles analista
      join public.profiles medico on medico.clinic_id = analista.clinic_id
      where analista.id = auth.uid()
        and analista.role = 'analista'
        and medico.id = ai_analysis.medico_id
    )
  );

-- ── Turnos / Citas del médico ──────────────────────────────────────────────
create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  medico_id    uuid not null references auth.users(id) on delete cascade,
  titulo       text not null,
  descripcion  text,
  fecha_inicio timestamptz not null,
  fecha_fin    timestamptz not null,
  tipo         text not null default 'consulta' check (tipo in ('consulta', 'cirugia', 'guardia', 'reunion', 'otro')),
  paciente     text,
  created_at   timestamptz not null default now()
);

alter table public.appointments enable row level security;

drop policy if exists "Medico gestiona sus turnos" on public.appointments;
create policy "Medico gestiona sus turnos"
  on public.appointments for all
  using (auth.uid() = medico_id)
  with check (auth.uid() = medico_id);

drop policy if exists "Analista lee turnos de su clinica" on public.appointments;
create policy "Analista lee turnos de su clinica"
  on public.appointments for select
  using (
    exists (
      select 1 from public.profiles analista
      join public.profiles medico on medico.clinic_id = analista.clinic_id
      where analista.id = auth.uid()
        and analista.role = 'analista'
        and medico.id = appointments.medico_id
    )
  );

-- ── Guardias extra ─────────────────────────────────────────────────────────
create table if not exists public.extra_shifts (
  id                  uuid primary key default gen_random_uuid(),
  clinic_id           uuid not null references public.clinics(id) on delete cascade,
  titulo              text not null,
  fecha_inicio        timestamptz not null,
  fecha_fin           timestamptz not null,
  medico_asignado_id  uuid references auth.users(id),
  bloqueado           boolean not null default false,
  motivo_bloqueo      text,
  created_at          timestamptz not null default now()
);

alter table public.extra_shifts enable row level security;

drop policy if exists "Analista gestiona guardias de su clinica" on public.extra_shifts;
create policy "Analista gestiona guardias de su clinica"
  on public.extra_shifts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'analista'
        and clinic_id = extra_shifts.clinic_id
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'analista'
        and clinic_id = extra_shifts.clinic_id
    )
  );

drop policy if exists "Medico ve guardias de su clinica" on public.extra_shifts;
create policy "Medico ve guardias de su clinica"
  on public.extra_shifts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
        and role = 'medico'
        and clinic_id = extra_shifts.clinic_id
    )
  );

-- ── Trigger: crear perfil al registrarse ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, clinic_id, specialty)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'medico'),
    (new.raw_user_meta_data ->> 'clinic_id')::uuid,
    new.raw_user_meta_data ->> 'specialty'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
