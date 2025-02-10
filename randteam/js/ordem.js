// Função para sortear a ordem
function sortearOrdem() {
  const gruposInput = document.getElementById("grupos").value.trim();
  const membrosInput = document.getElementById("membros").value.trim();
  const resultadoDiv = document.getElementById("resultado");

  // Limpa o resultado anterior
  resultadoDiv.innerHTML = "";

  // Validação dos campos
  if (!gruposInput) {
    alert("Por favor, insira os nomes dos grupos.");
    return;
  }

  // Separa os grupos e membros em arrays
  const grupos = gruposInput.split("\n").filter((grupo) => grupo.trim() !== "");
  const membros = membrosInput
    .split("\n")
    .filter((membro) => membro.trim() !== "");

  // Embaralha os grupos
  const gruposEmbaralhados = embaralharArray(grupos);

  // Embaralha os membros (se houver)
  const membrosEmbaralhados =
    membros.length > 0 ? embaralharArray(membros) : [];

  // Exibe o resultado do sorteio
  let resultadoHTML = "<h2>Ordem Sorteada:</h2>";

  // Exibe a ordem dos grupos
  resultadoHTML += "<h3>Grupos:</h3>";
  resultadoHTML += "<ol>";
  gruposEmbaralhados.forEach((grupo, index) => {
    resultadoHTML += `<li>${grupo}</li>`;
  });
  resultadoHTML += "</ol>";

  // Exibe a ordem dos membros (se houver)
  if (membrosEmbaralhados.length > 0) {
    resultadoHTML += "<h3>Membros:</h3>";
    resultadoHTML += "<ol>";
    membrosEmbaralhados.forEach((membro, index) => {
      resultadoHTML += `<li>${membro}</li>`;
    });
    resultadoHTML += "</ol>";
  }

  resultadoDiv.innerHTML = resultadoHTML;
}

// Função para embaralhar um array
function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
