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

  // Lógica do sorteio
  const grupos = [];
  const nomesEmbaralhados = embaralharArray([...nomes]);

  for (let i = 0; i < temas.length; i++) {
    const grupo = {
      tema: temas[i],
      membros: [],
    };

    while (
      grupo.membros.length < Math.ceil(nomes.length / temas.length) &&
      nomesEmbaralhados.length > 0
    ) {
      grupo.membros.push(nomesEmbaralhados.pop());
    }

    grupos.push(grupo);
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
    // Verificar se o tema está definido
    if (!ultimoTema) {
      mostrarErro("Nenhum tema definido para o sorteio!");
      return;
    }

    const grupos = Array.from(document.querySelectorAll(".grupo"))
      .map((grupo, index) => {
        const membrosElement = grupo.querySelector("p");
        if (!membrosElement) {
          console.warn(`Grupo ${index + 1} sem elemento de membros`);
          return null;
        }

        return {
          nome: `Grupo ${index + 1}`,
          membros: membrosElement.textContent
            .replace("Membros: ", "")
            .split(", ")
            .filter((m) => m.trim() !== ""),
        };
      })
      .filter((g) => g !== null);

    if (grupos.length === 0) {
      mostrarErro("Nenhum grupo válido foi sorteado!");
      return;
    }

    if (typeof jspdf === "undefined" || !window.jspdf) {
      mostrarErro("Biblioteca PDF não carregada corretamente!");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // ... (mantido o mesmo código de cores e configurações iniciais)

    const loadLogo = () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";

        img.onload = () => {
          try {
            const logoWidth = 40;
            const logoHeight = 15;
            const logoX = (pageWidth - logoWidth) / 2;

            // Verificar espaço disponível
            if (y + logoHeight > doc.internal.pageSize.getHeight() - 50) {
              doc.addPage();
              y = margin;
            }

            doc.addImage(img, "PNG", logoX, y, logoWidth, logoHeight);
            y += logoHeight + 10;
            resolve(true);
          } catch (error) {
            console.error("Erro na logo:", error);
            resolve(false);
          }
        };

        img.onerror = (err) => {
          console.error("Erro ao carregar logo:", err);
          resolve(false);
        };

        img.src = "./images/logo.png";
      });
    };

    const generateContent = async () => {
      try {
        // ... (mantido o mesmo código de geração de conteúdo)
      } catch (error) {
        console.error("Erro na geração:", error);
        mostrarErro("Falha ao criar conteúdo do PDF!");
        throw error;
      }
    };

    // Execução principal
    loadLogo()
      .then((logoLoaded) => {
        if (!logoLoaded) {
          doc.setFontSize(12);
          doc.setTextColor(colors.primary);
          doc.text("Relatório de Grupos", pageWidth / 2, y, {
            align: "center",
          });
          y += 15;
        }
        return generateContent();
      })
      .catch((error) => {
        console.error("Erro no fluxo principal:", error);
        mostrarErro("Falha crítica durante o processo!");
      });
  } catch (error) {
    console.error("Erro crítico:", error);
    mostrarErro("Falha grave na geração do PDF!");
  }
}
