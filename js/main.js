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

/* ---------- Ejercicios de huecos (estilo Sololearn) ---------- */
const EJERCICIOS_HUECOS = [
  {
    tema: "Tema 02",
    intro: "Toda página empieza igual: idioma del documento y codificación de caracteres. Completa las dos etiquetas.",
    codigo: '<html ~~~="es">\n  <head>\n    <meta ~~~="utf-8">',
    soluciones: ["lang", "charset"],
    opciones: ["lang", "charset", "src", "alt", "title"],
    explicacion: "lang=\"es\" declara el idioma de la página (clave para lectores de pantalla y SEO) y charset=\"utf-8\" hace que los acentos y emojis se vean bien.",
  },
  {
    tema: "Tema 03",
    intro: "Esta imagen tiene dos atributos imprescindibles: la ruta y la descripción.",
    codigo: '<img ~~~="images/gato.jpg"\n     ~~~="Un gato gris dormido en el sofá">',
    soluciones: ["src", "alt"],
    opciones: ["src", "alt", "href", "title", "lang"],
    explicacion: "src (source) es la ruta de la imagen; alt es su descripción para quien no puede verla. El atributo href es de los enlaces, no de las imágenes.",
  },
  {
    tema: "Tema 02",
    intro: "Lista de la compra: el orden NO importa. Usa la lista sin orden… y no olvides cerrar.",
    codigo: "<~~~>\n  <~~~>Leche</~~~>\n  <li>Pan</li>\n</~~~>",
    soluciones: ["ul", "li", "/li", "/ul"],
    opciones: ["ul", "ol", "li", "/li", "/ul", "/ol"],
    explicacion: "ul = unordered list (sin orden). Cada elemento va en <li> y todo se cierra: </li> y </ul>.",
  },
  {
    tema: "Tema 02",
    intro: "Instrucciones paso a paso: aquí el orden SÍ importa.",
    codigo: "<~~~>\n  <~~~>Abre el editor</~~~>\n  <li>Guarda el archivo</li>\n</~~~>",
    soluciones: ["ol", "li", "/li", "/ol"],
    opciones: ["ol", "ul", "li", "/li", "/ol", "/ul"],
    explicacion: "ol = ordered list: el navegador la numera automáticamente (1, 2, 3…). La estructura por dentro es igual que la <ul>.",
  },
  {
    tema: "Tema 02",
    intro: "Un párrafo con énfasis (cursiva) e importancia (negrita). Coloca las cuatro etiquetas.",
    codigo: "<p>El examen es <~~~>mañana</~~~> por la mañana.</p>\n<p><~~~>¡No llegues tarde!</~~~></p>",
    soluciones: ["<em>", "</em>", "<strong>", "</strong>"],
    opciones: ["<em>", "</em>", "<strong>", "</strong>"],
    explicacion: "<em> da énfasis (cambia el matiz de la frase) y <strong> importancia fuerte. Y nunca olvides la etiqueta de cierre.",
  },
  {
    tema: "Tema 02",
    intro: "Conecta el CSS y el JavaScript externos desde el <head>.",
    codigo: '<link rel="~~~" href="styles.css">\n<~~~ src="app.js"></~~~>',
    soluciones: ["stylesheet", "script", "/script"],
    opciones: ["stylesheet", "script", "/script", "style", "icon"],
    explicacion: "La hoja de estilos se enlaza con rel=\"stylesheet\". El script lleva src y SU etiqueta de cierre: <script> no es un elemento vacío.",
  },
  {
    tema: "Tema 03",
    intro: "Una imagen con su pie de foto, bien vinculados entre sí.",
    codigo: '<~~~>\n  <img src="trex.jpg" alt="Esqueleto de T-Rex">\n  <~~~>Museo de Manchester</~~~>\n</~~~>',
    soluciones: ["figure", "figcaption", "/figcaption", "/figure"],
    opciones: ["figure", "figcaption", "/figcaption", "/figure"],
    explicacion: "<figure> agrupa la figura y <figcaption> es su pie. Así el lector de pantalla entiende que ese pie describe a ESA imagen.",
  },
  {
    tema: "Tema 05",
    intro: "Aplica las tres propiedades del \"regalo\" a esta caja.",
    codigo: ".caja {\n  ~~~: 3px solid black;\n  ~~~-top: 20px;\n  ~~~: 12px;\n}",
    soluciones: ["border", "margin", "padding"],
    opciones: ["border", "margin", "padding", "width", "color"],
    explicacion: "border dibuja la caja de cartón, margin-top separa 20px hacia arriba (por fuera) y padding da 12px de aire interior.",
  },
  {
    tema: "Tema 05",
    intro: "Este cartel se queda pegado a la pantalla aunque hagas scroll. ¿Qué position es?",
    codigo: ".cartel {\n  position: ~~~;\n  top: 0;\n}",
    soluciones: ["fixed"],
    opciones: ["fixed", "absolute", "sticky", "relative", "static"],
    explicacion: "fixed se ancla al viewport: se queda fijo al hacer scroll. absolute se ancla a su ancestro posicionado y sticky solo se pega dentro de su contenedor.",
  },
  {
    tema: "Tema 05",
    intro: "La foto flota a la izquierda y el pie debe quedarse debajo del todo.",
    codigo: ".foto {\n  float: ~~~;\n}\n.pie {\n  clear: ~~~;\n}",
    soluciones: ["left", "both"],
    opciones: ["left", "right", "both", "none"],
    explicacion: "float: left pega la foto a la izquierda y el texto la rodea; clear: both impide que el pie suba para situarse junto a la foto.",
  },
  {
    tema: "Actividad 2",
    intro: "Explica una sigla la primera vez que aparece en el texto.",
    codigo: '<abbr ~~~="Cascading Style Sheets">CSS</abbr>',
    soluciones: ["title"],
    opciones: ["title", "alt", "lang", "href"],
    explicacion: "<abbr> marca la abreviatura y su atributo title guarda el significado completo (se ve al pasar el ratón por encima).",
  },
  {
    tema: "Actividad 2",
    intro: "Una fecha bonita para las personas y clara para las máquinas.",
    codigo: '<time ~~~="2026-09-12">12 de septiembre de 2026</time>',
    soluciones: ["datetime"],
    opciones: ["datetime", "date", "title", "lang"],
    explicacion: "El texto se lee bonito para humanos; datetime lleva la fecha en formato ISO (AAAA-MM-DD) para buscadores y lectores de pantalla.",
  },
];

if (document.querySelector("[data-huecos]")) {
  const escapar = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const barajar = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

  let indice = 0;
  let rellenos = [];
  let bloqueados = [];
  let fallos = [];
  let seleccionado = null;
  let pool = [];

  const elTema = document.querySelector("[data-h-tema]");
  const elIntro = document.querySelector("[data-h-intro]");
  const elCodigo = document.querySelector("[data-h-codigo]");
  const elOpciones = document.querySelector("[data-h-opciones]");
  const elFeedback = document.querySelector("[data-h-feedback]");
  const btnVerificar = document.querySelector("[data-h-verificar]");
  const btnSiguiente = document.querySelector("[data-h-siguiente]");
  const elContador = document.querySelector("[data-h-contador]");

  const ejercicio = () => EJERCICIOS_HUECOS[indice];

  const pintarCodigo = () => {
    let n = 0;
    elCodigo.innerHTML = ejercicio().codigo.split("\n").map((linea) => {
      const trozos = linea.split("~~~");
      let out = "";
      trozos.forEach((trozo, i) => {
        out += escapar(trozo);
        if (i < trozos.length - 1) {
          const num = n++;
          const clases = ["hueco"];
          if (!rellenos[num]) clases.push("vacio");
          if (seleccionado === num) clases.push("seleccionado");
          if (bloqueados[num]) clases.push("ok");
          if (fallos.includes(num)) clases.push("ko");
          out += `<button type="button" class="${clases.join(" ")}" data-hueco="${num}">${rellenos[num] ? escapar(rellenos[num]) : ""}</button>`;
        }
      });
      return out;
    }).join("\n");
    elCodigo.querySelectorAll("[data-hueco]").forEach((h) =>
      h.addEventListener("click", () => tocarHueco(Number(h.dataset.hueco)))
    );
  };

  const pintarOpciones = () => {
    elOpciones.innerHTML = "";
    pool.forEach((token) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "opcion";
      chip.textContent = token;
      chip.addEventListener("click", () => colocar(token));
      elOpciones.appendChild(chip);
    });
  };

  const pintarVerificar = () => {
    btnVerificar.disabled = rellenos.some((v) => v === null);
  };

  const mensaje = (texto, tipo) => {
    elFeedback.className = `retroalimentacion ${tipo}`;
    elFeedback.textContent = texto;
  };

  const limpiarFeedback = () => {
    elFeedback.className = "retroalimentacion";
    elFeedback.textContent = "";
  };

  function tocarHueco(num) {
    if (bloqueados[num]) return;
    if (rellenos[num]) {
      pool.push(rellenos[num]);
      rellenos[num] = null;
    }
    seleccionado = seleccionado === num ? null : num;
    limpiarFeedback();
    pintarCodigo();
    pintarOpciones();
    pintarVerificar();
  }

  function colocar(token) {
    if (seleccionado === null) {
      mensaje("👆 Primero toca un hueco del código para seleccionarlo.", "mal");
      return;
    }
    if (rellenos[seleccionado]) pool.push(rellenos[seleccionado]);
    rellenos[seleccionado] = token;
    pool.splice(pool.indexOf(token), 1);
    const siguienteVacio = rellenos.findIndex((v, i) => v === null && !bloqueados[i]);
    seleccionado = siguienteVacio === -1 ? null : siguienteVacio;
    limpiarFeedback();
    pintarCodigo();
    pintarOpciones();
    pintarVerificar();
  }

  function verificar() {
    const ej = ejercicio();
    fallos = [];
    ej.soluciones.forEach((solucion, i) => {
      if (rellenos[i] === solucion) {
        bloqueados[i] = true;
      } else {
        fallos.push(i);
      }
    });
    pintarCodigo();

    if (fallos.length === 0) {
      mensaje(`✅ ¡Correcto! ${ej.explicacion}`, "bien");
      btnSiguiente.hidden = false;
      seleccionado = null;
      celebrar();
    } else {
      mensaje("❌ Los huecos en rojo no van ahí. Míralos bien e inténtalo otra vez.", "mal");
      setTimeout(() => {
        fallos.forEach((i) => {
          if (!bloqueados[i] && rellenos[i]) {
            pool.push(rellenos[i]);
            rellenos[i] = null;
          }
        });
        fallos = [];
        pintarCodigo();
        pintarOpciones();
        pintarVerificar();
      }, 1000);
    }
  }

  function cargar() {
    if (indice >= EJERCICIOS_HUECOS.length) {
      elContador.textContent = `🏁 ¡${EJERCICIOS_HUECOS.length} de ${EJERCICIOS_HUECOS.length}!`;
      elTema.textContent = "Fin";
      elIntro.textContent = "Has completado todos los retos. Ahora los huecos los rellenas tú en un archivo vacío.";
      elCodigo.textContent = "<!DOCTYPE html>\n<html ~~~>\n  <!-- te esperamos -->";
      elOpciones.innerHTML = "";
      limpiarFeedback();
      mensaje("⭐ Nivelazo. Vuelve a las fichas o repasa con las flashcards; aquí ya no hay nada que hacer.", "bien");
      btnVerificar.hidden = true;
      btnSiguiente.hidden = false;
      btnSiguiente.textContent = "↻ Empezar de nuevo";
      return;
    }

    const ej = ejercicio();
    rellenos = ej.soluciones.map(() => null);
    bloqueados = ej.soluciones.map(() => false);
    fallos = [];
    seleccionado = null;
    pool = barajar([...ej.opciones]);

    elContador.textContent = `Ejercicio ${indice + 1} de ${EJERCICIOS_HUECOS.length}`;
    elTema.textContent = ej.tema;
    elIntro.textContent = ej.intro;
    btnSiguiente.hidden = true;
    btnVerificar.hidden = false;
    btnVerificar.disabled = true;
    limpiarFeedback();
    pintarCodigo();
    pintarOpciones();
  }

  btnVerificar.addEventListener("click", verificar);
  btnSiguiente.addEventListener("click", () => {
    indice = indice + 1 > EJERCICIOS_HUECOS.length ? 1 : indice + 1;
    if (indice > EJERCICIOS_HUECOS.length) indice = 1;
    if (btnSiguiente.textContent.includes("Empezar")) indice = 0;
    btnSiguiente.textContent = "Siguiente ▶";
    cargar();
  });

  cargar();
}
