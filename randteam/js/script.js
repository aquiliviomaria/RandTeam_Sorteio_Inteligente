function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

function sortearGrupos() {
  let nomes = document.getElementById("nomes").value.trim().split("\n");
  let temas = document.getElementById("temas").value.trim().split("\n");

  if (nomes.length < 2 || temas.length < 1) {
    alert("Adicione pelo menos dois nomes e um tema.");
    return;
  }

  nomes = embaralhar(nomes);
  temas = embaralhar(temas);

  let resultadoHTML = "<h3>Grupos Sorteados:</h3>";
  for (let i = 0; i < nomes.length; i++) {
    resultadoHTML += `<p>${nomes[i]} → ${temas[i % temas.length]}</p>`;
  }

  document.getElementById("resultado").innerHTML = resultadoHTML;
}

function sortearNomes() {
  let nomes = document.getElementById("nomes").value.trim().split("\n");
  if (nomes.length < 2) {
    alert("Adicione pelo menos dois nomes.");
    return;
  }
  nomes = embaralhar(nomes);
  document.getElementById("resultado").innerHTML =
    "<h3>Nomes Sorteados:</h3><p>" + nomes.join(", ") + "</p>";
}

function sortearOrdem() {
  let nomes = document.getElementById("nomes").value.trim().split("\n");
  if (nomes.length < 2) {
    alert("Adicione pelo menos dois nomes.");
    return;
  }
  nomes = embaralhar(nomes);
  let resultadoHTML = "<h3>Ordem Sorteada:</h3>";
  nomes.forEach((nome, i) => {
    resultadoHTML += `<p>${i + 1}. ${nome}</p>`;
  });
  document.getElementById("resultado").innerHTML = resultadoHTML;
}

window.addEventListener("load", function () {
  // Esconde a tela de carregamento e mostra o conteúdo principal
  document.getElementById("loadingScreen").style.display = "none";
  document.querySelector(".container").style.display = "block";
});
