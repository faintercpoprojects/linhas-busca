// ---------------------------------------------------------------------------
// Configuração do Supabase.
// Preencha com os dados do SEU projeto: Supabase -> Project Settings -> API.
//   - SUPABASE_URL  = "Project URL"      (ex.: https://abcdefgh.supabase.co)
//   - SUPABASE_ANON = "anon public" key  (chave pública — pode ficar no GitHub)
//
// A chave "anon" é pública por design; a proteção real vem das policies (RLS)
// e do login. NUNCA coloque aqui a chave "service_role".
// ---------------------------------------------------------------------------
window.CONFIG = {
  SUPABASE_URL: "COLE_AQUI_O_PROJECT_URL",
  SUPABASE_ANON: "COLE_AQUI_A_ANON_KEY",

  // true  = exige login (recomendado p/ dados internos) -> use 02-policies-login.sql
  // false = busca pública sem login                     -> use 02-policies-publico.sql
  EXIGIR_LOGIN: true,
};
