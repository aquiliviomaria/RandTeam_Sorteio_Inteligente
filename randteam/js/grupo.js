let tempoRestante = 0;
let intervaloContador = null;
let sorteioAtivo = false;

// Função para sortear grupos
function sortearGrupos() {
  if (sorteioAtivo) {
    const confirmar = confirm(
      "Um sorteio já foi realizado. Deseja sortear novamente?"
    );
    if (!confirmar) return;

    // Resetar contador se confirmado
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

  // Limpa o resultado anterior e desabilita o botão de download
  resultadoDiv.innerHTML = "";
  btnDownload.style.display = "none";

  // Validação dos campos
  if (!nomesInput || !temasInput) {
    mostrarErro("Por favor, preencha todos os campos.");
    return;
  }

  const nomes = nomesInput.split("\n").filter((nome) => nome.trim() !== "");
  const temas = temasInput.split("\n").filter((tema) => tema.trim() !== "");

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

  // Desabilita o botão de sortear durante o processo
  btnSortear.disabled = true;

  // Lógica para sortear os grupos
  const grupos = [];
  const nomesEmbaralhados = embaralharArray([...nomes]);

  for (let i = 0; i < temas.length; i++) {
    const grupo = {
      tema: temas[i],
      membros: [],
    };

    // Distribui os nomes nos grupos
    while (
      grupo.membros.length < Math.ceil(nomes.length / temas.length) &&
      nomesEmbaralhados.length > 0
    ) {
      grupo.membros.push(nomesEmbaralhados.pop());
    }

    grupos.push(grupo);
  }

  // Exibe os grupos um por um
  anunciarGrupos(grupos, 0, () => {
    // Habilita o botão de download após o sorteio
    btnDownload.style.display = "block";
    btnSortear.disabled = false;
  });
  iniciarContador();
}

function iniciarContador() {
  const btnSortear = document.getElementById("btnSortear");
  const contador = document.getElementById("contador");

  sorteioAtivo = true;
  tempoRestante = 30;
  btnSortear.disabled = true;
  contador.style.display = "inline";

  intervaloContador = setInterval(() => {
    tempoRestante--;
    contador.textContent = `Aguarde ${tempoRestante}s`;

    if (tempoRestante <= 0) {
      clearInterval(intervaloContador);
      btnSortear.disabled = false;
      contador.style.display = "none";
      sorteioAtivo = false;
    }
  }, 1000);
}

// Função para embaralhar um array
function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Função para exibir os grupos um por um
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

  // Animação de entrada
  grupoDiv.style.opacity = 0;
  setTimeout(() => {
    grupoDiv.style.opacity = 1;
    grupoDiv.style.transition = "opacity 1s ease-in-out";
  }, 100);

  // Intervalo para o próximo grupo
  setTimeout(() => {
    anunciarGrupos(grupos, index + 1, callback);
  }, 2000); // 2 segundos entre cada grupo
}

// Função para limpar os nomes
function limparNomes() {
  const nomesTextarea = document.getElementById("nomes");
  if (nomesTextarea.value.trim() === "") {
    mostrarErro("Não há nomes para apagar!");
    return;
  }
  nomesTextarea.value = "";
  mostrarSucesso("Nomes apagados com sucesso.");
}

// Função para limpar os grupos
function limparGrupos() {
  const temasTextarea = document.getElementById("temas");
  if (temasTextarea.value.trim() === "") {
    mostrarErro("Não há temas para apagar!");
    return;
  }
  temasTextarea.value = "";
  mostrarSucesso("Temas apagados com sucesso.");
}
// Função para gerar PDF
function gerarPDF() {
  const gruposDivs = document.querySelectorAll(".grupo");
  if (gruposDivs.length === 0) {
    mostrarErro("Nenhum grupo foi sorteado ainda!");
    return;
  }
  // Inicializa o jsPDF
  const doc = new jsPDF();
  // Adiciona a logo (substitua pela URL da sua logo)
  const logoUrl = "./images/logo.png";
  doc.addImage(logoUrl, "PNG", 10, 10, 50, 20);

  // Adiciona um título ao PDF
  doc.setFontSize(22);
  doc.text("Resultado do Sorteio", 70, 20);

  // Variável para controlar a posição vertical no PDF
  let y = 40;

  gruposDivs.forEach((grupo, index) => {
    const tema =
      grupo.querySelector("h3")?.textContent || "Tema não encontrado";
    const membros =
      grupo.querySelector("p")?.textContent || "Membros não encontrados";

    // Adiciona o tema
    doc.setFontSize(16);
    doc.text(tema, 10, y);

    // Adiciona os membros do grupo
    doc.setFontSize(12);
    doc.text(membros, 10, y + 10);

    // Incrementa a posição Y para evitar sobreposição de texto
    y += 20;

    // Verifica se está perto do final da página e adiciona nova página se necessário
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });

  // Adiciona créditos no final
  doc.setFontSize(10);
  doc.text("Desenvolvido por: Aquilivio Maria", 10, y + 10);

  // Salva o PDF
  doc.save("sorteio_grupos.pdf");
}

// Função para mostrar erros
function mostrarErro(mensagem) {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.classList.add("feedback", "erro");
  feedbackDiv.textContent = mensagem;

  document.body.appendChild(feedbackDiv);

  // Animação de entrada
  setTimeout(() => {
    feedbackDiv.style.right = "20px";
  }, 100);

  // Remove o feedback após 3 segundos
  setTimeout(() => {
    feedbackDiv.style.right = "-100%";
    setTimeout(() => {
      feedbackDiv.remove();
    }, 500);
  }, 3000);
}

// Função para mostrar sucesso
function mostrarSucesso(mensagem) {
  const feedbackDiv = document.createElement("div");
  feedbackDiv.classList.add("feedback", "sucesso");
  feedbackDiv.textContent = mensagem;

  document.body.appendChild(feedbackDiv);

  // Animação de entrada
  setTimeout(() => {
    feedbackDiv.style.right = "20px";
  }, 100);

  // Remove o feedback após 3 segundos
  setTimeout(() => {
    feedbackDiv.style.right = "-100%";
    setTimeout(() => {
      feedbackDiv.remove();
    }, 500);
  }, 3000);
}
