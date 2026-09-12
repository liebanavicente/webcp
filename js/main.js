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

/* Checklists interactivos de la guía de actividades */
const TAREAS_KEY = "apuntes-web-tareas";

const leerTareas = () => {
  try {
    return JSON.parse(localStorage.getItem(TAREAS_KEY)) ?? [];
  } catch {
    return [];
  }
};

const guardarTareas = (lista) =>
  localStorage.setItem(TAREAS_KEY, JSON.stringify(lista));

const celebrar = () => {
  const simbolos = ["★", "✳", "✚", "✔"];
  const colores = ["#FFE156", "#FF90E8", "#B9FF66", "#9BE7FF"];
  for (let i = 0; i < 36; i++) {
    const pieza = document.createElement("span");
    pieza.textContent = simbolos[i % simbolos.length];
    pieza.style.cssText =
      `position:fixed;top:-30px;left:${Math.random() * 100}vw;z-index:999;` +
      `font-size:${14 + Math.random() * 20}px;pointer-events:none;color:${colores[i % colores.length]};` +
      `text-shadow:2px 2px 0 var(--ink);` +
      `transition:transform ${2 + Math.random() * 1.6}s ease-in,opacity 2.6s;`;
    document.body.appendChild(pieza);
    requestAnimationFrame(() => {
      pieza.style.transform = `translateY(${window.innerHeight + 80}px) rotate(${360 + Math.random() * 360}deg)`;
      pieza.style.opacity = "0";
    });
    setTimeout(() => pieza.remove(), 4200);
  }
};

document.querySelectorAll("[data-checklist]").forEach((lista) => {
  const id = lista.dataset.checklist;
  const cajas = [...lista.querySelectorAll("input[type=checkbox]")];
  const barra = document.querySelector(`[data-progreso="${id}"]`);
  const contador = document.querySelector(`[data-contador="${id}"]`);
  const tareasPrevias = new Set(leerTareas());

  const pintar = () => {
    const hechas = cajas.filter((caja) => caja.checked).length;
    if (barra) barra.style.width = `${(hechas / cajas.length) * 100}%`;
    if (contador) contador.textContent = `${hechas}/${cajas.length}`;
    return hechas;
  };

  cajas.forEach((caja) => {
    const item = caja.closest(".task-item");
    caja.checked = tareasPrevias.has(caja.value);
    item.classList.toggle("done", caja.checked);
    caja.addEventListener("change", () => {
      const guardadas = leerTareas();
      const pos = guardadas.indexOf(caja.value);
      if (caja.checked && pos === -1) guardadas.push(caja.value);
      if (!caja.checked && pos !== -1) guardadas.splice(pos, 1);
      guardarTareas(guardadas);
      item.classList.toggle("done", caja.checked);
      const hechas = pintar();
      if (hechas === cajas.length && lista.dataset.celebrado !== "si") {
        lista.dataset.celebrado = "si";
        celebrar();
      }
      if (hechas < cajas.length) lista.dataset.celebrado = "no";
    });
  });

  pintar();
});
