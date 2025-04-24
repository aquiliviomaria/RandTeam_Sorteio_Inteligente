// Variáveis globais
let tempoRestante = 0;
let intervaloContador = null;
let sorteioAtivo = false;
let ultimosNomes = [];
let ultimoTema = "";
let feedbackAtivo = null;

// Funções de limpeza com feedback
function limparTemas() {
  const temasTextarea = document.getElementById("temas");

  // Verifica se o campo de temas já está vazio
  if (temasTextarea.value.trim() === "") {
    mostrarErro("Não há temas para apagar!");
    return;
  }

  // Limpa o campo
  temasTextarea.value = "";
  mostrarSucesso("Temas apagados com sucesso!");
}

function limparNomesMasculinos() {
  const nomesMasculinosTextarea = document.getElementById("nomes-masculinos");

  // Verifica se o campo de nomes masculinos já está vazio
  if (nomesMasculinosTextarea.value.trim() === "") {
    mostrarErro("Não há nomes masculinos para apagar!");
    return;
  }

  // Limpa o campo
  nomesMasculinosTextarea.value = "";
  mostrarSucesso("Nomes masculinos apagados!");
}

function limparNomesFemininos() {
  const nomesFemininosTextarea = document.getElementById("nomes-femininos");

  // Verifica se o campo de nomes femininos já está vazio
  if (nomesFemininosTextarea.value.trim() === "") {
    mostrarErro("Não há nomes femininos para apagar!");
    return;
  }

  // Limpa o campo
  nomesFemininosTextarea.value = "";
  mostrarSucesso("Nomes femininos apagados!");
}

// Sistema de feedback
function mostrarErro(mensagem) {
  if (feedbackAtivo) feedbackAtivo.remove();

  const divErro = document.createElement("div");
  divErro.className = "feedback erro";
  divErro.textContent = mensagem;
  document.body.appendChild(divErro);
  feedbackAtivo = divErro;

  setTimeout(() => {
    divErro.style.right = "20px";
    setTimeout(() => {
      divErro.style.right = "-100%";
      setTimeout(() => divErro.remove(), 500);
    }, 3000);
  }, 100);
}

function mostrarSucesso(mensagem) {
  if (feedbackAtivo) feedbackAtivo.remove();

  const divSucesso = document.createElement("div");
  divSucesso.className = "feedback sucesso";
  divSucesso.textContent = mensagem;
  document.body.appendChild(divSucesso);
  feedbackAtivo = divSucesso;

  setTimeout(() => {
    divSucesso.style.right = "20px";
    setTimeout(() => {
      divSucesso.style.right = "-100%";
      setTimeout(() => divSucesso.remove(), 500);
    }, 3000);
  }, 100);
}

// Funções auxiliares
function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function iniciarContador() {
  tempoRestante = 30;
  const contador = document.getElementById("contador");
  contador.style.display = "inline";
  contador.textContent = `Próximo sorteio disponível em: ${tempoRestante}s`;

  intervaloContador = setInterval(() => {
    tempoRestante--;
    contador.textContent = `Próximo sorteio disponível em: ${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloContador);
      contador.style.display = "none";
      sorteioAtivo = false;
    }
  }, 1000);
}

function anunciarGrupos(tema, grupos, index, callback) {
  const resultadoDiv = document.getElementById("resultado");

  // Mostrar o tema primeiro
  if (index === 0) {
    const divTema = document.createElement("div");
    divTema.className = "grupo-tema";
    divTema.innerHTML = `<h2>Tema: ${tema}</h2>`;
    resultadoDiv.appendChild(divTema);
  }

  if (index >= grupos.length) {
    mostrarSucesso("Sorteio concluído com sucesso!");
    sorteioAtivo = true;
    if (callback) callback();
    return;
  }

  const grupo = grupos[index];
  const divGrupo = document.createElement("div");
  divGrupo.className = "grupo";
  divGrupo.innerHTML = `
        <h3>Grupo ${index + 1}</h3>
        <p>Membros: ${grupo.membros.join(", ")}</p>
    `;

  resultadoDiv.appendChild(divGrupo);

  // Animação de entrada
  setTimeout(() => {
    divGrupo.style.opacity = "1";
    divGrupo.style.transform = "translateY(0)";
  }, 100);

  // Próximo grupo com delay
  setTimeout(() => {
    anunciarGrupos(tema, grupos, index + 1, callback);
  }, 1500);
}

// Função principal do sorteio
function sortearPorGenero() {
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
  const nomesMasculinosInput = document
    .getElementById("nomes-masculinos")
    .value.trim();
  const nomesFemininosInput = document
    .getElementById("nomes-femininos")
    .value.trim();
  const prioridadeGenero = document.getElementById("prioridade-genero").value;
  const numeroGrupos = parseInt(document.getElementById("numero-grupos").value);
  const minPrioritario = parseInt(
    document.getElementById("elementos-por-grupo").value
  );

  const resultadoDiv = document.getElementById("resultado");
  const btnDownload = document.getElementById("btnDownload");

  resultadoDiv.innerHTML = "";
  btnDownload.style.display = "none";

  // Validações
  if (
    !temasInput ||
    !nomesMasculinosInput ||
    !nomesFemininosInput ||
    isNaN(numeroGrupos) ||
    isNaN(minPrioritario)
  ) {
    mostrarErro("Preencha todos os campos corretamente!");
    return;
  }

  const tema = temasInput;
  const nomesM = nomesMasculinosInput
    .split("\n")
    .filter((n) => n.trim() !== "");
  const nomesF = nomesFemininosInput.split("\n").filter((n) => n.trim() !== "");

  // Verificar quantidade mínima
  const totalPrioritario =
    prioridadeGenero === "masculino" ? nomesM.length : nomesF.length;
  if (totalPrioritario < numeroGrupos * minPrioritario) {
    mostrarErro(
      `Quantidade insuficiente de ${prioridadeGenero}s para o mínimo requerido!`
    );
    return;
  }

  // Lógica do sorteio
  const grupos = [];
  const masculinos = embaralharArray([...nomesM]);
  const femininos = embaralharArray([...nomesF]);

  for (let i = 0; i < numeroGrupos; i++) {
    const grupo = { membros: [] };

    // Adicionar mínimo prioritário
    for (let j = 0; j < minPrioritario; j++) {
      if (prioridadeGenero === "masculino" && masculinos.length > 0) {
        grupo.membros.push(masculinos.pop());
      } else if (prioridadeGenero === "feminino" && femininos.length > 0) {
        grupo.membros.push(femininos.pop());
      }
    }

    grupos.push(grupo);
  }

  // Distribuir membros restantes
  let todosMembros = [...masculinos, ...femininos].sort(
    () => Math.random() - 0.5
  );
  let grupoIndex = 0;

  while (todosMembros.length > 0) {
    grupos[grupoIndex].membros.push(todosMembros.pop());
    grupoIndex = (grupoIndex + 1) % numeroGrupos;
  }

  ultimosNomes = [...nomesM, ...nomesF];
  ultimoTema = tema;

  anunciarGrupos(tema, grupos, 0, () => {
    btnDownload.style.display = "block";
    iniciarContador();
  });
}

function gerarPDF() {
  try {
    const tema = ultimoTema;
    const grupos = Array.from(document.querySelectorAll(".grupo")).map(
      (grupo, index) => ({
        nome: `Grupo ${index + 1}`,
        membros: grupo
          .querySelector("p")
          .textContent.replace("Membros: ", "")
          .split(", ")
          .map((m) => m.trim()),
      })
    );

    if (grupos.length === 0) {
      mostrarErro("Nenhum grupo foi sorteado ainda!");
      return;
    }

    if (typeof jspdf === "undefined" || !window.jspdf) {
      mostrarErro("Biblioteca PDF não carregada!");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const colors = {
      primary: "#0d6efd", // Bootstrap azul
      secondary: "#198754", // Bootstrap verde
      background: "#f8f9fa", // cinza claro
      header: "#343a40", // cinza escuro
      text: "#212529", // texto Bootstrap
      statsHeader: "#0d6efd",
      footer: "#6c757d",
    };

    const margin = 15;
    const footerHeight = 25;
    let y = margin;
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

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
            console.error("Erro ao adicionar logo:", error);
            resolve(false);
          }
        };
        img.onerror = () => {
          console.warn("Logo não carregada");
          resolve(false);
        };
        img.src = "images/logo.png";
      });
    };

    const generateContent = () => {
      try {
        // Cabeçalho
        doc.setFontSize(18);
        doc.setTextColor(colors.primary);
        doc.setFont("helvetica", "bold");
        doc.text("Sorteio de Grupos por Gênero", pageWidth / 2, y, {
          align: "center",
        });
        y += 8;

        doc.setFontSize(12);
        doc.setTextColor(colors.secondary);
        doc.setFont("helvetica", "normal");
        doc.text(`Tema: ${tema}`, pageWidth / 2, y, { align: "center" });
        y += 15;

        // Tabela
        const headers = ["Grupo", "Membros"];
        const colWidths = [40, pageWidth - margin * 2 - 40];
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

        grupos.forEach((grupo, index) => {
          const rowData = [grupo.nome, grupo.membros.join(", ")];

          const heightRequired = rowHeight;

          // Verificar espaço para nova página
          if (y + heightRequired + footerHeight > pageHeight) {
            doc.addPage();
            y = margin;
            doc.setFillColor(colors.background);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
          }

          doc.setFillColor(index % 2 === 0 ? "#ffffff" : "#e9ecef");
          doc.rect(margin, y, pageWidth - margin * 2, heightRequired, "F");

          x = margin;
          rowData.forEach((cell, i) => {
            doc.setTextColor(colors.text);
            doc.text(cell, x + 2, y + 6);
            x += colWidths[i];
          });

          y += heightRequired + 2;
        });

        // Estatísticas
        y += 5;
        if (y + 30 + footerHeight > pageHeight) {
          doc.addPage();
          y = margin;
          doc.setFillColor(colors.background);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
        }

        doc.setFontSize(12);
        doc.setTextColor(colors.statsHeader);
        doc.setFont("helvetica", "bold");
        doc.text("ESTATÍSTICAS", margin, y);
        y += 8;

        const totalMembros = grupos.reduce(
          (acc, g) => acc + g.membros.length,
          0
        );
        const stats = [
          ["Total de Grupos", grupos.length],
          ["Total de Membros", totalMembros],
        ];

        doc.setFontSize(10);
        stats.forEach(([label, val], idx) => {
          const fill = idx % 2 === 0 ? "#d1e7dd" : "#bcd0c7";
          doc.setFillColor(fill);
          doc.setTextColor(colors.text);
          doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
          doc.text(label, margin + 2, y + 6);
          doc.text(val.toString(), pageWidth - margin - 2, y + 6, {
            align: "right",
          });
          y += 10;
        });

        // Rodapé
        const footerY = pageHeight - footerHeight + 5;
        const dataEmissao = new Date().toLocaleString("pt-PT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        doc.setFontSize(9);
        doc.setTextColor(colors.footer);
        doc.text(
          "RandTeam © 2025 | Sistema de Sorteio de Grupos",
          margin,
          footerY
        );
        doc.text(
          `Criado por Aquilivio Maria`,
          pageWidth - margin - 2,
          footerY,
          { align: "right" }
        );
        doc.text(
          `Emitido em: ${dataEmissao}`,
          pageWidth - margin - 2,
          footerY + 5,
          { align: "right" }
        );

        doc.save(`relatorio-sorteio-${Date.now()}.pdf`);
      } catch (error) {
        console.error(error);
        mostrarErro("Erro na geração do conteúdo!");
      }
    };

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
      .catch(() => generateContent());
  } catch (error) {
    console.error(error);
    mostrarErro("Erro crítico na geração do PDF!");
  }
}

// Sistema de feedback
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
