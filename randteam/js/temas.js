// Variáveis globais
let grupos = []; // Lista de grupos adicionados
let temas = []; // Lista de temas adicionados
let tempoRestante = 0; // Contador de tempo para o sorteio
let intervaloContador = null; // Intervalo do contador
let sorteioAtivo = false; // Estado do sorteio
let feedbackAtivo = null; // Feedback ativo no momento

/**
 * Adiciona um grupo à lista de grupos.
 */
function adicionarGrupo() {
  const nomeGrupoInput = document.getElementById("nomeGrupo").value.trim();
  const membrosTextarea = document.getElementById("membros").value.trim();

  if (!nomeGrupoInput) {
    mostrarErro("Por favor, insira o nome do grupo.");
    return;
  }

  const membros = membrosTextarea
    .split("\n")
    .filter((membro) => membro.trim() !== "");

  const grupo = {
    nome: nomeGrupoInput,
    membros: membros,
  };

  grupos.push(grupo);
  atualizarListaGrupos();
  mostrarSucesso("Grupo adicionado com sucesso!");

  // Limpa os campos após adicionar
  document.getElementById("nomeGrupo").value = "";
  document.getElementById("membros").value = "";
}

/**
 * Atualiza a lista de grupos no DOM.
 */
function atualizarListaGrupos() {
  const listaGrupos = document.getElementById("gruposLista");
  listaGrupos.innerHTML = grupos
    .map(
      (grupo, index) => `
      <li>
        <strong>Grupo ${index + 1}:</strong> ${grupo.nome}
        ${
          grupo.membros.length > 0
            ? `<br>Membros: ${grupo.membros.join(", ")}`
            : ""
        }
      </li>
    `
    )
    .join("");
}

/**
 * Limpa a lista de grupos.
 */
function limparGrupos() {
  if (grupos.length === 0) {
    mostrarErro("Não há grupos para apagar!");
    return;
  }
  grupos = [];
  atualizarListaGrupos();
  mostrarSucesso("Grupos apagados com sucesso.");
}

/**
 * Limpa o campo de temas.
 */
function limparTemas() {
  const temasTextarea = document.getElementById("temas");
  if (temasTextarea.value.trim() === "") {
    mostrarErro("Não há temas para apagar!");
    return;
  }
  temasTextarea.value = "";
  mostrarSucesso("Temas apagados com sucesso.");
}

/**
 * Limpa o campo de nome do grupo.
 */
function limparNomeGrupo() {
  const nomeGrupoInput = document.getElementById("nomeGrupo");

  // Verifica se o campo já está vazio
  if (nomeGrupoInput.value.trim() === "") {
    mostrarErro("O campo de nome do grupo já está vazio!");
    return;
  }

  // Limpa o campo
  nomeGrupoInput.value = "";

  // Exibe feedback de sucesso
  mostrarSucesso("Nome do grupo apagado com sucesso.");
}

/**
 * Realiza o sorteio de temas.
 */
function sortearTemas() {
  if (sorteioAtivo) {
    const confirmar = confirm(
      "Um sorteio está em andamento. Deseja sortear novamente?"
    );
    if (!confirmar) return;

    clearInterval(intervaloContador);
    tempoRestante = 0;
    document.getElementById("contador").style.display = "none";
    sorteioAtivo = false;
  }

  const temasInput = document.getElementById("temas").value.trim();
  const resultadoDiv = document.getElementById("resultado");
  const btnSortear = document.querySelector("button[onclick='sortearTemas()']");
  const btnDownload = document.getElementById("btnDownload");

  resultadoDiv.innerHTML = "";
  btnDownload.style.display = "none";

  // Validação dos campos
  if (grupos.length === 0) {
    mostrarErro("Por favor, adicione pelo menos um grupo.");
    return;
  }

  if (!temasInput) {
    mostrarErro("Por favor, insira os temas.");
    return;
  }

  temas = temasInput.split("\n").filter((tema) => tema.trim() !== "");

  // Validações adicionais
  if (temas.length === 0) {
    mostrarErro("Insira pelo menos um tema.");
    return;
  }

  if (temas.length !== grupos.length) {
    mostrarErro("O número de temas deve ser igual ao número de grupos.");
    return;
  }

  btnSortear.disabled = true;

  // Lógica do sorteio
  const temasEmbaralhados = embaralharArray([...temas]);

  const gruposSorteados = grupos.map((grupo, index) => ({
    ...grupo,
    tema: temasEmbaralhados[index],
  }));

  // Atualiza a variável global com os temas sorteados
  grupos = gruposSorteados;

  // Anuncia os grupos e inicia o contador
  anunciarGrupos(gruposSorteados, 0, () => {
    btnDownload.style.display = "block";
    iniciarContador();
  });
}

/**
 * Embaralha um array usando o algoritmo Fisher-Yates.
 * @param {Array} array - O array a ser embaralhado.
 * @returns {Array} - O array embaralhado.
 */
function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Anuncia os grupos criados no DOM.
 * @param {Array} grupos - Lista de grupos.
 * @param {number} index - Índice do grupo atual.
 * @param {Function} callback - Função de callback ao finalizar.
 */
function anunciarGrupos(grupos, index, callback) {
  if (index >= grupos.length) {
    callback();
    return;
  }

  const resultadoDiv = document.getElementById("resultado");
  const grupoDiv = document.createElement("div");
  grupoDiv.classList.add("grupo");

  const tema = document.createElement("h3");
  tema.textContent = `Grupo ${index + 1}: ${grupos[index].nome} - Tema: ${
    grupos[index].tema
  }`;
  grupoDiv.appendChild(tema);

  if (grupos[index].membros.length > 0) {
    const membros = document.createElement("p");
    membros.textContent = `Membros: ${grupos[index].membros.join(", ")}`;
    grupoDiv.appendChild(membros);
  }

  resultadoDiv.appendChild(grupoDiv);

  grupoDiv.style.opacity = 0;
  setTimeout(() => {
    grupoDiv.style.opacity = 1;
    grupoDiv.style.transition = "opacity 1s ease-in-out";
  }, 100);

  setTimeout(() => {
    anunciarGrupos(grupos, index + 1, callback);
  }, 1000);
}

/**
 * Inicia o contador de tempo após o sorteio.
 */
function iniciarContador() {
  const btnSortear = document.querySelector("button[onclick='sortearTemas()']");
  const contador = document.getElementById("contador");

  if (sorteioAtivo) return;

  sorteioAtivo = true;
  tempoRestante = 30;
  btnSortear.disabled = true;
  contador.style.display = "inline";

  intervaloContador = setInterval(() => {
    tempoRestante--;
    contador.textContent = `Aguarde ${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloContador);
      contador.style.display = "none";
      sorteioAtivo = false;
      btnSortear.disabled = false;
    }
  }, 1000);
}

/**
 * Exibe uma mensagem de erro.
 * @param {string} mensagem - A mensagem de erro.
 */
function mostrarErro(mensagem) {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.classList.add("feedback", "erro");
  feedbackDiv.textContent = mensagem;
  document.body.appendChild(feedbackDiv);

  setTimeout(() => (feedbackDiv.style.right = "20px"), 100);
  setTimeout(() => {
    feedbackDiv.style.right = "-100%";
    setTimeout(() => feedbackDiv.remove(), 500);
  }, 3000);
}

/**
 * Exibe uma mensagem de sucesso.
 * @param {string} mensagem - A mensagem de sucesso.
 * @param {boolean} persistente - Se a mensagem deve persistir.
 */
function mostrarSucesso(mensagem, persistente = false) {
  if (feedbackAtivo && !persistente) {
    clearTimeout(feedbackAtivo);
    document.querySelector(".feedback").remove();
  }

  const feedbackDiv = document.createElement("div");
  feedbackDiv.classList.add("feedback", "sucesso");
  feedbackDiv.textContent = mensagem;
  document.body.appendChild(feedbackDiv);

  if (!persistente) {
    feedbackAtivo = setTimeout(() => {
      feedbackDiv.style.right = "-100%";
      setTimeout(() => feedbackDiv.remove(), 500);
      feedbackAtivo = null;
    }, 3000);
  }
}

/**
 * Gera um PDF com os grupos e temas sorteados.
 */
function gerarPDF() {
  try {
    console.log("[DEBUG] Iniciando geração de PDF");

    if (!grupos || grupos.length === 0) {
      console.error("[ERRO] Nenhum grupo foi sorteado ainda!");
      mostrarErro("Nenhum grupo foi sorteado ainda!");
      return;
    }

    if (typeof jspdf === "undefined" || !window.jspdf) {
      console.error("[ERRO] Biblioteca jsPDF não carregada");
      mostrarErro("Biblioteca PDF não está disponível!");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Cores inspiradas no Bootstrap 5
    const colors = {
      primary: "#0d6efd", // Azul Bootstrap
      secondary: "#6c757d", // Cinza
      accent: "#6610f2", // Roxo Bootstrap
      background: "#f8f9fa", // Branco sujo
      header: "#343a40", // Cinza escuro
      text: "#212529", // Preto Bootstrap
      statsHeader: "#198754", // Verde sucesso
      footer: "#6c757d", // Cinza Bootstrap
    };

    const margin = 15;
    let y = margin;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rodapeOffset = 25;

    const loadLogo = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          try {
            const logoWidth = 40;
            const logoX = (pageWidth - logoWidth) / 2;
            doc.addImage(img, "PNG", logoX, y, logoWidth, 15);
            y += 25;
            resolve(true);
          } catch (error) {
            console.error("[ERRO] Erro ao adicionar a logo:", error);
            resolve(false);
          }
        };
        img.onerror = () => {
          console.warn("[AVISO] Logo não carregada, usando fallback.");
          resolve(false);
        };
        img.src = "images/logo.png";
      });
    };

    const generateContent = () => {
      try {
        doc.setFontSize(18);
        doc.setTextColor(colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("Sorteio de Grupos por Temas", pageWidth / 2, y, {
          align: "center",
        });
        y += 10;

        // Cabeçalho da tabela
        const headers = ["Grupo", "Tema", "Membros"];
        const colWidths = [30, 50, 100];
        const headerHeight = 8;
        const rowHeight = 10;

        doc.setFillColor(colors.header);
        doc.setTextColor("#ffffff");
        doc.setFontSize(10);
        doc.rect(margin, y, pageWidth - margin * 2, headerHeight, "F");

        let x = margin;
        headers.forEach((header, i) => {
          doc.text(header, x + 2, y + 6);
          x += colWidths[i];
        });

        y += headerHeight + 2;

        doc.setFontSize(9);
        doc.setTextColor(colors.text);

        grupos.forEach((grupo, index) => {
          const rowData = [
            `Grupo ${index + 1}: ${grupo.nome}`,
            grupo.tema || "Tema não definido",
            grupo.membros?.join(", ") || "Sem membros", // membros separados por vírgulas
          ];

          // Verifica se a próxima linha ultrapassa a área útil
          const estimatedHeight = rowHeight + 2;
          if (y + estimatedHeight + rodapeOffset >= pageHeight) {
            doc.addPage();
            y = margin;

            // Novo cabeçalho após quebra de página
            doc.setFillColor(colors.header);
            doc.setTextColor("#ffffff");
            doc.rect(margin, y, pageWidth - margin * 2, headerHeight, "F");

            x = margin;
            headers.forEach((header, i) => {
              doc.text(header, x + 2, y + 6);
              x += colWidths[i];
            });

            y += headerHeight + 2;
          }

          // Fundo alternado tipo tabela Bootstrap
          doc.setFillColor(index % 2 === 0 ? "#ffffff" : "#e9ecef");
          doc.rect(margin, y, pageWidth - margin * 2, rowHeight, "F");

          // Conteúdo
          x = margin;
          rowData.forEach((text, i) => {
            const cellText = doc
              .splitTextToSize(text, colWidths[i] - 4)
              .join(", ");
            doc.setTextColor(colors.text);
            doc.text(cellText, x + 2, y + 6);
            x += colWidths[i];
          });

          y += rowHeight + 2;
        });

        // Estatísticas
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(colors.statsHeader);
        doc.text("ESTATÍSTICAS DO SORTEIO", margin, y);
        y += 8;

        const totalGrupos = grupos.length;
        const totalMembros = grupos.reduce(
          (acc, g) => acc + (g.membros?.length || 0),
          0
        );
        const temasUnicos = new Set(grupos.map((g) => g.tema)).size;

        const stats = [
          ["Total de Grupos", totalGrupos],
          ["Total de Membros", totalMembros],
          ["Temas Únicos", temasUnicos],
        ];

        doc.setFillColor(colors.statsHeader);
        doc.setTextColor("#ffffff");
        doc.setFontSize(10);
        doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
        doc.text("Itens", margin + 2, y + 6);
        doc.text("Valores", pageWidth - margin - 2, y + 6, { align: "right" });
        y += 10;

        stats.forEach(([label, val], i) => {
          doc.setFillColor(i % 2 === 0 ? "#d1e7dd" : "#badbcc");
          doc.setTextColor(colors.text);
          doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
          doc.text(label, margin + 2, y + 6);
          doc.text(val.toString(), pageWidth - margin - 2, y + 6, {
            align: "right",
          });
          y += 10;
        });

        // Rodapé
        const footerY = pageHeight - 15;
        const dataEmissao = new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        doc.setFontSize(9);
        doc.setTextColor(colors.footer);
        doc.text(
          "RandTeam © 2025 | Sistema de Sorteio Inteligente",
          margin,
          footerY
        );
        doc.text(
          `Emitido em: ${dataEmissao}`,
          pageWidth - margin - 2,
          footerY,
          {
            align: "right",
          }
        );
        doc.text(
          "Created & Designed by Aquilivio Maria",
          pageWidth - margin - 2,
          footerY + 5,
          {
            align: "right",
          }
        );

        doc.save(`relatorio-sorteio-${Date.now()}.pdf`);
        console.log("[DEBUG] PDF gerado com sucesso");
      } catch (error) {
        console.error("[ERRO] Durante a geração do conteúdo:", error);
        mostrarErro("Falha na criação do conteúdo!");
      }
    };

    loadLogo()
      .then((logoCarregada) => {
        if (!logoCarregada) {
          doc.setFontSize(16);
          doc.setTextColor(colors.primary);
          doc.text("RandTeam", pageWidth / 2, y, { align: "center" });
          y += 20;
        }
        generateContent();
      })
      .catch((error) => {
        console.error("[ERRO] No carregamento da logo:", error);
        generateContent();
      });
  } catch (error) {
    console.error("[ERRO CRÍTICO]", error);
    mostrarErro("Falha grave na geração do PDF!");
  }
}

// Sistema de feedback aprimorado
function mostrarErro(mensagem) {
  // Remover feedback existente
  if (feedbackAtivo) {
    feedbackAtivo.remove();
  }

  // Criar novo elemento
  const feedback = document.createElement("div");
  feedback.className = "feedback erro";
  feedback.textContent = mensagem;

  // Adicionar ao DOM
  document.body.appendChild(feedback);
  feedbackAtivo = feedback;

  // Animação de entrada
  setTimeout(() => {
    feedback.style.right = "20px";
  }, 100);

  // Remover após 3 segundos
  setTimeout(() => {
    feedback.style.right = "-100%";
    setTimeout(() => feedback.remove(), 500);
  }, 3000);
}

function mostrarSucesso(mensagem) {
  // Remover feedback existente
  if (feedbackAtivo) {
    feedbackAtivo.remove();
  }

  // Criar novo elemento
  const feedback = document.createElement("div");
  feedback.className = "feedback sucesso";
  feedback.textContent = mensagem;

  // Adicionar ao DOM
  document.body.appendChild(feedback);
  feedbackAtivo = feedback;

  // Animação de entrada
  setTimeout(() => {
    feedback.style.right = "20px";
  }, 100);

  // Remover após 3 segundos
  setTimeout(() => {
    feedback.style.right = "-100%";
    setTimeout(() => feedback.remove(), 500);
  }, 3000);
}

// Função auxiliar para mostrar o botão de download
function mostrarBotaoDownload() {
  document.getElementById("btnDownload").style.display = "inline-block";
}
