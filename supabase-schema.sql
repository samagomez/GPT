-- Ejecuta este script en Supabase > SQL Editor > New query.
-- Estas políticas permiten acceso anónimo de lectura/escritura a los catálogos.
-- Úsalas solo para una demo o prototipo público. Para producción, habilita Auth y restringe las políticas por usuario/rol.

create table if not exists public.catalogo_materiales (
  id uuid primary key default gen_random_uuid(),
  concepto text not null check (length(trim(concepto)) between 1 and 100),
  monto numeric(10,2) not null check (monto > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalogo_mensualidades (
  id uuid primary key default gen_random_uuid(),
  concepto text not null check (length(trim(concepto)) between 1 and 100),
  monto numeric(10,2) not null check (monto > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.catalogo_materiales enable row level security;
alter table public.catalogo_mensualidades enable row level security;

grant select, insert, update on public.catalogo_materiales to anon, authenticated;
grant select, insert, update on public.catalogo_mensualidades to anon, authenticated;

drop policy if exists "Public demo can read materials catalog" on public.catalogo_materiales;
create policy "Public demo can read materials catalog" on public.catalogo_materiales for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert materials catalog" on public.catalogo_materiales;
create policy "Public demo can insert materials catalog" on public.catalogo_materiales for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update materials catalog" on public.catalogo_materiales;
create policy "Public demo can update materials catalog" on public.catalogo_materiales for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public demo can read monthly fees catalog" on public.catalogo_mensualidades;
create policy "Public demo can read monthly fees catalog" on public.catalogo_mensualidades for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert monthly fees catalog" on public.catalogo_mensualidades;
create policy "Public demo can insert monthly fees catalog" on public.catalogo_mensualidades for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update monthly fees catalog" on public.catalogo_mensualidades;
create policy "Public demo can update monthly fees catalog" on public.catalogo_mensualidades for update to anon, authenticated using (true) with check (true);

-- ===== V17: catálogos de grados y secciones =====
create table if not exists public.catalogo_grados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists catalogo_grados_nombre_uq on public.catalogo_grados (lower(trim(nombre)));

create table if not exists public.catalogo_secciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists catalogo_secciones_nombre_uq on public.catalogo_secciones (lower(trim(nombre)));

alter table public.catalogo_grados enable row level security;
alter table public.catalogo_secciones enable row level security;

grant select, insert, update on public.catalogo_grados to anon, authenticated;
grant select, insert, update on public.catalogo_secciones to anon, authenticated;

drop policy if exists "Public demo can read grades catalog" on public.catalogo_grados;
create policy "Public demo can read grades catalog" on public.catalogo_grados for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert grades catalog" on public.catalogo_grados;
create policy "Public demo can insert grades catalog" on public.catalogo_grados for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update grades catalog" on public.catalogo_grados;
create policy "Public demo can update grades catalog" on public.catalogo_grados for update to anon, authenticated using (true) with check (true);

drop policy if exists "Public demo can read sections catalog" on public.catalogo_secciones;
create policy "Public demo can read sections catalog" on public.catalogo_secciones for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert sections catalog" on public.catalogo_secciones;
create policy "Public demo can insert sections catalog" on public.catalogo_secciones for insert to anon, authenticated with check (true);
drop policy if exists "Public demo can update sections catalog" on public.catalogo_secciones;
create policy "Public demo can update sections catalog" on public.catalogo_secciones for update to anon, authenticated using (true) with check (true);

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
