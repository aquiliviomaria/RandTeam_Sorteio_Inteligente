// Configurações globais
const Config = {
  TEMPO_ESPERA: 30,
  TEMPO_REVELACAO: 3,
  INTERVALO_ANIMACAO: 1000,
  PDF_COLORS: {
    primary: "#2C3E50",
    secondary: "#27AE60",
    accent: "#3498DB",
    background: "#F0F8FF",
    header: "#2C3E50",
    text: "#2C3E50",
    statsHeader: "#27AE60",
    footer: "#27AE60",
  },
};

// Estado da aplicação
const Estado = {
  tempoRestante: 0,
  intervaloContador: null,
  sorteioAtivo: false,
  ultimosNomes: [],
  feedbackAtivo: null,
  currentStep: 0,
  nomesEmbaralhados: [],
  temaSorteio: "",
  intervaloRevelacao: null,
};

// Controladores de DOM
const DOM = {
  get entrada() {
    return document.getElementById("entrada");
  },
  get tema() {
    return document.getElementById("tema");
  },
  get resultado() {
    return document.getElementById("resultado");
  },
  get btnSortear() {
    return document.querySelector("button[onclick='sortearOrdem()']");
  },
  get btnDownload() {
    return document.getElementById("btnDownload");
  },
  get contador() {
    return document.getElementById("contador");
  },
  get currentName() {
    return document.getElementById("currentName");
  },
};

// Utilitários
const Utils = {
  embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  criarElemento(tag, classes, texto) {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    if (texto) element.textContent = texto;
    return element;
  },
};

// Gerenciamento de Feedback
const Feedback = {
  mostrar(mensagem, tipo, persistente = false) {
    if (Estado.feedbackAtivo && !persistente) {
      clearTimeout(Estado.feedbackAtivo);
      document.querySelector(".feedback").remove();
    }

    const feedbackDiv = Utils.criarElemento(
      "div",
      `feedback ${tipo}`,
      mensagem
    );
    document.body.appendChild(feedbackDiv);

    setTimeout(() => (feedbackDiv.style.right = "20px"), 100);

    if (!persistente) {
      Estado.feedbackAtivo = setTimeout(() => {
        feedbackDiv.style.right = "-100%";
        setTimeout(() => feedbackDiv.remove(), 500);
        Estado.feedbackAtivo = null;
      }, 3000);
    }
  },

  erro(mensagem) {
    this.mostrar(mensagem, "erro");
  },

  sucesso(mensagem, persistente = false) {
    this.mostrar(mensagem, "sucesso", persistente);
  },
};

// Controles do Sorteio
const SorteioController = {
  validarDados(nomes) {
    if (!Estado.temaSorteio) {
      Feedback.erro("Por favor, insira o tema do sorteio!");
      return false;
    }

    if (nomes.length < 2) {
      Feedback.erro("Insira pelo menos dois participantes!");
      return false;
    }

    return true;
  },

  prepararNovoSorteio(nomes) {
    Estado.currentStep = 0;
    Estado.nomesEmbaralhados = Utils.embaralharArray([...nomes]);
    Estado.ultimosNomes = [...nomes];
    DOM.resultado.innerHTML = "";
    DOM.btnDownload.style.display = "none";
  },

  iniciarContador() {
    Estado.tempoRestante = Config.TEMPO_ESPERA;
    DOM.contador.style.display = "inline";
    DOM.btnSortear.disabled = true;

    Estado.intervaloContador = setInterval(() => {
      Estado.tempoRestante--;
      DOM.contador.textContent = `Aguarde ${Estado.tempoRestante}s`;

      if (Estado.tempoRestante <= 0) {
        this.pararContador();
      }
    }, 1000);
  },

  pararContador() {
    clearInterval(Estado.intervaloContador);
    DOM.contador.style.display = "none";
    Estado.sorteioAtivo = false;
    DOM.btnSortear.disabled = false;
  },
};

// Funções principais
function sortearOrdem() {
  Estado.temaSorteio = DOM.tema.value.trim();
  const nomes = DOM.entrada.value
    .trim()
    .split("\n")
    .filter((nome) => nome.trim());

  if (!SorteioController.validarDados(nomes)) return;

  if (Estado.sorteioAtivo) {
    if (!confirm("Um sorteio está em andamento. Deseja sortear novamente?"))
      return;
    SorteioController.pararContador();
  }

  SorteioController.prepararNovoSorteio(nomes);
  RevelacaoController.iniciarRevelacao();
}

// Controles de Revelação
const RevelacaoController = {
  iniciarRevelacao() {
    let countdown = Config.TEMPO_REVELACAO;
    DOM.currentName.classList.remove("reveal-animation");

    Estado.intervaloRevelacao = setInterval(() => {
      DOM.contador.textContent = countdown;

      if (countdown === 0) {
        clearInterval(Estado.intervaloRevelacao);
        this.revelarProximoNome();
        return;
      }

      countdown--;
      DOM.currentName.textContent = "Preparando...";
      DOM.currentName.style.opacity = countdown % 2 ? "0.5" : "1";
    }, 1000);
  },

  revelarProximoNome() {
    if (Estado.currentStep < Estado.nomesEmbaralhados.length) {
      DOM.currentName.classList.add("reveal-animation");
      DOM.currentName.textContent =
        Estado.nomesEmbaralhados[Estado.currentStep];

      // Adiciona o nome à lista final
      const listItem = Utils.criarElemento(
        "li",
        null,
        `${Estado.currentStep + 1}. ${
          Estado.nomesEmbaralhados[Estado.currentStep]
        }`
      );
      DOM.resultado.appendChild(listItem);

      setTimeout(() => {
        DOM.currentName.classList.remove("reveal-animation");
        Estado.currentStep++;
        setTimeout(() => this.revelarProximoNome(), 1000);
      }, 2000);
    } else {
      this.finalizarSorteio();
    }
  },

  finalizarSorteio() {
    clearInterval(Estado.intervaloRevelacao);
    DOM.btnDownload.style.display = "block";
    SorteioController.iniciarContador(); // Inicia o tempo de espera após o sorteio
  },
};

// Funções auxiliares
function limparTodos() {
  DOM.tema.value = "";
  DOM.entrada.value = "";
  DOM.resultado.innerHTML = "";
  DOM.btnDownload.style.display = "none";
  Feedback.sucesso("Todos os campos foram limpos!");
}

function gerarPDF() {
  try {
    console.log("[DEBUG] Iniciando geração de PDF");

    // Verificação robusta do estado
    if (
      !Estado ||
      !Estado.nomesEmbaralhados ||
      Estado.nomesEmbaralhados.length === 0
    ) {
      console.error("[ERRO] Nenhum dado de sorteio disponível");
      Feedback.erro("Realize um sorteio primeiro!");
      return;
    }

    // Verificação aprimorada da biblioteca
    if (typeof jspdf === "undefined" || !window.jspdf) {
      console.error("[ERRO] Biblioteca jsPDF não carregada");
      Feedback.erro("Biblioteca PDF não está disponível!");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Configuração de cores
    const colors = {
      ouro: "#FFD700",
      prata: "#C0C0C0",
      bronze: "#CD7F32",
      text: "#2C3E50",
      background: "#F0F8FF",
      header: "#2C3E50",
      footer: "#27AE60",
      statsHeader: "#27AE60",
    };

    const margin = 15;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Configuração inicial do documento
    doc.setFillColor(232, 244, 255);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");

    // Função para gerar conteúdo principal
    const generateContent = () => {
      try {
        // Cabeçalho
        doc.setFontSize(18);
        doc.setTextColor(colors.header);
        doc.setFont("helvetica", "bold");
        doc.text("RESULTADO FINAL DO SORTEIO", pageWidth / 2, y, {
          align: "center",
        });
        y += 15;

        // Tema do sorteio
        doc.setFontSize(12);
        doc.setTextColor(colors.text);
        doc.text(
          `Tema: ${Estado.temaSorteio || "Não especificado"}`,
          margin,
          y
        );
        y += 12;

        // Tabela de participantes
        const colWidths = [25, 150];
        const rowHeight = 10;
        const headerHeight = 8;

        // Cabeçalho da tabela
        doc.setFillColor(colors.header);
        doc.rect(margin, y, pageWidth - margin * 2, headerHeight, "F");
        doc.setFontSize(12);
        doc.setTextColor("#FFFFFF");
        doc.text("Posição", margin + 2, y + 6);
        doc.text("Participante", margin + colWidths[0] + 2, y + 6);
        y += headerHeight + 4;

        // Linhas da tabela
        doc.setFontSize(11);
        Estado.nomesEmbaralhados.forEach((nome, index) => {
          // Estilização condicional
          let fillColor = [255, 255, 255];
          let textColor = colors.text;

          switch (index) {
            case 0:
              fillColor = [255, 223, 186]; // Ouro
              textColor = colors.ouro;
              break;
            case 1:
              fillColor = [240, 240, 240]; // Prata
              textColor = colors.prata;
              break;
            case 2:
              fillColor = [255, 228, 196]; // Bronze
              textColor = colors.bronze;
              break;
          }

          doc.setFillColor(...fillColor);
          doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");

          // Número da posição
          doc.setTextColor(textColor);
          doc.setFont("helvetica", index < 3 ? "bold" : "normal");
          doc.text(`${index + 1}.`, margin + 2, y + 7);

          // Nome do participante
          doc.setTextColor(colors.text);
          doc.setFont("helvetica", "normal");
          doc.text(nome, margin + colWidths[0] + 4, y + 7, {
            maxWidth: colWidths[1] - 8,
          });

          y += rowHeight;

          // Quebra de página
          if (y > 260) {
            doc.addPage();
            y = margin;
            doc.setFillColor(232, 244, 255);
            doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), "F");
          }
        });

        // Seção de estatísticas
        y += 12;
        doc.setFontSize(12);
        doc.setTextColor(colors.statsHeader);
        doc.text("ESTATÍSTICAS", margin, y);
        y += 8;

        const statsData = [
          ["Total de Participantes", Estado.nomesEmbaralhados.length],
          ["Tema do Sorteio", Estado.temaSorteio || "Não definido"],
          ["Data/Hora", new Date().toLocaleString("pt-BR")],
        ];

        statsData.forEach(([label, value]) => {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
          doc.setFontSize(10);
          doc.setTextColor(colors.text);
          doc.text(`${label}:`, margin + 2, y + 6);
          doc.text(value.toString(), pageWidth - margin - 2, y + 6, {
            align: "right",
          });
          y += 10;
        });

        // Rodapé
        const footerY = doc.internal.pageSize.height - 15;
        doc.setFontSize(9);
        doc.setTextColor(colors.footer);
        doc.text(
          "© 2024 Sistema de Sorteio - Todos os direitos reservados",
          margin,
          footerY
        );
        doc.text(
          `Página ${doc.internal.getNumberOfPages()}`,
          pageWidth - margin - 2,
          footerY,
          {
            align: "right",
          }
        );

        // Geração do PDF
        doc.save(`resultado-sorteio-${Date.now()}.pdf`);
        console.log("[DEBUG] PDF gerado com sucesso");
      } catch (error) {
        console.error("[ERRO] Durante a geração do conteúdo:", error);
        Feedback.erro("Falha na criação do conteúdo!");
      }
    };

    // Carregamento da imagem com fallback
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      try {
        console.log("[DEBUG] Logo carregado com sucesso");
        const logoWidth = 40;
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(img, "PNG", logoX, y, logoWidth, 15);
        y += 30;
        generateContent();
      } catch (error) {
        console.error("[ERRO] No carregamento da imagem:", error);
        generateContent(); // Fallback sem imagem
      }
    };

    img.onerror = () => {
      console.warn("[AVISO] Logo não carregado, usando fallback");
      doc.setFontSize(16);
      doc.setTextColor(colors.header);
      doc.text("SISTEMA DE SORTEIO", pageWidth / 2, y + 10, {
        align: "center",
      });
      y += 25;
      generateContent();
    };

    img.src = "./images/logo.png";
  } catch (error) {
    console.error("[ERRO CRÍTICO]", error);
    Feedback.erro("Falha grave na geração do PDF!");
  }
}
