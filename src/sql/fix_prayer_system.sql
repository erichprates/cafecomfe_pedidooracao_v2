-- Primeiro, remover tabelas existentes
drop table if exists prayer_interactions cascade;
drop table if exists prayer_requests cascade;

-- Criar tabela de pedidos de oração com relacionamento correto com profiles
create table prayer_requests (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id),
  title varchar(100) not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de interações com relacionamentos corretos
create table prayer_interactions (
  id bigint primary key generated always as identity,
  prayer_request_id bigint not null references prayer_requests(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(prayer_request_id, user_id)
);

-- Criar índices para melhor performance
create index prayer_requests_user_id_idx on prayer_requests(user_id);
create index prayer_requests_created_at_idx on prayer_requests(created_at);
create index prayer_interactions_prayer_request_id_idx on prayer_interactions(prayer_request_id);
create index prayer_interactions_user_id_idx on prayer_interactions(user_id);

-- Habilitar RLS
alter table prayer_requests enable row level security;
alter table prayer_interactions enable row level security;

-- Criar políticas de segurança
create policy "Usuários autenticados podem ver todos os pedidos"
  on prayer_requests for select
  to authenticated
  using (true);

create policy "Usuários podem criar seus próprios pedidos"
  on prayer_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar seus próprios pedidos"
  on prayer_requests for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuários autenticados podem ver todas as interações"
  on prayer_interactions for select
  to authenticated
  using (true);

create policy "Usuários podem criar suas próprias interações"
  on prayer_interactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias interações"
  on prayer_interactions for delete
  to authenticated
  using (auth.uid() = user_id);