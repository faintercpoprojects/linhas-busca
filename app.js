/* ===========================================================================
   App de busca de linhas telefônicas — Supabase + JS puro.
   =========================================================================== */
(function () {
  "use strict";

  const cfg = window.CONFIG || {};
  const configurado =
    cfg.SUPABASE_URL &&
    cfg.SUPABASE_ANON &&
    !cfg.SUPABASE_URL.includes("COLE_AQUI") &&
    !cfg.SUPABASE_ANON.includes("COLE_AQUI");

  if (!configurado) {
    document.body.innerHTML =
      '<div style="max-width:560px;margin:60px auto;padding:24px;font-family:system-ui;line-height:1.6">' +
      "<h2>⚙️ Falta configurar o Supabase</h2>" +
      "<p>Abra o arquivo <code>config.js</code> e preencha <code>SUPABASE_URL</code> e " +
      "<code>SUPABASE_ANON</code> com os dados do seu projeto Supabase " +
      "(Project Settings → API). Depois recarregue esta página.</p></div>";
    return;
  }

  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON);
  const exigirLogin = cfg.EXIGIR_LOGIN !== false;

  const $ = (id) => document.getElementById(id);
  const telaLogin = $("tela-login");
  const app = $("app");

  let todas = []; // cache local das linhas

  // -------------------- Autenticação --------------------
  async function iniciar() {
    if (!exigirLogin) {
      telaLogin.classList.add("oculto");
      app.classList.remove("oculto");
      $("usuario-label").textContent = "acesso público";
      $("btn-sair").classList.add("oculto");
      return carregar();
    }
    const { data } = await sb.auth.getSession();
    if (data.session) mostrarApp(data.session);
    else telaLogin.classList.remove("oculto");
  }

  function mostrarApp(session) {
    telaLogin.classList.add("oculto");
    app.classList.remove("oculto");
    $("usuario-label").textContent = session.user.email;
    carregar();
  }

  $("form-login").addEventListener("submit", async (e) => {
    e.preventDefault();
    const erro = $("login-erro");
    erro.classList.add("oculto");
    const { data, error } = await sb.auth.signInWithPassword({
      email: $("login-email").value.trim(),
      password: $("login-senha").value,
    });
    if (error) {
      erro.textContent = "E-mail ou senha incorretos.";
      erro.classList.remove("oculto");
      return;
    }
    mostrarApp(data.session);
  });

  $("btn-sair").addEventListener("click", async () => {
    await sb.auth.signOut();
    location.reload();
  });

  // -------------------- Carregar dados --------------------
  async function carregar() {
    const { data, error } = await sb
      .from("linhas")
      .select("*")
      .order("numero_formatado", { ascending: true });
    if (error) {
      alert("Erro ao carregar linhas: " + error.message);
      return;
    }
    todas = data || [];
    preencherFiltros();
    atualizarIndicadores();
    render();
  }

  function preencherFiltros() {
    const setores = [...new Set(todas.map((l) => l.setor).filter(Boolean))].sort();
    const resps = [...new Set(todas.map((l) => l.responsavel).filter(Boolean))].sort();
    $("f-setor").innerHTML =
      '<option value="">Todos</option>' + setores.map((s) => `<option>${esc(s)}</option>`).join("");
    $("f-resp").innerHTML =
      '<option value="">Todos</option>' + resps.map((s) => `<option>${esc(s)}</option>`).join("");
    $("lista-resp").innerHTML = resps.map((s) => `<option value="${esc(s)}">`).join("");
    $("lista-setor").innerHTML = setores.map((s) => `<option value="${esc(s)}">`).join("");
  }

  function atualizarIndicadores() {
    const com = todas.filter((l) => l.responsavel && l.responsavel.trim()).length;
    $("i-total").textContent = todas.length;
    $("i-com").textContent = com;
    $("i-sem").textContent = todas.length - com;
  }

  // -------------------- Filtro / busca --------------------
  function filtrar() {
    const q = norm($("f-busca").value);
    const tipo = $("f-tipo").value;
    const setor = $("f-setor").value;
    const resp = $("f-resp").value;
    const soSem = $("f-sem").checked;

    return todas.filter((l) => {
      if (tipo && l.tipo !== tipo) return false;
      if (setor && l.setor !== setor) return false;
      if (resp && l.responsavel !== resp) return false;
      if (soSem && l.responsavel && l.responsavel.trim()) return false;
      if (q) {
        const alvo = norm(
          [l.numero, l.numero_formatado, l.responsavel, l.setor, l.empresa,
           l.conta, l.cnpj, l.aparelho, l.operadora, l.plano, l.observacoes]
            .filter(Boolean).join(" ")
        );
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }

  function render() {
    const lista = filtrar();
    $("i-result").textContent = lista.length;
    const corpo = $("corpo");
    const vazio = $("vazio");
    if (lista.length === 0) {
      corpo.innerHTML = "";
      vazio.classList.remove("oculto");
      return;
    }
    vazio.classList.add("oculto");
    corpo.innerHTML = lista
      .map((l) => {
        const tipoSelo =
          l.tipo === "POS_PAGA"
            ? '<span class="selo pos">Pós-paga</span>'
            : l.tipo === "PRE_PAGA"
            ? '<span class="selo pre">Pré-paga</span>'
            : '<span class="selo neutro">' + esc(rotTipo(l.tipo)) + "</span>";
        const resp = l.responsavel && l.responsavel.trim()
          ? esc(l.responsavel)
          : '<span class="sem-resp">Sem responsável</span>';
        const empConta = [l.empresa, l.conta].filter(Boolean).map(esc).join(" · ") || "—";
        return `<tr>
          <td><span class="num-linha">${esc(l.numero_formatado || l.numero)}</span>
              <span class="operadora">${esc(l.operadora || "")}</span></td>
          <td class="esconde-mobile">${tipoSelo}</td>
          <td>${resp}</td>
          <td class="esconde-mobile">${esc(l.setor || "—")}</td>
          <td class="esconde-mobile">${empConta}</td>
          <td><button class="btn sec peq" data-editar="${l.id}">Editar</button></td>
        </tr>`;
      })
      .join("");
    corpo.querySelectorAll("[data-editar]").forEach((b) =>
      b.addEventListener("click", () => abrirModal(b.getAttribute("data-editar")))
    );
  }

  ["f-busca", "f-tipo", "f-setor", "f-resp"].forEach((id) =>
    $(id).addEventListener("input", render)
  );
  $("f-sem").addEventListener("change", render);
  $("btn-limpar").addEventListener("click", () => {
    ["f-busca", "f-tipo", "f-setor", "f-resp"].forEach((id) => ($(id).value = ""));
    $("f-sem").checked = false;
    render();
  });

  // -------------------- Modal (editar / criar) --------------------
  function abrirModal(id) {
    const l = id ? todas.find((x) => x.id === id) : {};
    $("modal-titulo").textContent = id ? "Editar linha" : "Nova linha";
    $("e-id").value = id || "";
    $("e-numero").value = l.numero_formatado || l.numero || "";
    $("e-tipo").value = l.tipo || "PRE_PAGA";
    $("e-responsavel").value = l.responsavel || "";
    $("e-setor").value = l.setor || "";
    $("e-status").value = l.status || "ATIVA";
    $("e-aparelho").value = l.aparelho || "";
    $("e-empresa").value = l.empresa || "";
    $("e-cnpj").value = l.cnpj || "";
    $("e-conta").value = l.conta || "";
    $("e-operadora").value = l.operadora || "";
    $("e-obs").value = l.observacoes || "";
    $("modal-erro").classList.add("oculto");
    $("modal").classList.remove("oculto");
  }
  function fecharModal() { $("modal").classList.add("oculto"); }
  $("btn-cancelar").addEventListener("click", fecharModal);
  $("btn-nova").addEventListener("click", () => abrirModal(null));

  $("form-linha").addEventListener("submit", async (e) => {
    e.preventDefault();
    const erro = $("modal-erro");
    erro.classList.add("oculto");
    const id = $("e-id").value;
    const numeroFmt = $("e-numero").value.trim();
    const numeroCanon = canon(numeroFmt);
    if (!numeroCanon) {
      erro.textContent = "Número inválido.";
      erro.classList.remove("oculto");
      return;
    }
    const registro = {
      numero: numeroCanon,
      numero_formatado: numeroFmt,
      ddd: numeroCanon.slice(2, 4),
      tipo: $("e-tipo").value,
      responsavel: ov($("e-responsavel").value),
      setor: ov($("e-setor").value),
      status: ov($("e-status").value) || "ATIVA",
      aparelho: ov($("e-aparelho").value),
      empresa: ov($("e-empresa").value),
      cnpj: ov($("e-cnpj").value),
      conta: ov($("e-conta").value),
      operadora: ov($("e-operadora").value),
      observacoes: ov($("e-obs").value),
    };
    let resp;
    if (id) resp = await sb.from("linhas").update(registro).eq("id", id);
    else resp = await sb.from("linhas").insert(registro);
    if (resp.error) {
      erro.textContent = resp.error.message.includes("duplicate")
        ? "Este número já está cadastrado."
        : "Erro ao salvar: " + resp.error.message;
      erro.classList.remove("oculto");
      return;
    }
    fecharModal();
    carregar();
  });

  $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") fecharModal(); });

  // -------------------- Utilidades --------------------
  function norm(s) {
    return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }
  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function ov(s) { s = (s || "").trim(); return s === "" ? null : s; }
  function rotTipo(t) {
    return { PRE_PAGA: "Pré-paga", POS_PAGA: "Pós-paga", CONTROLE: "Controle" }[t] || t || "—";
  }
  // Número -> canônico 55 + DDD + assinante (só dígitos)
  function canon(entrada) {
    let d = (entrada || "").replace(/\D/g, "");
    if (d.startsWith("55") && d.length > 11) d = d.slice(2);
    if (d.length !== 10 && d.length !== 11) return null;
    return "55" + d;
  }

  iniciar();
})();
