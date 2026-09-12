/* Fondo 3D del hero de portada — subrayados ondulados con WebGL (Three.js) */

(() => {
  const contenedor = document.querySelector("[data-hero-3d]");
  if (!contenedor) return;

  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sinMovimiento || typeof THREE === "undefined") return;

  let ancho = contenedor.clientWidth;
  let alto = contenedor.clientHeight;
  if (!ancho || !alto) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return;
  }

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(50, ancho / alto, 0.1, 100);
  camara.position.z = 9;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(ancho, alto);
  contenedor.appendChild(renderer.domElement);

  /* Textura de trazo de rotulador: manchurrones de opacidad irregular
     con los bordes superior/inferior difuminados, como si un
     subrayador hubiera pasado sin presión uniforme. */
  const crearTexturaSubrayador = () => {
    const lienzo = document.createElement("canvas");
    lienzo.width = 512;
    lienzo.height = 128;
    const ctx = lienzo.getContext("2d");

    for (let i = 0; i < 55; i++) {
      const x = Math.random() * lienzo.width;
      const y = lienzo.height / 2 + (Math.random() - 0.5) * lienzo.height * 0.75;
      const radio = 30 + Math.random() * 70;
      const alfa = 0.35 + Math.random() * 0.65;
      const gradiente = ctx.createRadialGradient(x, y, 0, x, y, radio);
      gradiente.addColorStop(0, `rgba(255,255,255,${alfa})`);
      gradiente.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradiente;
      ctx.beginPath();
      ctx.ellipse(x, y, radio, radio * (0.5 + Math.random() * 0.5), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Calvas irregulares, como si al rotulador se le acabara la tinta */
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 16; i++) {
      const x = Math.random() * lienzo.width;
      const y = lienzo.height / 2 + (Math.random() - 0.5) * lienzo.height * 0.6;
      const radio = 18 + Math.random() * 40;
      const alfa = 0.25 + Math.random() * 0.45;
      const gradiente = ctx.createRadialGradient(x, y, 0, x, y, radio);
      gradiente.addColorStop(0, `rgba(255,255,255,${alfa})`);
      gradiente.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradiente;
      ctx.beginPath();
      ctx.ellipse(x, y, radio, radio * (0.4 + Math.random() * 0.4), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "destination-in";
    const vertical = ctx.createLinearGradient(0, 0, 0, lienzo.height);
    vertical.addColorStop(0, "rgba(255,255,255,0)");
    vertical.addColorStop(0.2, "rgba(255,255,255,1)");
    vertical.addColorStop(0.8, "rgba(255,255,255,1)");
    vertical.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = vertical;
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.globalCompositeOperation = "source-over";

    const textura = new THREE.CanvasTexture(lienzo);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.ClampToEdgeWrapping;
    textura.repeat.set(6, 1);
    return textura;
  };

  const texturaSubrayador = crearTexturaSubrayador();

  const paleta = [0xff90e8, 0x9be7ff, 0xffe156, 0xb9ff66, 0xd9b8ff, 0xffc97d, 0xff8a8a];
  const grupo = new THREE.Group();
  const cintas = [];
  const totalCintas = 7;
  const segmentos = 64;
  const anchoOnda = 28;

  const crearGeometriaCinta = () => {
    const posiciones = new Float32Array((segmentos + 1) * 2 * 3);
    const uvs = new Float32Array((segmentos + 1) * 2 * 2);
    const indices = [];
    for (let i = 0; i <= segmentos; i++) {
      const u = i / segmentos;
      uvs[i * 4] = u;
      uvs[i * 4 + 1] = 1;
      uvs[i * 4 + 2] = u;
      uvs[i * 4 + 3] = 0;
    }
    for (let i = 0; i < segmentos; i++) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, b, c, b, d, c);
    }
    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
    geometria.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometria.setIndex(indices);
    return geometria;
  };

  for (let i = 0; i < totalCintas; i++) {
    const geometria = crearGeometriaCinta();
    const color = paleta[i % paleta.length];
    const material = new THREE.MeshBasicMaterial({
      color,
      alphaMap: texturaSubrayador,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const malla = new THREE.Mesh(geometria, material);
    malla.frustumCulled = false;

    const parametros = {
      grosor: 0.22 + Math.random() * 0.18,
      ampY: 0.5 + Math.random() * 0.6,
      freqY: 0.14 + Math.random() * 0.12,
      faseY: Math.random() * Math.PI * 2,
      ampZ: 0.3 + Math.random() * 0.35,
      freqZ: 0.09 + Math.random() * 0.08,
      faseZ: Math.random() * Math.PI * 2,
      velocidad: 0.12 + Math.random() * 0.12,
      baseY: (i - (totalCintas - 1) / 2) * 0.95 + (Math.random() - 0.5) * 0.35,
      baseZ: -2.8 + Math.random() * 3.2,
    };

    grupo.add(malla);
    cintas.push({ geometria, parametros });
  }

  escena.add(grupo);

  const actualizarCinta = (cinta, tiempo) => {
    const { geometria, parametros } = cinta;
    const pos = geometria.attributes.position.array;
    const { grosor, ampY, freqY, faseY, ampZ, freqZ, faseZ, velocidad, baseY, baseZ } = parametros;

    for (let i = 0; i <= segmentos; i++) {
      const t = i / segmentos;
      const x = -anchoOnda / 2 + anchoOnda * t;
      const y = baseY + ampY * Math.sin(x * freqY + tiempo * velocidad + faseY);
      const z = baseZ + ampZ * Math.sin(x * freqZ + tiempo * velocidad * 0.7 + faseZ);

      const iTop = i * 2 * 3;
      const iBase = iTop + 3;

      pos[iTop] = x;
      pos[iTop + 1] = y + grosor;
      pos[iTop + 2] = z;

      pos[iBase] = x;
      pos[iBase + 1] = y - grosor;
      pos[iBase + 2] = z;
    }

    geometria.attributes.position.needsUpdate = true;
  };

  let objetivoX = 0;
  let objetivoY = 0;

  window.addEventListener("pointermove", (evento) => {
    objetivoX = (evento.clientX / window.innerWidth - 0.5) * 0.35;
    objetivoY = (evento.clientY / window.innerHeight - 0.5) * 0.2;
  });

  let idAnimacion = null;
  const reloj = new THREE.Clock();

  const animar = () => {
    const tiempo = reloj.getElapsedTime();
    cintas.forEach((cinta) => actualizarCinta(cinta, tiempo));
    grupo.rotation.y += (objetivoX - grupo.rotation.y) * 0.04;
    grupo.rotation.x += (-objetivoY - grupo.rotation.x) * 0.04;
    renderer.render(escena, camara);
    idAnimacion = requestAnimationFrame(animar);
  };

  animar();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(idAnimacion);
    } else {
      animar();
    }
  });

  new ResizeObserver(() => {
    ancho = contenedor.clientWidth;
    alto = contenedor.clientHeight;
    if (!ancho || !alto) return;
    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
    renderer.setSize(ancho, alto);
  }).observe(contenedor);
})();
