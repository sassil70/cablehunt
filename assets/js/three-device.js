/**
 * CableHunt — Ultra-Realistic 3D CAD Handheld Diagnostic Unit (Three.js r128)
 * Features:
 *  - Ruggedised CNC Anodised Chassis + Elastomer Corner Bumpers + Thermal Heatsink Fins
 *  - Live Dynamic HTML5 CanvasTexture OLED Screen (Animated 12-Bit OTDR Trace & Telemetry)
 *  - Separable Internal PCB Layer (12-Bit ADC IC, Shielded InGaAs PIN-TIA Can, Galvanic Isolation)
 *  - Top Optical Bulkhead (Green SC/APC, Computer Vision Lens, RFoF / TDR Coax, 40G SFP+ Cage)
 *  - Built-in 360° Pointer/Touch Drag & Wheel Zoom + Exploded X-Ray CAD View Mode
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('device-3d-viewport') || document.getElementById('device-3d-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
    camera.position.set(0, 0.5, 11.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (THREE.ACESFilmicToneMapping) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.25;
    }
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio & Rim Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.72));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(8, 12, 10);
    scene.add(keyLight);

    const orangeRim = new THREE.PointLight(0xf7941d, 2.1, 24);
    orangeRim.position.set(-7, 4, 6);
    scene.add(orangeRim);

    const cyanRim = new THREE.PointLight(0x06b6d4, 2.0, 24);
    cyanRim.position.set(7, -3, 6);
    scene.add(cyanRim);

    const backLight = new THREE.DirectionalLight(0x38bdf8, 0.75);
    backLight.position.set(0, 6, -10);
    scene.add(backLight);

    // Master Device Hierarchy (separable layers for Exploded X-Ray CAD mode)
    const deviceGroup = new THREE.Group();
    const chassisLayer = new THREE.Group();
    const pcbInternalLayer = new THREE.Group();
    const frontFaceLayer = new THREE.Group();
    const topBulkheadLayer = new THREE.Group();
    const bottomIsoLayer = new THREE.Group();

    deviceGroup.add(chassisLayer);
    deviceGroup.add(pcbInternalLayer);
    deviceGroup.add(frontFaceLayer);
    deviceGroup.add(topBulkheadLayer);
    deviceGroup.add(bottomIsoLayer);
    scene.add(deviceGroup);

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x101726,
        metalness: 0.82,
        roughness: 0.25
    });

    const bumperMat = new THREE.MeshStandardMaterial({
        color: 0x070a10,
        metalness: 0.18,
        roughness: 0.85
    });

    const orangeAccentMat = new THREE.MeshStandardMaterial({
        color: 0xf7941d,
        metalness: 0.55,
        roughness: 0.25
    });

    const finMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.3
    });

    const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.95,
        roughness: 0.15
    });

    // =========================================================
    // 1. CHASSIS LAYER: Rugged Body, Bumpers & Heatsink Fins
    // =========================================================
    const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(3.5, 6.1, 0.78), bodyMat);
    chassisLayer.add(mainChassis);

    const edgeFrame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(3.52, 6.12, 0.80)),
        new THREE.LineBasicMaterial({ color: 0xf7941d, transparent: true, opacity: 0.35 })
    );
    chassisLayer.add(edgeFrame);

    // 4 Rugged Corner Shock Bumpers + Orange Grip Stripes
    const corners = [
        [-1.72, 2.9, 0],
        [1.72, 2.9, 0],
        [-1.72, -2.9, 0],
        [1.72, -2.9, 0]
    ];
    corners.forEach(([cx, cy, cz]) => {
        const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.94), bumperMat);
        bumper.position.set(cx, cy, cz);
        chassisLayer.add(bumper);

        const gripRib = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.96), orangeAccentMat);
        gripRib.position.set(cx, cy + (cy > 0 ? -0.22 : 0.22), cz);
        chassisLayer.add(gripRib);
    });

    // Precision Side Thermal Heatsink Fins
    for (let i = -4; i <= 4; i++) {
        const yPos = i * 0.44;
        const leftFin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.64), finMat);
        leftFin.position.set(-1.82, yPos, 0);
        chassisLayer.add(leftFin);

        const rightFin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.22, 0.64), finMat);
        rightFin.position.set(1.82, yPos, 0);
        chassisLayer.add(rightFin);
    }

    // Rear Optical Laser & MICE Compliance Plate
    const rearPlate = new THREE.Mesh(
        new THREE.PlaneGeometry(2.6, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide })
    );
    rearPlate.position.set(0, 0, -0.40);
    chassisLayer.add(rearPlate);

    // =========================================================
    // 2. INTERNAL PCB LAYER (Revealed in Exploded X-Ray Mode)
    // =========================================================
    const pcbBoard = new THREE.Mesh(
        new THREE.BoxGeometry(3.08, 5.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.45, roughness: 0.45 })
    );
    pcbBoard.position.set(0, 0, 0.16);
    pcbInternalLayer.add(pcbBoard);

    // 12-Bit Native ADC + FPGA DSP Core IC
    const adcPackage = new THREE.Mesh(
        new THREE.BoxGeometry(1.18, 1.18, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
    );
    adcPackage.position.set(0, 0.45, 0.24);
    pcbInternalLayer.add(adcPackage);

    const adcGoldHeatspreader = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.28, 0.06), goldMat);
    adcGoldHeatspreader.position.set(0, 0.45, 0.21);
    pcbInternalLayer.add(adcGoldHeatspreader);

    // Shielded InGaAs APD/PIN-TIA Optical Can
    const ingaAsCan = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.88, 24), goldMat);
    ingaAsCan.position.set(-0.78, 2.05, 0.25);
    pcbInternalLayer.add(ingaAsCan);

    // 2500Vrms Floating-Ground DC-DC Isolation Barrier
    const isoTransformer = new THREE.Mesh(
        new THREE.BoxGeometry(1.65, 0.65, 0.18),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7, roughness: 0.25 })
    );
    isoTransformer.position.set(0, -2.05, 0.24);
    pcbInternalLayer.add(isoTransformer);

    // =========================================================
    // 3. FRONT FACE LAYER: Live Animated OLED Canvas & Keypad
    // =========================================================
    const oledCanvas = document.createElement('canvas');
    oledCanvas.width = 512;
    oledCanvas.height = 640;
    const oledCtx = oledCanvas.getContext('2d');
    const oledTexture = new THREE.CanvasTexture(oledCanvas);

    let activeViewMode = 'default';
    let oledTick = 0;

    function renderOledScreen() {
        oledTick += 0.07;
        const w = oledCanvas.width;
        const h = oledCanvas.height;

        oledCtx.fillStyle = '#050811';
        oledCtx.fillRect(0, 0, w, h);

        // Top Header Bar
        oledCtx.fillStyle = '#0f172a';
        oledCtx.fillRect(0, 0, w, 54);
        oledCtx.strokeStyle = 'rgba(247, 148, 29, 0.5)';
        oledCtx.lineWidth = 2;
        oledCtx.beginPath();
        oledCtx.moveTo(0, 54);
        oledCtx.lineTo(w, 54);
        oledCtx.stroke();

        oledCtx.fillStyle = '#f7941d';
        oledCtx.font = 'bold 18px monospace';
        oledCtx.fillText('CABLEHUNT CH-12B PRO', 16, 34);

        oledCtx.fillStyle = '#10b981';
        oledCtx.font = 'bold 15px monospace';
        oledCtx.fillText('12-BIT | 40G READY', 318, 34);

        // Scope Grid
        oledCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        oledCtx.lineWidth = 1;
        for (let gx = 20; gx < w - 20; gx += 44) {
            oledCtx.beginPath(); oledCtx.moveTo(gx, 68); oledCtx.lineTo(gx, 336); oledCtx.stroke();
        }
        for (let gy = 68; gy <= 336; gy += 44) {
            oledCtx.beginPath(); oledCtx.moveTo(20, gy); oledCtx.lineTo(w - 20, gy); oledCtx.stroke();
        }

        // Animated 12-Bit Rayleigh Backscatter Trace
        oledCtx.save();
        oledCtx.strokeStyle = '#06b6d4';
        oledCtx.shadowColor = '#06b6d4';
        oledCtx.shadowBlur = 10;
        oledCtx.lineWidth = 3.2;
        oledCtx.beginPath();

        for (let i = 0; i <= 120; i++) {
            const t = i / 120;
            const px = 24 + t * (w - 48);
            let py = 115 + t * 145;

            if (t < 0.06) py -= Math.exp(-Math.pow((t - 0.02) / 0.014, 2)) * 46;
            const dFault = Math.abs(t - 0.52);
            if (dFault < 0.05) {
                py -= Math.exp(-Math.pow(dFault / 0.015, 2)) * (52 + Math.sin(oledTick * 2.2) * 4);
            }
            if (t > 0.52) py += 14;
            const dEnd = Math.abs(t - 0.9);
            if (dEnd < 0.04) py -= Math.exp(-Math.pow(dEnd / 0.012, 2)) * 68;
            if (t > 0.92) py = 312 + Math.sin(i + oledTick) * 2;

            py += Math.sin(i * 0.65 + oledTick) * 1.1;
            if (i === 0) oledCtx.moveTo(px, py);
            else oledCtx.lineTo(px, py);
        }
        oledCtx.stroke();
        oledCtx.restore();

        // Fault Target Indicator
        const fx = 24 + 0.52 * (w - 48);
        const fy = 115 + 0.52 * 145 - 48;
        oledCtx.strokeStyle = '#f7941d';
        oledCtx.lineWidth = 2.5;
        oledCtx.beginPath();
        oledCtx.arc(fx, fy, 11 + Math.sin(oledTick * 3) * 2, 0, Math.PI * 2);
        oledCtx.stroke();

        oledCtx.fillStyle = '#f7941d';
        oledCtx.font = 'bold 13px monospace';
        oledCtx.fillText('SPLICE DECAY -0.08dB @ 42.1km', fx - 95, fy - 16);

        // 4 Telemetry Readout Tiles
        const tiles = [
            { label: 'NATIVE ADC', val: '4,096 LVL', col: '#f7941d', x: 20, y: 360 },
            { label: 'DYNAMIC SNR', val: '72.2 dB', col: '#06b6d4', x: 262, y: 360 },
            { label: 'DEAD ZONE', val: '< 0.8 m', col: '#10b981', x: 20, y: 450 },
            { label: 'PROTECTION', val: '38.4 ms', col: '#38bdf8', x: 262, y: 450 }
        ];
        tiles.forEach(t => {
            oledCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            oledCtx.fillRect(t.x, t.y, 230, 74);
            oledCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            oledCtx.strokeRect(t.x, t.y, 230, 74);

            oledCtx.fillStyle = '#9ca3af';
            oledCtx.font = '13px monospace';
            oledCtx.fillText(t.label, t.x + 14, t.y + 24);

            oledCtx.fillStyle = t.col;
            oledCtx.font = 'bold 24px monospace';
            oledCtx.fillText(t.val, t.x + 14, t.y + 58);
        });

        // Bottom Active Inspection Banner
        oledCtx.fillStyle = 'rgba(247, 148, 29, 0.14)';
        oledCtx.fillRect(20, 546, w - 40, 68);
        oledCtx.strokeStyle = '#f7941d';
        oledCtx.strokeRect(20, 546, w - 40, 68);

        const banners = {
            default: 'ACTIVE: 80KM G.652.D FULL SPAN DIAGNOSTIC',
            ports: 'BULKHEAD: SC/APC + FC/UPC + RFOF + SFP28',
            scan: 'VISION AI: 400x FERRULE & JACKET DEFECT SCAN',
            scope: '12-BIT DSP: BOXCAR AVERAGING (N=1024 LOCKED)',
            exploded: 'CAD X-RAY: INTERNAL 12-BIT PCB & SHIELDING'
        };
        oledCtx.fillStyle = '#ffffff';
        oledCtx.font = 'bold 15px monospace';
        oledCtx.fillText(banners[activeViewMode] || banners.default, 32, 586);

        oledTexture.needsUpdate = true;
    }

    const bezelMesh = new THREE.Mesh(
        new THREE.BoxGeometry(3.14, 4.05, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x030712, metalness: 0.5, roughness: 0.2 })
    );
    bezelMesh.position.set(0, 0.52, 0.40);
    frontFaceLayer.add(bezelMesh);

    const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.92, 3.80),
        new THREE.MeshBasicMaterial({ map: oledTexture })
    );
    screenMesh.position.set(0, 0.52, 0.45);
    frontFaceLayer.add(screenMesh);

    // Physical Keypad & Laser Arm Ring
    const navRing = new THREE.Mesh(
        new THREE.RingGeometry(0.28, 0.36, 32),
        new THREE.MeshBasicMaterial({ color: 0xf7941d, side: THREE.DoubleSide })
    );
    navRing.position.set(0, -2.12, 0.42);
    frontFaceLayer.add(navRing);

    const centerKey = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.08, 32),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    centerKey.rotation.x = Math.PI / 2;
    centerKey.position.set(0, -2.12, 0.41);
    frontFaceLayer.add(centerKey);

    [-0.95, 0.95].forEach((bx, idx) => {
        const softKey = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.28, 0.08),
            new THREE.MeshStandardMaterial({
                color: idx === 0 ? 0x10b981 : 0x06b6d4,
                metalness: 0.6,
                roughness: 0.3
            })
        );
        softKey.position.set(bx, -2.12, 0.41);
        frontFaceLayer.add(softKey);
    });

    // =========================================================
    // 4. TOP OPTICAL BULKHEAD: SC/APC, Vision Probe & RFoF Ports
    // =========================================================
    // Green SC/APC 8-Degree Optical Port
    const scapcHousing = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.52, 0.50),
        new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.35, roughness: 0.35 })
    );
    scapcHousing.position.set(-0.92, 3.28, 0);
    topBulkheadLayer.add(scapcHousing);

    const zirconiaTip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.65, 24),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.2, roughness: 0.1 })
    );
    zirconiaTip.position.set(-0.92, 3.42, 0);
    topBulkheadLayer.add(zirconiaTip);

    // Computer Vision & Coaxial Ferrule Microscope Lens
    const visionBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.42, 0.54, 32),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    visionBarrel.position.set(0, 3.28, 0);
    topBulkheadLayer.add(visionBarrel);

    const visionLens = new THREE.Mesh(
        new THREE.CircleGeometry(0.26, 32),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide })
    );
    visionLens.rotation.x = -Math.PI / 2;
    visionLens.position.set(0, 3.56, 0);
    topBulkheadLayer.add(visionLens);

    // RFoF / 40G SFP28 Gold Transceiver Cage
    const rfofCage = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.48), goldMat);
    rfofCage.position.set(0.95, 3.25, 0);
    topBulkheadLayer.add(rfofCage);

    // =========================================================
    // 5. BOTTOM ISOLATED TELEMETRY PORT (2500Vrms Floating Ground)
    // =========================================================
    const usbGuard = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.26, 0.38), goldMat);
    usbGuard.position.set(0, -3.14, 0);
    bottomIsoLayer.add(usbGuard);

    // =========================================================
    // 6. INTERACTIVE POINTER DRAG, ZOOM & HOTSPOT CAMERA STATES
    // =========================================================
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let autoRotate = true;
    let isExploded = false;
    let isTransitioning = false;

    const viewPresets = {
        default: {
            cam: { x: 0, y: 0.4, z: 11.6 },
            rot: { x: 0.08, y: -0.32 },
            explode: false,
            spec: 'SPECIFICATION: <strong class="text-orange">12-BIT NATIVE (4,096 LEVELS)</strong> | DEAD ZONE: <strong class="text-orange">&lt;0.8M</strong> | ISOLATION: <strong class="text-orange">2,500Vrms FLOATING</strong>'
        },
        ports: {
            cam: { x: -0.3, y: 2.8, z: 7.2 },
            rot: { x: 0.52, y: 0.18 },
            explode: false,
            spec: 'TOP BULKHEAD: <strong class="text-orange">SC/APC 8° &amp; FC/UPC</strong> | DETECTOR: <strong class="text-orange">InGaAs PIN-TIA (1260–1675nm)</strong> | <strong class="text-orange">40G SFP28 CAGE</strong>'
        },
        scan: {
            cam: { x: 0.6, y: 2.6, z: 6.8 },
            rot: { x: 0.58, y: -0.25 },
            explode: false,
            spec: 'VISION MODULE: <strong class="text-orange">IEC 61300-3-35 400x COAXIAL</strong> | AI DEFECT GRADING: <strong class="text-orange">98.5% PRECISION</strong> | <strong class="text-orange">QR/ODF MAPPER</strong>'
        },
        scope: {
            cam: { x: 0, y: 0.5, z: 7.3 },
            rot: { x: 0, y: 0 },
            explode: false,
            spec: 'OLED DISPLAY: <strong class="text-orange">72.2 dB DYNAMIC SNR</strong> | AVERAGING: <strong class="text-orange">HARDWARE BOXCAR N=1024</strong> | <strong class="text-orange">1D-CNN OVERLAY</strong>'
        },
        exploded: {
            cam: { x: 1.8, y: 0.8, z: 11.2 },
            rot: { x: 0.16, y: -0.58 },
            explode: true,
            spec: 'CAD X-RAY VIEW: <strong class="text-orange">4-LAYER SEPARATED ASSEMBLY</strong> | <strong class="text-orange">GOLD 12-BIT ADC CORE</strong> | <strong class="text-orange">GALVANIC DC-DC BARRIER</strong>'
        }
    };

    let targetCam = { ...viewPresets.default.cam };
    let targetRot = { ...viewPresets.default.rot };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        autoRotate = false;
        isTransitioning = false;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        deviceGroup.rotation.y += dx * 0.0085;
        deviceGroup.rotation.x = Math.max(-0.85, Math.min(0.85, deviceGroup.rotation.x + dy * 0.0085));
        prevX = e.clientX;
        prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            isDragging = true;
            autoRotate = false;
            isTransitioning = false;
            prevX = e.touches[0].clientX;
            prevY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - prevX;
        const dy = e.touches[0].clientY - prevY;
        deviceGroup.rotation.y += dx * 0.0085;
        deviceGroup.rotation.x = Math.max(-0.85, Math.min(0.85, deviceGroup.rotation.x + dy * 0.0085));
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z = Math.max(6.2, Math.min(16.5, camera.position.z + e.deltaY * 0.005));
    }, { passive: false });

    // Expose view switcher (scoped ONLY to #hardware .device-hotspot-btn so it never strips Spectrum or CLI buttons!)
    window.setDeviceView = (mode, btnEl) => {
        const preset = viewPresets[mode] || viewPresets.default;
        activeViewMode = mode;
        isExploded = Boolean(preset.explode);
        autoRotate = (mode === 'default');
        targetCam = { ...preset.cam };
        targetRot = { ...preset.rot };
        isTransitioning = true;

        const hwButtons = document.querySelectorAll('#hardware .device-hotspot-btn');
        hwButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn === btnEl || btn.getAttribute('data-mode') === mode) {
                btn.classList.add('active');
            }
        });

        const specReadout = document.getElementById('device-spec-readout');
        if (specReadout && preset.spec) {
            specReadout.innerHTML = preset.spec;
        }

        renderOledScreen();
    };

    window.focusDevicePart = window.setDeviceView;

    let frame = 0;
    function animate() {
        requestAnimationFrame(animate);
        frame++;

        if (frame % 3 === 0) {
            renderOledScreen();
        }

        // Smooth Exploded CAD Layer Separation
        const targetFrontZ = isExploded ? 1.45 : 0;
        const targetPcbZ = isExploded ? 0.48 : 0;
        const targetChassisZ = isExploded ? -0.68 : 0;
        const targetTopY = isExploded ? 0.85 : 0;
        const targetBottomY = isExploded ? -0.75 : 0;

        frontFaceLayer.position.z += (targetFrontZ - frontFaceLayer.position.z) * 0.08;
        pcbInternalLayer.position.z += (targetPcbZ - pcbInternalLayer.position.z) * 0.08;
        chassisLayer.position.z += (targetChassisZ - chassisLayer.position.z) * 0.08;
        topBulkheadLayer.position.y += (targetTopY - topBulkheadLayer.position.y) * 0.08;
        bottomIsoLayer.position.y += (targetBottomY - bottomIsoLayer.position.y) * 0.08;

        if (isTransitioning) {
            camera.position.x += (targetCam.x - camera.position.x) * 0.08;
            camera.position.y += (targetCam.y - camera.position.y) * 0.08;
            camera.position.z += (targetCam.z - camera.position.z) * 0.08;

            deviceGroup.rotation.x += (targetRot.x - deviceGroup.rotation.x) * 0.08;
            deviceGroup.rotation.y += (targetRot.y - deviceGroup.rotation.y) * 0.08;

            if (
                Math.abs(camera.position.z - targetCam.z) < 0.04 &&
                Math.abs(deviceGroup.rotation.y - targetRot.y) < 0.04
            ) {
                isTransitioning = false;
            }
        } else if (autoRotate && !isDragging) {
            deviceGroup.rotation.y += 0.0055;
        }

        renderer.render(scene, camera);
    }

    renderOledScreen();
    animate();

    window.addEventListener('resize', () => {
        if (!container) return;
        const w = container.clientWidth || 800;
        const h = container.clientHeight || 480;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
});
