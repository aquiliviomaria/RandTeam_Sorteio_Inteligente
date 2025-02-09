function gerarPDF() {
  let resultado = document.getElementById("resultado").innerHTML;
  if (!resultado) {
    alert("Nenhum sorteio feito.");
    return;
  }

  let doc = new jsPDF();
  doc.text("Resultado do Sorteio", 10, 10);
  doc.fromHTML(resultado, 10, 20);
  doc.save("sorteio.pdf");
}
