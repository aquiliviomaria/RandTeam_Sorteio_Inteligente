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

// Adicionando interação com as imagens dos modos
document.querySelectorAll(".item img").forEach((img) => {
  img.addEventListener("click", function () {
    // Efeito visual de clique
    this.style.transform = "scale(0.95)";
    setTimeout(() => {
      this.style.transform = "scale(1)";
    }, 200);

    // Mostra tooltip temporário
    const tooltip = document.createElement("div");
    tooltip.textContent = "Ver mais detalhes";
    tooltip.style.position = "absolute";
    tooltip.style.background = "rgba(0,0,0,0.7)";
    tooltip.style.color = "white";
    tooltip.style.padding = "5px 10px";
    tooltip.style.borderRadius = "5px";
    tooltip.style.top = this.getBoundingClientRect().top - 40 + "px";
    tooltip.style.left =
      this.getBoundingClientRect().left + this.width / 2 - 100 + "px";
    tooltip.style.width = "200px";
    tooltip.style.textAlign = "center";
    tooltip.style.zIndex = "1000";
    document.body.appendChild(tooltip);

    setTimeout(() => {
      tooltip.remove();
    }, 2000);
  });
});
