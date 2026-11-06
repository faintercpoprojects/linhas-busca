# Busca de Linhas Telefônicas

Sistema web leve para **pesquisar as linhas da Vivo e seus responsáveis**, com os dados na nuvem (**Firebase / Firestore**). Página estática (HTML/JS), publicada no **GitHub Pages**, com **login** obrigatório.

🔗 **Acesso:** https://faintercpoprojects.github.io/linhas-busca/

## O que faz
- **Busca** instantânea por número, responsável, setor, empresa, conta, aparelho…
- **Filtros** por tipo (pré/pós/controle), setor, responsável e "só sem responsável".
- **Editar / adicionar** linhas — salva direto no Firestore.
- **Login** (Firebase Authentication) — só quem tem acesso vê os dados.

## Arquitetura
- **Front-end estático**: `index.html`, `app.js`, `style.css`, `config.js` (GitHub Pages).
- **Back-end**: **Firebase** — Firestore (banco, região São Paulo) + Authentication (e-mail/senha).
- **Segurança**: as regras (`firebase/firestore.rules`) liberam leitura/escrita **somente para usuários logados**. A `config.js` tem chaves públicas (por design); o que protege é o login + as regras.

## Projeto Firebase
- Projeto: `linhas-telefonicas` (conta tecnologia.unicpo@gmail.com)
- Coleção Firestore: `linhas`
- Login inicial: `tecnologia.unicpo@gmail.com` (troque a senha em Authentication → Users)

## Rodar localmente
Abra `index.html` no navegador (as chaves já estão em `config.js`).

## Seed (carga inicial dos dados)
Já foi feito. O script de upload (`seed.mjs`) e os dados (`seed-data.json`) **não** vão para o GitHub (contêm dados reais/senha). Para recarregar:
1. Gere o `seed-data.json` a partir do sistema local.
2. `npm install && node seed.mjs` (usa a biblioteca `firebase`).

## Gerenciar
- **Usuários/login**: Firebase Console → Authentication → Users.
- **Dados**: Firebase Console → Firestore → coleção `linhas` (ou pelo próprio app).
