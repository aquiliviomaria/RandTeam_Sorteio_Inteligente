// Variáveis globais
let tempoRestante = 0; // Contador de tempo para o sorteio
let intervaloContador = null; // Intervalo do contador
let sorteioAtivo = false; // Estado do sorteio
let ultimosNomes = []; // Últimos nomes usados no sorteio
let ultimosTemas = []; // Últimos temas usados no sorteio
let feedbackAtivo = null; // Feedback ativo no momento

/**
 * Função principal para sortear grupos.
 * Verifica se há um sorteio em andamento, valida os dados e realiza o sorteio.
 */
function sortearGrupos() {
  if (sorteioAtivo) {
    const confirmar = confirm(
      "Um sorteio está em andamento. Deseja sortear novamente?"
    );
    if (!confirmar) return;

    const usarMesmosDados = confirm("Deseja usar os mesmos nomes e temas?");
    if (!usarMesmosDados) {
      document.getElementById("nomes").value = "";
      document.getElementById("temas").value = "";
    }

    clearInterval(intervaloContador);
    tempoRestante = 0;
    document.getElementById("contador").style.display = "none";
    sorteioAtivo = false;
  }

  const nomesInput = document.getElementById("nomes").value.trim();
  const temasInput = document.getElementById("temas").value.trim();
  const resultadoDiv = document.getElementById("resultado");
  const btnSortear = document.querySelector(
    "button[onclick='sortearGrupos()']"
  );
  const btnDownload = document.getElementById("btnDownload");

  resultadoDiv.innerHTML = "";
  btnDownload.style.display = "none";

  // Validação dos campos
  if (!nomesInput || !temasInput) {
    mostrarErro("Por favor, preencha todos os campos.");
    return;
  }

  const nomes = nomesInput.split("\n").filter((nome) => nome.trim() !== "");
  const temas = temasInput.split("\n").filter((tema) => tema.trim() !== "");

  // Validações adicionais
  if (nomes.length < 3) {
    mostrarErro("Insira pelo menos 3 nomes.");
    return;
  }

  if (temas.length < 2) {
    mostrarErro("Insira pelo menos 2 temas.");
    return;
  }

  if (temas.length > nomes.length) {
    mostrarErro("O número de temas não pode ser maior que o número de nomes.");
    return;
  }

  // Verificação de dados repetidos
  if (ultimosNomes.length > 0 && ultimosTemas.length > 0) {
    const nomesIguais = JSON.stringify(nomes) === JSON.stringify(ultimosNomes);
    const temasIguais = JSON.stringify(temas) === JSON.stringify(ultimosTemas);

    if (nomesIguais && temasIguais) {
      const confirmacao = confirm(
        "Você está usando os mesmos nomes e temas da última vez. Deseja continuar?"
      );
      if (!confirmacao) {
        btnSortear.disabled = false;
        return;
      }
    }
  }

  btnSortear.disabled = true;

  // Lógica do sorteio corrigida
  const grupos = temas.map((tema) => ({ tema, membros: [] }));
  const nomesEmbaralhados = embaralharArray([...nomes]);

  // Distribuição round-robin dos nomes
  let indexGrupo = 0;
  while (nomesEmbaralhados.length > 0) {
    const nome = nomesEmbaralhados.pop();
    grupos[indexGrupo].membros.push(nome);
    indexGrupo = (indexGrupo + 1) % grupos.length;
  }

  // Atualiza últimos dados usados
  ultimosNomes = [...nomes];
  ultimosTemas = [...temas];

  // Anuncia os grupos e inicia o contador
  anunciarGrupos(grupos, 0, () => {
    btnDownload.style.display = "block";
    iniciarContador();
  });
}
/**
 * Inicia o contador de tempo após o sorteio.
 */
function iniciarContador() {
  const btnSortear = document.querySelector(
    "button[onclick='sortearGrupos()']"
  );
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
  tema.textContent = `Grupo ${index + 1}: ${grupos[index].tema}`;
  grupoDiv.appendChild(tema);

  const membros = document.createElement("p");
  membros.textContent = `Membros: ${grupos[index].membros.join(", ")}`;
  grupoDiv.appendChild(membros);

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
 * Limpa o campo de nomes.
 */
function limparNomes() {
  const nomesTextarea = document.getElementById("nomes");
  if (nomesTextarea.value.trim() === "") {
    mostrarErro("Não há nomes para apagar!");
    return;
  }
  nomesTextarea.value = "";
  mostrarSucesso("Nomes apagados com sucesso.");
}

/**
 * Limpa o campo de temas.
 */
function limparGrupos() {
  const temasTextarea = document.getElementById("temas");
  if (temasTextarea.value.trim() === "") {
    mostrarErro("Não há temas para apagar!");
    return;
  }
  temasTextarea.value = "";
  mostrarSucesso("Temas apagados com sucesso.");
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

function gerarPDF() {
  try {
    console.log("[DEBUG] Iniciando geração de PDF");

    // Verifica se há grupos válidos
    const grupos = Array.from(document.querySelectorAll(".grupo"))
      .map((grupo, index) => {
        const membrosElement = grupo.querySelector("p");
        return {
          nome: `Grupo ${index + 1}`,
          tema:
            grupo
              .querySelector("h3")
              ?.textContent.replace(`Grupo ${index + 1}: `, "") ||
            "Tema não definido",
          membros:
            membrosElement?.textContent
              .replace("Membros: ", "")
              .split(", ")
              .filter((m) => m.trim() !== "") || [],
        };
      })
      .filter((g) => g.membros.length > 0);

    if (grupos.length === 0) {
      console.error("[ERRO] Nenhum grupo válido foi sorteado!");
      mostrarErro("Nenhum grupo válido foi sorteado!");
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

    const colors = {
      primary: "#2C3E50",
      secondary: "#27AE60",
      accent: "#3498DB",
      background: "#F0F8FF",
      header: "#2C3E50",
      text: "#2C3E50",
      statsHeader: "#27AE60",
      footer: "#27AE60",
    };

    const margin = 15;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

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
        img.src = "images/logo.png"; // Caminho corrigido
      });
    };

    const generateContent = () => {
      try {
        // Título do relatório
        doc.setFontSize(18);
        doc.setTextColor(colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("Sorteio de Grupos por Grupos ", pageWidth / 2, y, {
          align: "center",
        });
        y += 10;

        // Tabela de grupos
        const headers = ["Grupo", "Tema", "Membros"];
        const colWidths = [25, 55, 110];
        const rowHeight = 10;
        const headerHeight = 8;

        // Cabeçalho da tabela
        doc.setFillColor(colors.header);
        doc.rect(margin, y, pageWidth - margin * 2, headerHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor("#FFFFFF");
        let x = margin;
        headers.forEach((header, i) => {
          doc.text(header, x + 2, y + 6);
          x += colWidths[i];
        });
        y += headerHeight + 2;

        // Conteúdo da tabela
        doc.setFontSize(9);
        grupos.forEach((grupo, rowIndex) => {
          const rowData = [
            `Grupo ${rowIndex + 1}`,
            grupo.tema || "Tema não definido",
            grupo.membros?.join("\n") || "Sem membros",
          ];

          // Calcula a altura máxima da linha
          let maxLines = 1;
          rowData.forEach((cell, colIndex) => {
            const lines = doc.splitTextToSize(cell, colWidths[colIndex] - 4);
            maxLines = Math.max(maxLines, lines.length);
          });

          // Fundo alternado para linhas
          doc.setFillColor(rowIndex % 2 === 0 ? "#FFFFFF" : "#F8F9FA");
          doc.rect(
            margin,
            y,
            pageWidth - margin * 2,
            rowHeight * maxLines,
            "F"
          );

          // Adiciona o conteúdo das células
          x = margin;
          rowData.forEach((cell, colIndex) => {
            const lines = doc.splitTextToSize(cell, colWidths[colIndex] - 4);
            lines.forEach((line, lineIndex) => {
              doc.setTextColor(colors.text);
              doc.text(line, x + 2, y + 5 + lineIndex * 5);
            });
            x += colWidths[colIndex];
          });

          y += rowHeight * maxLines + 2;

          // Quebra de página se necessário
          if (y > pageHeight - margin) {
            doc.addPage();
            y = margin;
            doc.setFillColor(colors.background);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
          }
        });

        // Estatísticas
        y += 10;
        doc.setFontSize(12);
        doc.setTextColor(colors.statsHeader);
        doc.text("ESTATÍSTICAS DO SORTEIO", margin, y);
        y += 8;

        const totalGrupos = grupos.length;
        const totalMembros = grupos.reduce(
          (acc, grupo) => acc + (grupo.membros ? grupo.membros.length : 0),
          0
        );
        const temasUnicos = new Set(grupos.map((g) => g.tema)).size;

        const statsData = [
          ["Total de Grupos", totalGrupos],
          ["Total de Membros", totalMembros],
          ["Temas Únicos", temasUnicos],
        ];

        // Estilo do cabeçalho das estatísticas
        doc.setFillColor(colors.statsHeader);
        doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
        doc.setFontSize(10);
        doc.setTextColor("#FFFFFF");
        doc.text("Itens", margin + 2, y + 6);
        doc.text("Valores", pageWidth - margin - 20, y + 6, { align: "right" });
        y += 10;

        // Conteúdo das estatísticas
        statsData.forEach(([label, value], index) => {
          doc.setFillColor(index % 2 === 0 ? "#E8F5E9" : "#C8E6C9");
          doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
          doc.setTextColor(colors.text);
          doc.text(label, margin + 2, y + 6);
          doc.text(value.toString(), pageWidth - margin - 2, y + 6, {
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
          { align: "right" }
        );
        doc.text(
          "Created & Designed by Aquilivio Maria",
          pageWidth - margin - 2,
          footerY + 5,
          { align: "right" }
        );

        // Salva o PDF
        doc.save(`relatorio-sorteio-${Date.now()}.pdf`);
        console.log("[DEBUG] PDF gerado com sucesso");
      } catch (error) {
        console.error("[ERRO] Durante a geração do conteúdo:", error);
        mostrarErro("Falha na criação do conteúdo!");
      }
    };

    // Carregamento da logo e geração do conteúdo
    loadLogo()
      .then((logoLoaded) => {
        if (!logoLoaded) {
          doc.setFontSize(16);
          doc.setTextColor(colors.primary);
          doc.text("RandTeam", pageWidth / 2, y, { align: "center" });
          y += 20;
        }
        generateContent();
      })
      .catch((error) => {
        console.error("[ERRO] No carregamento da logo:", error);
        generateContent(); // Continua sem a logo
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
