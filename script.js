/* =========================================================
   Simulador de Juiz — Parte 1 (Fundação)
   Lógica completa • Sem APIs • Mobile-first
   ========================================================= */

/* =========================
   ESTADO GLOBAL DO JOGO
   ========================= */

let estado = {
  telaAtual: "menu",
  prestigio: 0,
  nivel: 1,
  cargo: "Juiz Substituto",
  processoAtual: null,
  etapaAudiencia: 0
};

/* =========================
   BASE DE PROCESSOS (JSON)
   ========================= */

const processos = [
  {
    id: 1,
    titulo: "Homicídio Qualificado",
    area: "Criminal (Tribunal do Júri)",
    descricao:
      "O réu João Alves é acusado de homicídio qualificado. A acusação afirma que o crime foi cometido por motivo torpe. A defesa sustenta ausência de provas suficientes e levanta dúvida razoável.",
    audiencias: [
      {
        personagem: "Promotor",
        texto:
          "Excelência, a acusação demonstrará que o réu agiu com intenção clara de matar, movido por motivo torpe, conforme provas constantes nos autos."
      },
      {
        personagem: "Defesa",
        texto:
          "Excelência, não há prova concreta de autoria. O que existe são suposições e testemunhos contraditórios."
      },
      {
        personagem: "Testemunha",
        texto:
          "Eu vi alguém correndo do local, mas não posso afirmar com certeza que era o réu."
      }
    ],
    decisoes: [
      {
        texto: "Pronunciar o réu para julgamento pelo júri",
        correta: true,
        impacto: 10
      },
      {
        texto: "Absolver sumariamente o réu",
        correta: false,
        impacto: -10
      }
    ],
    feedback:
      "Em crimes dolosos contra a vida, havendo indícios de autoria e materialidade, o correto é a pronúncia do réu, permitindo que o júri popular decida o mérito."
  },
  {
    id: 2,
    titulo: "Disputa de Guarda de Menor",
    area: "Direito de Família",
    descricao:
      "Maria e Carlos disputam a guarda do filho menor. O pai possui melhores condições financeiras, mas a mãe é quem exerce os cuidados diários.",
    audiencias: [
      {
        personagem: "Advogado de Maria",
        texto:
          "Excelência, a genitora sempre foi a principal cuidadora da criança, garantindo afeto e estabilidade emocional."
      },
      {
        personagem: "Advogado de Carlos",
        texto:
          "Excelência, o pai possui melhores condições materiais para garantir o futuro do menor."
      }
    ],
    decisoes: [
      {
        texto: "Conceder guarda à mãe",
        correta: true,
        impacto: 10
      },
      {
        texto: "Conceder guarda ao pai",
        correta: false,
        impacto: -10
      }
    ],
    feedback:
      "O critério principal para guarda é o melhor interesse da criança, e não apenas a condição financeira."
  }
];

/* =========================
   FUNÇÕES DE TELA
   ========================= */

function mostrarTela(id) {
  document.querySelectorAll(".tela").forEach(t => t.classList.remove("ativa"));
  document.getElementById(`tela-${id}`).classList.add("ativa");
  estado.telaAtual = id;
}

/* =========================
   MENU
   ========================= */

function iniciarJogo() {
  carregarStatus();
  listarProcessos();
  mostrarTela("escritorio");
}

function voltarMenu() {
  mostrarTela("menu");
}

/* =========================
   ESCRITÓRIO
   ========================= */

function listarProcessos() {
  const lista = document.getElementById("lista-processos");
  lista.innerHTML = "";

  processos.forEach(proc => {
    const li = document.createElement("li");
    li.className = "item-processo";
    li.innerHTML = `
      <h4>${proc.titulo}</h4>
      <p>${proc.area}</p>
    `;
    li.onclick = () => abrirProcesso(proc.id);
    lista.appendChild(li);
  });

  atualizarPainel();
}

function atualizarPainel() {
  document.getElementById("prestigio").innerText = estado.prestigio;
  document.getElementById("nivel").innerText = estado.nivel;
  document.getElementById("cargo").innerText = estado.cargo;
}

function abrirProcesso(id) {
  const proc = processos.find(p => p.id === id);
  estado.processoAtual = proc;
  document.getElementById("processo-titulo").innerText = proc.titulo;
  document.getElementById("processo-descricao").innerText = proc.descricao;
  mostrarTela("processo");
}

function voltarEscritorio() {
  listarProcessos();
  mostrarTela("escritorio");
}

/* =========================
   AUDIÊNCIA
   ========================= */

function iniciarAudiencia() {
  estado.etapaAudiencia = 0;
  mostrarTela("audiencia");
  mostrarFala();
}

function mostrarFala() {
  const fala = estado.processoAtual.audiencias[estado.etapaAudiencia];
  const caixa = document.getElementById("fala-personagem");
  const acoes = document.getElementById("acoes-audiencia");

  acoes.innerHTML = "";

  if (fala) {
    caixa.innerText = `${fala.personagem}: ${fala.texto}`;

    const btn = document.createElement("button");
    btn.innerText = "Ouvir próxima manifestação";
    btn.onclick = () => {
      estado.etapaAudiencia++;
      mostrarFala();
    };
    acoes.appendChild(btn);
  } else {
    mostrarDecisoes();
  }
}

function mostrarDecisoes() {
  const caixa = document.getElementById("fala-personagem");
  const acoes = document.getElementById("acoes-audiencia");

  caixa.innerText = "Encerrada a fase de debates. Proferir decisão:";
  acoes.innerHTML = "";

  estado.processoAtual.decisoes.forEach(dec => {
    const btn = document.createElement("button");
    btn.innerText = dec.texto;
    btn.onclick = () => aplicarDecisao(dec);
    acoes.appendChild(btn);
  });
}

/* =========================
   DECISÃO E RESULTADO
   ========================= */

function aplicarDecisao(decisao) {
  estado.prestigio += decisao.impacto;
  if (estado.prestigio < 0) estado.prestigio = 0;

  atualizarNivel();

  salvarStatus();

  const textoResultado = `
${decisao.correta ? "DECISÃO ADEQUADA" : "DECISÃO EQUIVOCADA"}

${estado.processoAtual.feedback}

Impacto no prestígio: ${decisao.impacto > 0 ? "+" : ""}${decisao.impacto}
`;

  document.getElementById("resultado-texto").innerText = textoResultado;

  mostrarTela("resultado");
}

function atualizarNivel() {
  estado.nivel = Math.floor(estado.prestigio / 20) + 1;

  if (estado.nivel >= 5) {
    estado.cargo = "Juiz Titular";
  }
  if (estado.nivel >= 10) {
    estado.cargo = "Desembargador";
  }
}

/* =========================
   SAVE / LOAD
   ========================= */

function salvarStatus() {
  localStorage.setItem("simuladorJuizEstado", JSON.stringify({
    prestigio: estado.prestigio,
    nivel: estado.nivel,
    cargo: estado.cargo
  }));
}

function carregarStatus() {
  const salvo = localStorage.getItem("simuladorJuizEstado");
  if (salvo) {
    const dados = JSON.parse(salvo);
    estado.prestigio = dados.prestigio || 0;
    estado.nivel = dados.nivel || 1;
    estado.cargo = dados.cargo || "Juiz Substituto";
  }
}

/* =========================
   INICIALIZAÇÃO
   ========================= */

mostrarTela("menu");