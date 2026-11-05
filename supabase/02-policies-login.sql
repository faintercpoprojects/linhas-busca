-- OPÇÃO A (RECOMENDADA): acesso só para usuários LOGADOS.
-- Ninguém sem login lê ou escreve. Crie usuários em Authentication -> Users.
drop policy if exists "ler autenticado"      on public.linhas;
drop policy if exists "escrever autenticado" on public.linhas;

create policy "ler autenticado" on public.linhas
  for select to authenticated using (true);

create policy "escrever autenticado" on public.linhas
  for all to authenticated using (true) with check (true);
