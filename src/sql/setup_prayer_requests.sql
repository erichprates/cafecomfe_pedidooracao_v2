-- Criar tabela de pedidos de oração
create table if not exists prayer_requests (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null,
  title varchar(100) not null,
  description varchar(500),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar tabela de interações com pedidos de oração
create table if not exists prayer_interactions (
  id bigint primary key generated always as identity,
  prayer_request_id bigint references prayer_requests(id) not null,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(prayer_request_id, user_id)
);

-- Criar índices
create index prayer_requests_user_id_idx on prayer_requests(user_id);
create index prayer_requests_created_at_idx on prayer_requests(created_at);
create index prayer_interactions_prayer_request_id_idx on prayer_interactions(prayer_request_id);
create index prayer_interactions_user_id_idx on prayer_interactions(user_id);

-- Habilitar RLS
alter table prayer_requests enable row level security;
alter table prayer_interactions enable row level security;

-- Criar políticas de segurança
create policy "Todos podem ver pedidos de oração"
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

create policy "Todos podem ver interações"
  on prayer_interactions for select
  to authenticated
  using (true);

create policy "Usuários podem criar/deletar suas próprias interações"
  on prayer_interactions for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);