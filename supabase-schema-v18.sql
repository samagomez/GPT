-- ===== V18: catálogos de estudiantes y docentes =====
-- Ejecuta este script en Supabase > SQL Editor > New query.
-- Las políticas permiten acceso anónimo (demo/prototipo). Para producción, habilita Auth y restringe por usuario/rol.

create table if not exists public.catalogo_estudiantes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) between 1 and 80),
  apellido text not null check (length(trim(apellido)) between 1 and 80),
  grado text not null check (length(trim(grado)) between 1 and 50),
  seccion text not null check (length(trim(seccion)) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists catalogo_estudiantes_unico_uq
  on public.catalogo_estudiantes (lower(trim(nombre)), lower(trim(apellido)), grado, seccion);

create table if not exists public.catalogo_docentes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) between 1 and 80),
  apellido text not null check (length(trim(apellido)) between 1 and 80),
  grado text not null check (length(trim(grado)) between 1 and 50),
  seccion text not null check (length(trim(seccion)) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists catalogo_docentes_unico_uq
  on public.catalogo_docentes (lower(trim(nombre)), lower(trim(apellido)), grado, seccion);

alter table public.catalogo_estudiantes enable row level security;
alter table public.catalogo_docentes enable row level security;

grant select, insert, update on public.catalogo_estudiantes to anon, authenticated;
grant select, insert, update on public.catalogo_docentes to anon, authenticated;

drop policy if exists "Public demo can read students catalog" on public.catalogo_estudiantes;
create policy "Public demo can read students catalog" on public.catalogo_estudiantes for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert students catalog" on public.catalogo_estudiantes;
create policy "Public demo can insert students catalog" on public.catalogo_estudiantes for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update students catalog" on public.catalogo_estudiantes;
create policy "Public demo can update students catalog" on public.catalogo_estudiantes for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public demo can read teachers catalog" on public.catalogo_docentes;
create policy "Public demo can read teachers catalog" on public.catalogo_docentes for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert teachers catalog" on public.catalogo_docentes;
create policy "Public demo can insert teachers catalog" on public.catalogo_docentes for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update teachers catalog" on public.catalogo_docentes;
create policy "Public demo can update teachers catalog" on public.catalogo_docentes for update to anon, authenticated using (true) with check (true);
