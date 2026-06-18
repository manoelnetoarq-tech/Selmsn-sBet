-- Habilitar a extensão para UUIDs se necessário
create extension if not exists "uuid-ossp";

-- Criação da tabela de perfis (profiles)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  avatar text,
  role text default 'Membro da Resenha',
  total_bets integer default 0,
  total_points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- Trigger para criar perfil automaticamente após signup no auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabela de Partidas (matches)
create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  team_home text not null,
  team_away text not null,
  flag_home text,
  flag_away text,
  "group" text,
  date_str text,
  status text default 'Aberto',
  prize text,
  prize_image text,
  score_home integer,
  score_away integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;
create policy "Matches viewable by everyone" on public.matches for select using (true);
create policy "Matches editable by everyone temporarily" on public.matches for all using (true);

-- Tabela de Palpites (predictions)
create table if not exists public.predictions (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score_home integer not null,
  score_away integer not null,
  bet_value integer,
  points_calculated integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_match_user unique (match_id, user_id)
);

alter table public.predictions enable row level security;
create policy "Predictions viewable by everyone" on public.predictions for select using (true);
create policy "Users can insert own predictions" on public.predictions for insert with check (auth.uid() = user_id);
create policy "Users can update own predictions" on public.predictions for update using (auth.uid() = user_id);
create policy "Users can delete own predictions" on public.predictions for delete using (auth.uid() = user_id);


-- ==========================================
-- SCRIPT DE STORAGE (AVATARES E BANDEIRAS)
-- (Pode rodar apenas esta parte separadamente se as tabelas acima já existirem)
-- ==========================================

-- AVATARES
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible." 
on storage.objects for select using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar." 
on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

create policy "Anyone can update an avatar." 
on storage.objects for update with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );


-- BANDEIRAS (FLAGS)
insert into storage.buckets (id, name, public) 
values ('flags', 'flags', true)
on conflict (id) do nothing;

create policy "Flags images are publicly accessible." 
on storage.objects for select using ( bucket_id = 'flags' );

create policy "Anyone can upload a flag." 
on storage.objects for insert with check ( bucket_id = 'flags' and auth.role() = 'authenticated' );

create policy "Anyone can update a flag." 
on storage.objects for update with check ( bucket_id = 'flags' and auth.role() = 'authenticated' );


-- PRIZES (PRÊMIOS)
insert into storage.buckets (id, name, public) 
values ('prizes', 'prizes', true)
on conflict (id) do nothing;

create policy "Prizes images are publicly accessible." 
on storage.objects for select using ( bucket_id = 'prizes' );

create policy "Anyone can upload a prize image." 
on storage.objects for insert with check ( bucket_id = 'prizes' and auth.role() = 'authenticated' );

create policy "Anyone can update a prize image." 
on storage.objects for update with check ( bucket_id = 'prizes' and auth.role() = 'authenticated' );

-- ==========================================
-- SCRIPT DE ADMINISTRAÇÃO
-- ==========================================
-- Rodar este script manualmente no SQL Editor para dar acesso de administrador (Gestor) a um e-mail específico:
-- (Certifique-se de que o usuário já se cadastrou no app antes de rodar isso)
update public.profiles
set role = 'Admin da Resenha'
where email = 'manoel.neto.arq@gmail.com';

-- ==========================================
-- TABELA DE NOTIFICAÇÕES (PUSH SUBSCRIPTIONS)
-- ==========================================
create table if not exists public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_endpoint unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;
create policy "Users can insert own subscriptions" on public.push_subscriptions for insert with check (auth.uid() = user_id);
create policy "Users can view own subscriptions" on public.push_subscriptions for select using (auth.uid() = user_id);
create policy "Users can delete own subscriptions" on public.push_subscriptions for delete using (auth.uid() = user_id);
