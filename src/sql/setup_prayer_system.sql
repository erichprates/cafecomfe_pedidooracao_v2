-- Primeiro remover tabelas existentes se necessário
drop table if exists prayer_interactions cascade;
drop table if exists prayer_requests cascade;

-- Criar tabela de pedidos de oração
create table prayer_requests (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  title varchar(100) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de interações (quem está orando)
create table prayer_interactions (
  id bigint primary key generated always as identity,
  request_id bigint references prayer_requests(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(request_id, user_id)
);

-- Criar índices
create index prayer_requests_user_id_idx on prayer_requests(user_id);
create index prayer_interactions_request_id_idx on prayer_interactions(request_id);

-- Habilitar RLS
alter table prayer_requests enable row level security;
alter table prayer_interactions enable row level security;

-- Criar políticas
create policy "Todos podem ver pedidos"
  on prayer_requests for select
  to authenticated
  using (true);

create policy "Usuários podem criar pedidos"
  on prayer_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar seus pedidos"
  on prayer_requests for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Todos podem ver interações"
  on prayer_interactions for select
  to authenticated
  using (true);

create policy "Usuários podem gerenciar suas interações"
  on prayer_interactions for all
  to authenticated
  using (auth.uid() = user_id);