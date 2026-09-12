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

/* ---------- Diagrama interactivo del modelo de caja ---------- */
const NOMBRES_CAPA = {
  margin: "margin — la distancia hasta el regalo del vecino (por fuera)",
  border: "border — la caja de cartón",
  padding: "padding — el papel de relleno (por dentro)",
  content: "contenido — el juguete (width × height)",
};

document.querySelectorAll("[data-capa]").forEach((boton) => {
  boton.addEventListener("click", () => {
    const capa = boton.dataset.capa;
    document.querySelectorAll("[data-capa-caja]").forEach((caja) =>
      caja.classList.toggle("resaltada", caja.dataset.capaCaja === capa)
    );
    const nombre = document.querySelector("[data-capa-nombre]");
    if (nombre) nombre.textContent = NOMBRES_CAPA[capa];
  });
});

/* ---------- Modo examen (auto-test de cada ficha) ---------- */
document.querySelectorAll("section.section").forEach((seccion) => {
  const preguntas = seccion.querySelectorAll("details.q");
  if (!preguntas.length) return;

  const aviso = document.createElement("p");
  aviso.className = "aviso-examen";
  aviso.textContent =
    "📝 Modo examen activado: las respuestas están bloqueadas. Responde mentalmente a cada pregunta y pulsa el botón para corregir.";

  const boton = document.createElement("button");
  boton.className = "btn small pink";
  boton.textContent = "📝 Activar modo examen";

  const barra = document.createElement("div");
  barra.className = "modo-examen-bar";
  barra.append(aviso, boton);
  preguntas[0].before(barra);

  boton.addEventListener("click", () => {
    const activo = seccion.classList.toggle("examen");
    if (activo) preguntas.forEach((p) => p.removeAttribute("open"));
    boton.textContent = activo ? "✔ Terminar y corregir" : "📝 Activar modo examen";
  });
});

/* ---------- Buscador de la portada ---------- */
const buscador = document.querySelector("[data-buscador]");

if (buscador) {
  const tarjetas = [...document.querySelectorAll(".card-grid a.card")];
  const vacio = document.querySelector("[data-sin-resultados]");
  buscador.addEventListener("input", () => {
    const texto = buscador.value.trim().toLowerCase();
    let visibles = 0;
    tarjetas.forEach((tarjeta) => {
      const coincide = tarjeta.textContent.toLowerCase().includes(texto);
      tarjeta.classList.toggle("oculta", !coincide);
      if (coincide) visibles++;
    });
    if (vacio) vacio.style.display = visibles ? "none" : "block";
  });
}

/* ---------- Flashcards ---------- */
const MAZO = [
  { t: "Tema 01", p: "¿Qué son los estándares web y por qué usarlos?", r: "Normas comunes para que las páginas funcionen en todos los navegadores y dispositivos. Ventajas: código reutilizable, mantenimiento fácil, accesibilidad, compatibilidad y mejor SEO." },
  { t: "Tema 02", p: "¿Qué diferencia hay entre <title> y <h1>?", r: "El <title> es el título del documento: se ve en la pestaña, los marcadores y Google. El <h1> es el título del contenido que se ve dentro de la página. Uno por documento; un <h1> por página." },
  { t: "Tema 02", p: "¿Qué hace <meta charset=\"utf-8\">?", r: "Declara la codificación de caracteres del documento para que se muestren bien acentos, emojis y otros idiomas (como el japonés). Ponerlo siempre." },
  { t: "Tema 02", p: "¿Qué diferencia hay entre <em> y <i>? ¿Y entre <strong> y <b>?", r: "<em> y <strong> son semánticos: comunican énfasis e importancia (los lectores de pantalla cambian el tono de voz). <i> y <b> son solo presentación: cursiva o negrita sin significado extra." },
  { t: "Tema 02", p: "¿Cuándo uso <ul> y cuándo <ol>?", r: "<ul> cuando el orden no importa (una lista de la compra). <ol> cuando el orden importa (instrucciones paso a paso). Los elementos de ambas se marcan con <li>." },
  { t: "Tema 02", p: "¿Por qué se dice que HTML es un lenguaje \"permisivo\"?", r: "Porque el navegador no se detiene ante errores de sintaxis: los corrige en silencio con sus propias reglas y sigue renderizando. Por eso hay que validar: validator.w3.org." },
  { t: "Tema 03", p: "¿Para qué sirve el atributo alt de una imagen?", r: "Describe la imagen para quien no puede verla: lectores de pantalla, si la imagen falla al cargar y los buscadores. Imagen decorativa → alt=\"\"." },
  { t: "Tema 03", p: "¿Imagen <img> o background-image de CSS?", r: "<img> si la imagen es contenido (aporta información, lleva alt). background-image si es pura decoración." },
  { t: "Tema 03", p: "¿Qué diferencia hay entre <article> y <section>?", r: "<article> envuelve contenido autónomo que se entendería fuera de la página (una entrada de blog). <section> agrupa partes temáticas de la propia página, idealmente con su encabezado." },
  { t: "Tema 04", p: "¿Qué es una pila de fuentes (font stack)?", r: "Una lista de fuentes separadas por comas: el navegador usa la primera que tenga instalada. Debe terminar siempre en una genérica (sans-serif, serif…) como red de seguridad." },
  { t: "Tema 04", p: "¿Diferencia entre em y rem?", r: "1em = el tamaño de fuente del elemento padre (se complica con anidamientos). 1rem = el tamaño de fuente de la raíz (<html>, 16px por defecto): mucho más predecible." },
  { t: "Tema 04", p: "¿Cómo uso una fuente de Google Fonts en mi página?", r: "Copias el <link> que te da fonts.google.com dentro del <head> y luego aplicas font-family: \"Nombre\", sans-serif; en tu CSS." },
  { t: "Tema 05", p: "¿Qué es el modelo de caja?", r: "Todo elemento es una caja con 4 capas: contenido (el juguete), padding (papel de relleno, dentro), border (la caja de cartón) y margin (distancia con el vecino, fuera)." },
  { t: "Tema 05", p: "¿Qué cambia con box-sizing: border-box?", r: "Que width/height incluyen el padding y el borde: la caja mide lo que declaras. En el modelo estándar width es solo el contenido y hay que sumar padding + border." },
  { t: "Tema 05", p: "¿Qué es el colapso de márgenes?", r: "Si dos márgenes verticales se tocan, no se suman: gana el mayor. Un margin-bottom de 50px junto a un margin-top de 30px dejan 50px de separación." },
  { t: "Tema 05", p: "Cita los 5 valores de position y dónde se ancla cada uno.", r: "static (el flujo normal, por defecto), relative (a sí mismo, deja su hueco), absolute (al ancestro posicionado más cercano, sale del flujo), fixed (al viewport, se queda fijo al hacer scroll), sticky (relativo hasta cruzar el umbral, luego fijo dentro de su contenedor)." },
  { t: "Tema 05", p: "¿Para qué sirve la propiedad clear?", r: "Evita que un elemento suba junto a un float. Valores: left, right y both. Para contenedores que envuelvan floats: clearfix, overflow: auto o display: flow-root." },
  { t: "Tema 05", p: "¿Qué diferencia hay entre una clase y un id?", r: "La clase (selector .nombre) puede aplicarse a varios elementos; es un apodo. El id (selector #nombre) es único por página; es el DNI." },
];

if (document.querySelector("[data-memoria]")) {
  let mazo = [];
  let indice = 0;
  let aciertos = 0;
  let repasos = 0;

  const tarjeta = document.querySelector("[data-tarjeta]");
  const pregunta = document.querySelector("[data-pregunta]");
  const respuesta = document.querySelector("[data-respuesta]");
  const temaCara = document.querySelector("[data-tema-cara]");
  const contador = document.querySelector("[data-contador-memoria]");
  const botonSabia = document.querySelector("[data-sabia]");
  const botonRepasar = document.querySelector("[data-repasar]");
  const botonBarajar = document.querySelector("[data-barajar]");

  const barajar = (lista) =>
    lista
      .map((carta) => [Math.random(), carta])
      .sort((a, b) => a[0] - b[0])
      .map((par) => par[1]);

  const pintar = () => {
    if (indice >= mazo.length) {
      tarjeta.classList.remove("volteada");
      temaCara.textContent = "Fin";
      pregunta.textContent = "🏁 ¡Mazo completado!";
      respuesta.innerHTML = `Acertaste <b>${aciertos} de ${mazo.length}</b> sin mirar` +
        (repasos ? ` (repasaste ${repasos}).` : ". ¡Nivelazo!") +
        ` Pulsa 🔀 Barajar para otra ronda.`;
      contador.textContent = `Fin del mazo · ✅ ${aciertos} aciertos · 🔁 ${repasos} repasos`;
      botonSabia.disabled = true;
      botonRepasar.disabled = true;
      celebrar();
      return;
    }
    const carta = mazo[indice];
    tarjeta.classList.remove("volteada");
    temaCara.textContent = carta.t;
    pregunta.textContent = carta.p;
    respuesta.innerHTML = carta.r;
    contador.textContent = `Tarjeta ${indice + 1} de ${mazo.length} · ✅ ${aciertos} aciertos · 🔁 ${repasos} repasos`;
  };

  const empezar = () => {
    mazo = barajar([...MAZO]);
    indice = 0;
    aciertos = 0;
    repasos = 0;
    botonSabia.disabled = false;
    botonRepasar.disabled = false;
    pintar();
  };

  tarjeta.addEventListener("click", () => tarjeta.classList.toggle("volteada"));
  botonSabia.addEventListener("click", () => { aciertos++; indice++; pintar(); });
  botonRepasar.addEventListener("click", () => { repasos++; mazo.push(mazo[indice]); indice++; pintar(); });
  botonBarajar.addEventListener("click", empezar);

  empezar();
}
