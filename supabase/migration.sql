-- =============================================
-- ARCANA TAROT — Migration completa v5
-- Execute TODO no SQL Editor do Supabase
-- Primeiro rode o DROP abaixo se já tiver tabelas antigas
-- =============================================

-- LIMPAR TUDO (rode isso primeiro se já existirem tabelas):
-- drop table if exists orders cascade;
-- drop table if exists lesson_progress cascade;
-- drop table if exists enrollments cascade;
-- drop table if exists coupons cascade;
-- drop table if exists lessons cascade;
-- drop table if exists modules cascade;
-- drop table if exists courses cascade;
-- drop table if exists seller_profiles cascade;
-- drop table if exists profiles cascade;
-- drop view if exists courses_view cascade;
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists handle_new_user cascade;
-- drop function if exists update_course_totals cascade;

create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('seller', 'student', 'admin')),
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "leitura_publica" on profiles;
drop policy if exists "editar_proprio" on profiles;
drop policy if exists "inserir_perfil" on profiles;

create policy "leitura_publica" on profiles for select using (true);
create policy "editar_proprio" on profiles for update using (auth.uid() = id);
create policy "inserir_perfil" on profiles for insert with check (true);

-- Trigger cria perfil automaticamente ao registrar
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- SELLER PROFILES
-- =============================================
create table if not exists seller_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade unique not null,
  bio text,
  website text,
  payment_gateway text check (payment_gateway in ('stripe', 'mercadopago')),
  stripe_account_id text,
  mercadopago_access_token text,
  bank_name text,
  bank_agency text,
  bank_account text,
  bank_account_type text check (bank_account_type in ('checking', 'savings')),
  cpf_cnpj text,
  pix_key text,
  pix_key_type text check (pix_key_type in ('cpf', 'cnpj', 'email', 'phone', 'random')),
  created_at timestamptz default now()
);

alter table seller_profiles enable row level security;

drop policy if exists "seller_gerencia" on seller_profiles;
drop policy if exists "admin_acessa" on seller_profiles;

create policy "seller_gerencia" on seller_profiles
  for all using (auth.uid() = user_id);

create policy "admin_acessa" on seller_profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'seller'))
  );

-- =============================================
-- COURSES
-- =============================================
create table if not exists courses (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  description text not null default '',
  short_description text,
  cover_image_url text,
  price numeric(10,2) not null default 0,
  is_published boolean not null default false,
  category text,
  tags text[] default '{}',
  what_you_learn text[] default '{}',
  requirements text[] default '{}',
  target_audience text,
  total_modules int not null default 0,
  total_lessons int not null default 0,
  total_duration_minutes int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table courses enable row level security;

drop policy if exists "cursos_publicos" on courses;
drop policy if exists "seller_gerencia_cursos" on courses;

create policy "cursos_publicos" on courses
  for select using (is_published = true);

create policy "seller_gerencia_cursos" on courses
  for all using (
    auth.uid() = seller_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- =============================================
-- MODULES
-- =============================================
create table if not exists modules (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

alter table modules enable row level security;

drop policy if exists "modulos_publicos" on modules;
drop policy if exists "seller_gerencia_modulos" on modules;

create policy "modulos_publicos" on modules
  for select using (
    exists (select 1 from courses where id = modules.course_id and is_published = true)
  );

create policy "seller_gerencia_modulos" on modules
  for all using (
    exists (
      select 1 from courses where id = modules.course_id
      and (seller_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- =============================================
-- LESSONS
-- =============================================
create table if not exists lessons (
  id uuid default uuid_generate_v4() primary key,
  module_id uuid references modules(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  description text,
  video_url text,
  video_duration_minutes numeric(5,1),
  order_index int not null default 0,
  is_preview boolean not null default false,
  material_url text,
  created_at timestamptz default now()
);

alter table lessons enable row level security;

drop policy if exists "aulas_publicas" on lessons;
drop policy if exists "seller_gerencia_aulas" on lessons;

create policy "aulas_publicas" on lessons
  for select using (
    is_preview = true
    or exists (select 1 from courses where id = lessons.course_id and is_published = true)
  );

create policy "seller_gerencia_aulas" on lessons
  for all using (
    exists (
      select 1 from courses where id = lessons.course_id
      and (seller_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- =============================================
-- COUPONS
-- =============================================
create table if not exists coupons (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete set null,
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null,
  max_uses int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  unique (seller_id, code)
);

alter table coupons enable row level security;

drop policy if exists "seller_gerencia_cupons" on coupons;
drop policy if exists "cupons_publicos" on coupons;

create policy "seller_gerencia_cupons" on coupons
  for all using (
    auth.uid() = seller_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "cupons_publicos" on coupons
  for select using (is_active = true);

-- =============================================
-- ENROLLMENTS
-- =============================================
create table if not exists enrollments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  progress_percent numeric(5,2) not null default 0,
  unique (student_id, course_id)
);

alter table enrollments enable row level security;

drop policy if exists "aluno_ve_matriculas" on enrollments;
drop policy if exists "seller_ve_matriculas" on enrollments;
drop policy if exists "sistema_gerencia_matriculas" on enrollments;

create policy "aluno_ve_matriculas" on enrollments
  for select using (auth.uid() = student_id);

create policy "seller_ve_matriculas" on enrollments
  for select using (
    exists (
      select 1 from courses where id = enrollments.course_id
      and (seller_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "sistema_gerencia_matriculas" on enrollments
  for all with check (true);

-- =============================================
-- LESSON PROGRESS
-- =============================================
create table if not exists lesson_progress (
  id uuid default uuid_generate_v4() primary key,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique (enrollment_id, lesson_id)
);

alter table lesson_progress enable row level security;

drop policy if exists "aluno_gerencia_progresso" on lesson_progress;

create policy "aluno_gerencia_progresso" on lesson_progress
  for all using (auth.uid() = student_id);

-- =============================================
-- ORDERS
-- =============================================
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references profiles(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  seller_id uuid references profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  payment_method text check (payment_method in ('card', 'pix', 'boleto')),
  payment_gateway text check (payment_gateway in ('stripe', 'mercadopago')),
  gateway_payment_id text,
  coupon_id uuid references coupons(id) on delete set null,
  discount_amount numeric(10,2) not null default 0,
  created_at timestamptz default now(),
  paid_at timestamptz
);

alter table orders enable row level security;

drop policy if exists "aluno_ve_pedidos" on orders;
drop policy if exists "seller_ve_pedidos" on orders;
drop policy if exists "sistema_gerencia_pedidos" on orders;

create policy "aluno_ve_pedidos" on orders
  for select using (auth.uid() = student_id);

create policy "seller_ve_pedidos" on orders
  for select using (
    auth.uid() = seller_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "sistema_gerencia_pedidos" on orders
  for all with check (true);

-- =============================================
-- STORAGE BUCKETS
-- =============================================
insert into storage.buckets (id, name, public)
  values ('course-covers', 'course-covers', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('lesson-videos', 'lesson-videos', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('lesson-materials', 'lesson-materials', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true) on conflict (id) do nothing;

do $$ begin
  create policy "upload_capas" on storage.objects
    for insert with check (bucket_id = 'course-covers' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "capas_publicas" on storage.objects
    for select using (bucket_id = 'course-covers');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "upload_videos" on storage.objects
    for insert with check (bucket_id = 'lesson-videos' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "videos_autenticados" on storage.objects
    for select using (bucket_id = 'lesson-videos' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;

-- =============================================
-- FUNÇÕES
-- =============================================
create or replace function update_course_totals(p_course_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update courses set
    total_modules = (select count(*) from modules where course_id = p_course_id),
    total_lessons = (select count(*) from lessons where course_id = p_course_id),
    total_duration_minutes = (select coalesce(sum(video_duration_minutes), 0) from lessons where course_id = p_course_id),
    updated_at = now()
  where id = p_course_id;
end;
$$;
