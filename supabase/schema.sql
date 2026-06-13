-- ===========================================================================
-- Previtaly · Esquema base de Supabase
-- Ejecutá este script en: Supabase Dashboard → SQL Editor → New query
-- ===========================================================================

-- Tabla de perfiles, 1:1 con auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  specialty   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Row Level Security: cada usuario solo ve y edita su propio perfil
alter table public.profiles enable row level security;

drop policy if exists "Los perfiles son visibles por su dueño" on public.profiles;
create policy "Los perfiles son visibles por su dueño"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "El usuario puede insertar su perfil" on public.profiles;
create policy "El usuario puede insertar su perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "El usuario puede actualizar su perfil" on public.profiles;
create policy "El usuario puede actualizar su perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea automáticamente un perfil cuando se registra un usuario nuevo,
-- tomando el nombre completo del metadata del signUp.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
