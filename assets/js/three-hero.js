/**
 * CableHunt Networks - 3D Fiber Optic & Photon Network Canvas
 * Renders real-time 3D optical fiber splines with travelling photon pulses.
 */

(function () {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 85);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLightOrange = new THREE.PointLight(0xF7941D, 2.5, 300);
  pointLightOrange.position.set(30, 20, 40);
  scene.add(pointLightOrange);

  const pointLightNavy = new THREE.PointLight(0x23396C, 3, 300);
  pointLightNavy.position.set(-40, -30, 30);
  scene.add(pointLightNavy);

  // Fiber Curves Group
  const fiberGroup = new THREE.Group();
  scene.add(fiberGroup);

  const fibers = [];
  const fiberCount = 18;
  const colors = [0xF7941D, 0x06B6D4, 0xFFB049, 0x3B82F6];

  for (let i = 0; i < fiberCount; i++) {
    const points = [];
    const numPoints = 6;
    const startX = -120 + Math.random() * 40;
    const startY = (Math.random() - 0.5) * 80;
    const startZ = (Math.random() - 0.5) * 60;

    for (let j = 0; j < numPoints; j++) {
      const x = startX + (j / (numPoints - 1)) * 240;
      const y = startY + Math.sin(j * 0.8 + i) * 25 + (Math.random() - 0.5) * 10;
      const z = startZ + Math.cos(j * 0.6 + i) * 20;
      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.25, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x1E222B,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    fiberGroup.add(tubeMesh);

    // Add travelling photon pulse particles along curve
    const pulseCount = 3;
    const pulses = [];
    for (let p = 0; p < pulseCount; p++) {
      const pulseGeo = new THREE.SphereGeometry(0.85, 12, 12);
      const pulseColor = colors[Math.floor(Math.random() * colors.length)];
      const pulseMat = new THREE.MeshBasicMaterial({
        color: pulseColor,
        transparent: true,
        opacity: 0.95
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      fiberGroup.add(pulseMesh);
      pulses.push({
        mesh: pulseMesh,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.004
      });
    }

    fibers.push({ curve, pulses });
  }

  // Floating Data Nodes / Grid Background
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 200;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 220;
    posArray[i + 1] = (Math.random() - 0.5) * 140;
    posArray[i + 2] = (Math.random() - 0.5) * 100;
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particlesMat = new THREE.PointsMaterial({
    size: 1.2,
    color: 0xF7941D,
    transparent: true,
    opacity: 0.35
  });

  const particleMesh = new THREE.Points(particlesGeo, particlesMat);
  scene.add(particleMesh);

  // Mouse Parallax Interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    // Smooth camera motion
    targetX += (mouseX * 12 - targetX) * 0.04;
    targetY += (-mouseY * 8 - targetY) * 0.04;
    camera.position.x = targetX;
    camera.position.y = targetY;
    camera.lookAt(0, 0, 0);

    // Animate Pulses along curves
    fibers.forEach(f => {
      f.pulses.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const pos = f.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
      });
    });

    // Slow rotation
    fiberGroup.rotation.y += 0.0008;
    particleMesh.rotation.y -= 0.0005;

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
