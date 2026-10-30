-- V19.4: tabla Pagos
create table if not exists public."Pagos" (
  id uuid primary key default gen_random_uuid(),
  "NumRegistro" text not null unique,
  "estudiante" text not null,
  "fechaPago" date not null,
  "detallePago" text not null,
  "MoraTotal" numeric(10,2) not null default 0,
  "PagoTotal" numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

alter table public."Pagos" enable row level security;
grant select, insert on public."Pagos" to anon, authenticated;

drop policy if exists "Public demo can read pagos" on public."Pagos";
create policy "Public demo can read pagos" on public."Pagos" for select to anon, authenticated using (true);
drop policy if exists "Public demo can insert pagos" on public."Pagos";
create policy "Public demo can insert pagos" on public."Pagos" for insert to anon, authenticated with check (true);
