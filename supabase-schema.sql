-- Ejecuta este script en Supabase > SQL Editor > New query.
-- Estas políticas permiten acceso anónimo de lectura/escritura a estos dos catálogos.
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
