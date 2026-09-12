/* APUNTES.WEB — interacciones ligeras */

const STORAGE_KEY = "apuntes-web-dominados";

const leerDominados = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const guardarDominados = (lista) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));

/* Botón "marcar tema como dominado" (página de ficha) */
const boton = document.querySelector("[data-dominar]");

if (boton) {
  const tema = boton.dataset.dominar;
  const etiqueta = boton.querySelector("span");

  const pintar = () => {
    const hecho = leerDominados().includes(tema);
    boton.classList.toggle("done", hecho);
    etiqueta.textContent = hecho
      ? "✔ Dominado (pulsa para desmarcar)"
      : "✔ Marcar tema como dominado";
  };

  boton.addEventListener("click", () => {
    const lista = leerDominados();
    const pos = lista.indexOf(tema);
    if (pos === -1) {
      lista.push(tema);
    } else {
      lista.splice(pos, 1);
    }
    guardarDominados(lista);
    pintar();
  });

  pintar();
}

/* Insignias "Dominado" en las tarjetas de la portada */
document.querySelectorAll("[data-tema]").forEach((tarjeta) => {
  if (leerDominados().includes(tarjeta.dataset.tema)) {
    const insignia = document.createElement("span");
    insignia.className = "badge-done";
    insignia.textContent = "★ Dominado";
    tarjeta.appendChild(insignia);
  }
});
