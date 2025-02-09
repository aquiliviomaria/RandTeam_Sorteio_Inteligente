function animarSorteio() {
  let elementos = document.querySelectorAll("#resultado p");
  anime({
    targets: elementos,
    opacity: [0, 1],
    translateY: [-20, 0],
    delay: anime.stagger(100),
  });
}
