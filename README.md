# Busca de Linhas Telefônicas

Sistema web leve para **pesquisar as linhas da Vivo e seus responsáveis**, com os dados salvos no **Supabase** (nuvem). Página estática (HTML/JS), fácil de publicar no GitHub Pages.

## Funciona assim
- **Busca** instantânea por número, responsável, setor, empresa, conta, aparelho…
- **Filtros** por tipo (pré/pós/controle), setor, responsável e "só sem responsável".
- **Editar / adicionar** linhas — salva direto no Supabase.
- **Login** opcional (recomendado, por serem dados internos).

## Configurar (uma vez)

### 1. Criar o projeto no Supabase
1. Acesse https://supabase.com → **Start your project** (grátis) → crie um projeto.
2. Em **Project Settings → API**, copie:
   - **Project URL**
   - chave **anon public**

### 2. Criar a tabela e subir os dados
No Supabase: **SQL Editor → New query**, cole e rode, nesta ordem:
1. `supabase/01-schema.sql` — cria a tabela `linhas`.
2. **Escolha o acesso:**
   - `supabase/02-policies-login.sql` → **só quem tem login** vê/edita (recomendado).
   - `supabase/02-policies-publico.sql` → leitura pública, edição só logado.
3. `supabase/03-seed.sql` — insere as 62 linhas atuais.

### 3. (Se escolheu login) criar usuários
Supabase → **Authentication → Users → Add user** — crie o e-mail/senha de quem vai acessar.

### 4. Apontar o app para o seu Supabase
Abra `config.js` e preencha `SUPABASE_URL`, `SUPABASE_ANON` e `EXIGIR_LOGIN`.

### 5. Rodar
Abra o `index.html` no navegador, ou publique no GitHub Pages.

## Segurança
- A chave **anon** é pública por design; a proteção real vem das **policies (RLS)** do Supabase e do **login**.
- Nunca coloque a chave **service_role** no `config.js` nem no GitHub.
- Para dados internos, use a opção **login** e mantenha o repositório **privado**.
