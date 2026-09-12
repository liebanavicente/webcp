/* Fondo 3D del hero de portada — WebGL con Three.js */

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

  escena.add(new THREE.HemisphereLight(0xffffff, 0x333344, 1.1));
  const sol = new THREE.DirectionalLight(0xffffff, 0.6);
  sol.position.set(3, 4, 5);
  escena.add(sol);

  const paleta = [0xffe156, 0xff90e8, 0xb9ff66, 0x9be7ff, 0xd9b8ff, 0xffc97d, 0xff8a8a];
  const geometrias = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.OctahedronGeometry(1.15, 0),
    new THREE.TorusGeometry(0.9, 0.32, 8, 16),
  ];

  const grupo = new THREE.Group();
  const figuras = [];
  const totalFiguras = 10;

  for (let i = 0; i < totalFiguras; i++) {
    const geometria = geometrias[i % geometrias.length];
    const color = paleta[i % paleta.length];
    const material = new THREE.MeshStandardMaterial({ color, flatShading: true });
    const malla = new THREE.Mesh(geometria, material);

    const contorno = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometria),
      new THREE.LineBasicMaterial({ color: 0x141414 })
    );
    malla.add(contorno);

    const escala = 0.6 + Math.random() * 0.8;
    malla.scale.setScalar(escala);
    malla.position.set(
      (Math.random() - 0.5) * 13,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 6 - 1
    );
    malla.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

    malla.userData.giro = {
      x: (Math.random() - 0.5) * 0.012,
      y: (Math.random() - 0.5) * 0.012,
    };

    grupo.add(malla);
    figuras.push(malla);
  }

  escena.add(grupo);

  let objetivoX = 0;
  let objetivoY = 0;

  window.addEventListener("pointermove", (evento) => {
    objetivoX = (evento.clientX / window.innerWidth - 0.5) * 0.5;
    objetivoY = (evento.clientY / window.innerHeight - 0.5) * 0.3;
  });

  let idAnimacion = null;

  const animar = () => {
    figuras.forEach((malla) => {
      malla.rotation.x += malla.userData.giro.x;
      malla.rotation.y += malla.userData.giro.y;
    });
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
