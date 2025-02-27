// Animação do título
document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("animated-title");
  const colors = ["#00e5ff", "#ff0055", "#00ff88", "#ffbb00"];
  let index = 0;

  setInterval(() => {
    title.style.color = colors[index];
    index = (index + 1) % colors.length;
  }, 4000);
});

// Menu mobile
document.querySelector(".menu-icon").addEventListener("click", function () {
  const nav = document.querySelector(".nav");
  nav.classList.toggle("active");
});

// Event listeners para os links do menu
document.querySelectorAll("[data-section]").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    showSection(this.dataset.section);
  });
});

// Função para mostrar seções e destacar cards
function showSection(section, targetId = null) {
  // Esconder todas as seções
  document
    .querySelectorAll(".content-section, .main-content")
    .forEach((div) => {
      div.style.display = "none";
      div.classList.remove("active");
    });

  // Mostrar seção solicitada
  const sectionId = `${section}-content`;
  const sectionElement = document.getElementById(sectionId);

  if (sectionElement) {
    sectionElement.style.display = "block";
    sectionElement.classList.add("active");

    // Scroll para o card específico após 100ms
    if (targetId) {
      setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });

          // Adiciona a classe 'selected' ao card correspondente
          const allCards = document.querySelectorAll(".info-card");
          allCards.forEach((card) => card.classList.remove("selected"));
          targetElement.classList.add("selected");
        }
      }, 100);
    }
  }
}

// Função para esconder seções
function hideSections() {
  document.querySelectorAll(".content-section").forEach((div) => {
    div.style.display = "none";
    div.classList.remove("active");
  });
  document.getElementById("inicio-content").style.display = "block";
}
