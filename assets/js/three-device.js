/**
 * CableHunt Networks - Interactive 3D Handheld Device Model
 * Features: 3D chassis, live animated OTDR screen canvas, ports, camera scanning beam, and hotspot camera angles.
 */

(function () {
  const container = document.getElementById('device-3d-viewport');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 16);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(10, 15, 12);
  scene.add(keyLight);

  const rimOrange = new THREE.PointLight(0xF7941D, 2.8, 40);
  rimOrange.position.set(-10, 8, -6);
  scene.add(rimOrange);

  const rimBlue = new THREE.PointLight(0x23396C, 3.5, 40);
  rimBlue.position.set(10, -8, 5);
  scene.add(rimBlue);

  // Main Device Group
  const deviceGroup = new THREE.Group();
  scene.add(deviceGroup);

  // 1. Offscreen Dynamic Canvas for Live Screen Texture
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const sCtx = screenCanvas.getContext('2d');
  const screenTexture = new THREE.CanvasTexture(screenCanvas);

  function drawScreenContent(time) {
    sCtx.fillStyle = '#06080D';
    sCtx.fillRect(0, 0, 512, 320);

    // Grid lines
    sCtx.strokeStyle = 'rgba(35, 57, 108, 0.35)';
    sCtx.lineWidth = 1;
    for (let x = 0; x < 512; x += 40) {
      sCtx.beginPath();
      sCtx.moveTo(x, 0);
      sCtx.lineTo(x, 320);
      sCtx.stroke();
    }
    for (let y = 0; y < 320; y += 32) {
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(512, y);
      sCtx.stroke();
    }

    // Top Header info
    sCtx.fillStyle = '#F7941D';
    sCtx.font = 'bold 14px "JetBrains Mono", monospace';
    sCtx.fillText('CABLEHUNT 12-BIT EDGE RIG', 20, 26);

    sCtx.fillStyle = '#10B981';
    sCtx.fillText('• LIVE LINK ACTIVE: 1550nm', 320, 26);

    // Simulated OTDR Rayleigh Backscatter Trace
    sCtx.strokeStyle = '#06B6D4';
    sCtx.lineWidth = 2.5;
    sCtx.beginPath();
    sCtx.moveTo(20, 100);

    for (let x = 20; x < 490; x += 3) {
      const dist = (x - 20) / 470;
      let loss = 100 + dist * 110;
      
      // Fresnel Peak at connector 1
      if (x > 140 && x < 155) {
        loss -= Math.sin((x - 140) / 15 * Math.PI) * 45;
      }
      // Macrobend drop at point 2
      if (x > 320) {
        loss += 28;
      }
      // Micro-noise (12-bit clean)
      const noise = (Math.sin(x * 0.4 + time * 6) + Math.cos(x * 0.9)) * 1.5;
      sCtx.lineTo(x, loss + noise);
    }
    sCtx.stroke();

    // Secondary pulse trace (Orange 12-Bit peak)
    sCtx.strokeStyle = '#F7941D';
    sCtx.lineWidth = 1.8;
    sCtx.beginPath();
    sCtx.moveTo(20, 220);
    for (let x = 20; x < 490; x += 4) {
      const y = 220 + Math.sin(x * 0.08 - time * 8) * 15 * Math.exp(-x * 0.003);
      sCtx.lineTo(x, y);
    }
    sCtx.stroke();

    // Bottom telemetry markers
    sCtx.fillStyle = '#94A3B8';
    sCtx.font = '11px "JetBrains Mono", monospace';
    sCtx.fillText('ATTEN: 0.19 dB/km | EDZ: 0.74m | SAMPLING: 1.25 GSa/s', 20, 300);

    screenTexture.needsUpdate = true;
  }

  // 2. Chassis Dimensions
  const bodyW = 9.2;
  const bodyH = 5.8;
  const bodyD = 1.6;

  // Dark Inner Body
  const innerBodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyD);
  const innerBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1A1C22,
    roughness: 0.4,
    metalness: 0.6
  });
  const innerBody = new THREE.Mesh(innerBodyGeo, innerBodyMat);
  deviceGroup.add(innerBody);

  // Navy Blue Rugged Corner Bumpers (CableHunt Signature Bumper)
  const bumperMat = new THREE.MeshStandardMaterial({
    color: 0x23396C,
    roughness: 0.3,
    metalness: 0.2
  });

  // Left & Right Armor Sidebars
  const leftBumperGeo = new THREE.BoxGeometry(0.8, bodyH + 0.6, bodyD + 0.4);
  const leftBumper = new THREE.Mesh(leftBumperGeo, bumperMat);
  leftBumper.position.x = -bodyW / 2;
  deviceGroup.add(leftBumper);

  const rightBumperGeo = new THREE.BoxGeometry(0.8, bodyH + 0.6, bodyD + 0.4);
  const rightBumper = new THREE.Mesh(rightBumperGeo, bumperMat);
  rightBumper.position.x = bodyW / 2;
  deviceGroup.add(rightBumper);

  // Screen Mesh
  const screenGeo = new THREE.PlaneGeometry(6.6, 4.0);
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
  const screenMesh = new THREE.Mesh(screenGeo, screenMat);
  screenMesh.position.set(0, -0.1, bodyD / 2 + 0.02);
  deviceGroup.add(screenMesh);

  // Screen Bezel Border
  const bezelGeo = new THREE.PlaneGeometry(6.9, 4.3);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0E1014, roughness: 0.6 });
  const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
  bezelMesh.position.set(0, -0.1, bodyD / 2 + 0.01);
  deviceGroup.add(bezelMesh);

  // Power & WiFi Buttons
  const pwrBtnGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
  const pwrBtnMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.3 });
  const pwrBtn = new THREE.Mesh(pwrBtnGeo, pwrBtnMat);
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(-0.8, -bodyH / 2 + 0.5, bodyD / 2 + 0.02);
  deviceGroup.add(pwrBtn);

  const wifiBtnGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
  const wifiBtnMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, roughness: 0.3 });
  const wifiBtn = new THREE.Mesh(wifiBtnGeo, wifiBtnMat);
  wifiBtn.rotation.x = Math.PI / 2;
  wifiBtn.position.set(0.8, -bodyH / 2 + 0.5, bodyD / 2 + 0.02);
  deviceGroup.add(wifiBtn);

  // 3. Top Port Array (OTDR, Camera, Scanner, USB)
  const portGroup = new THREE.Group();
  portGroup.position.set(0, bodyH / 2 + 0.1, 0);
  deviceGroup.add(portGroup);

  const portMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0x23396C, roughness: 0.4 });

  // 4 Top Ports with Open Flip Caps
  const portPositions = [-2.8, -1.4, 0.0, 1.4];
  portPositions.forEach((x, idx) => {
    // Port Cylinder
    const portGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.6, 16);
    const port = new THREE.Mesh(portGeo, portMat);
    port.position.x = x;
    portGroup.add(port);

    // Open Flip Cap Cover
    const capGeo = new THREE.BoxGeometry(0.9, 0.7, 0.12);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(x, 0.55, -0.4);
    cap.rotation.x = -Math.PI / 3;
    portGroup.add(cap);

    // Special Center Camera Lens
    if (idx === 2) {
      const lensGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.65, 20);
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0x06B6D4,
        emissive: 0x044B57,
        roughness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      const lens = new THREE.Mesh(lensGeo, lensMat);
      lens.position.x = x;
      portGroup.add(lens);
    }
  });

  // Barcode / QR Scanner Module (Right Top)
  const scannerGeo = new THREE.BoxGeometry(1.0, 0.4, 0.8);
  const scannerMat = new THREE.MeshStandardMaterial({ color: 0x1E222A });
  const scanner = new THREE.Mesh(scannerGeo, scannerMat);
  scanner.position.set(2.8, 0.1, 0);
  portGroup.add(scanner);

  const scanGlassGeo = new THREE.PlaneGeometry(0.6, 0.3);
  const scanGlassMat = new THREE.MeshBasicMaterial({ color: 0xF7941D, side: THREE.DoubleSide });
  const scanGlass = new THREE.Mesh(scanGlassGeo, scanGlassMat);
  scanGlass.rotation.x = -Math.PI / 2;
  scanGlass.position.set(2.8, 0.31, 0);
  portGroup.add(scanGlass);

  // 4. Computer Vision Scanning Laser Cone (Toggled via Scan Mode)
  const coneGeo = new THREE.ConeGeometry(3.5, 6, 32, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0xF7941D,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    wireframe: true
  });
  const scanCone = new THREE.Mesh(coneGeo, coneMat);
  scanCone.position.set(0, bodyH / 2 + 3.5, 0);
  scanCone.rotation.x = Math.PI;
  deviceGroup.add(scanCone);

  // Drag to Rotate Interaction
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotationX = 0.15;
  let targetRotationY = -0.3;

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  // Touch Support
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  window.addEventListener('touchend', () => { isDragging = false; });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  // Hotspot Buttons Control
  window.setDeviceView = function (mode) {
    const btns = document.querySelectorAll('.device-hotspot-btn');
    btns.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.device-hotspot-btn[data-mode="${mode}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    if (mode === 'ports') {
      targetRotationX = 0.95; // Top down
      targetRotationY = 0.0;
      coneMat.opacity = 0.0;
    } else if (mode === 'scan') {
      targetRotationX = 0.45;
      targetRotationY = 0.0;
      coneMat.opacity = 0.4;
    } else if (mode === 'scope') {
      targetRotationX = 0.0; // Straight on
      targetRotationY = 0.0;
      coneMat.opacity = 0.0;
    } else {
      // Default
      targetRotationX = 0.15;
      targetRotationY = -0.3;
      coneMat.opacity = 0.0;
    }
  };

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();
    drawScreenContent(time);

    // Smooth rotational damping
    deviceGroup.rotation.x += (targetRotationX - deviceGroup.rotation.x) * 0.08;
    deviceGroup.rotation.y += (targetRotationY - deviceGroup.rotation.y) * 0.08;

    // Scan cone pulse animation if active
    if (coneMat.opacity > 0.05) {
      scanCone.rotation.y += 0.02;
      coneMat.opacity = 0.25 + Math.sin(time * 8) * 0.15;
    }

    renderer.render(scene, camera);
  }

  animate();

  // Resize Handler
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
