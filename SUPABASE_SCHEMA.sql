
-- Tabela de Peças
create table parts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  brand text not null,
  model text not null,
  year text not null,
  color text not null,
  category text not null,
  condition text not null,
  price_suggested numeric(10,2) default 0,
  price_cost numeric(10,2) default 0,
  quantity integer default 0,
  location text not null,
  observations text,
  images text[] default '{}'
);

-- Tabela de Movimentações de Estoque
create table stock_movements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  part_id uuid references parts(id) on delete cascade not null,
  quantity_change integer not null,
  type text check (type in ('entrada', 'saida', 'ajuste')) not null,
  reason text
);

-- Configurar Storage
-- Crie um bucket chamado 'part-images' no Supabase Storage e torne-o público.

-- Habilitar RLS (Opcional, mas recomendado para produção)
-- Por enquanto, como é um dashboard interno rápido, você pode deixar desabilitado 
-- ou criar políticas que permitem tudo para usuários autenticados.
