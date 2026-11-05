-- Esquema da tabela de linhas telefônicas para o Supabase.
-- Rode isto no Supabase: Dashboard -> SQL Editor -> New query -> cole -> Run.

create table if not exists public.linhas (
  id               uuid primary key default gen_random_uuid(),
  numero           text unique not null,           -- canônico: 5514999999999
  numero_formatado text,                            -- (14) 99999-9999
  ddd              text,
  tipo             text,                            -- PRE_PAGA / POS_PAGA / CONTROLE
  status           text default 'ATIVA',
  operadora        text,
  plano            text,
  responsavel      text,
  setor            text,
  aparelho         text,
  cnpj             text,
  empresa          text,
  conta            text,                            -- conta da operadora
  valor_mensal     numeric(12,2) default 0,
  observacoes      text,
  atualizado_em    timestamptz default now()
);

-- Índices para busca rápida
create index if not exists idx_linhas_responsavel on public.linhas (responsavel);
create index if not exists idx_linhas_setor       on public.linhas (setor);
create index if not exists idx_linhas_cnpj        on public.linhas (cnpj);
create index if not exists idx_linhas_conta       on public.linhas (conta);

-- Atualiza "atualizado_em" automaticamente
create or replace function public.touch_atualizado_em()
returns trigger language plpgsql as $$
begin new.atualizado_em = now(); return new; end; $$;

drop trigger if exists trg_touch on public.linhas;
create trigger trg_touch before update on public.linhas
  for each row execute function public.touch_atualizado_em();

-- Segurança (RLS): habilitado. As policies ficam em policies-*.sql
alter table public.linhas enable row level security;
