-- OPÇÃO B: LEITURA pública (qualquer um com o link pesquisa), ESCRITA só logado.
-- Use SOMENTE se puder expor a lista de linhas/responsáveis publicamente.
drop policy if exists "ler publico"          on public.linhas;
drop policy if exists "escrever autenticado" on public.linhas;

create policy "ler publico" on public.linhas
  for select to anon, authenticated using (true);

create policy "escrever autenticado" on public.linhas
  for all to authenticated using (true) with check (true);
