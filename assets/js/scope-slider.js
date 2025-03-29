/**
 * CableHunt — 8-Bit vs 12-Bit Native ADC Interactive Oscilloscope & Closed-Loop Fault Injector
 * Matches #scope-comparison-box and #scope-comparison-canvas in index.html.
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scope-comparison-box') || document.getElementById('scope-comparison-container');
    const canvas = document.getElementById('scope-comparison-canvas') || document.getElementById('scope-canvas');
    const sliderHandle = document.getElementById('scope-slider-handle');

    if (!container || !canvas || !sliderHandle) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let sliderPos = 0.5;
    let isDragging = false;
    let currentFaultMode = 'macrobend'; // 'macrobend' | 'splice' | 'ferrule' | 'clean'
    let phaseTick = 0;
    let hoverPos = null;

    function pseudoNoise(index, tick) {
        const x = Math.sin(index * 12.9898 + tick * 0.7) * 43758.5453;
        return (x - Math.floor(x)) - 0.5;
    }

    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        width = rect.width || 800;
        height = rect.height || 420;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawWaveforms();
    }

    function computeBaseSignal(t) {
        let y = height * 0.34 + (t * height * 0.35);

        // Launch Fresnel reflection at 0.0km ODF
        const launchDist = Math.abs(t - 0.05);
        if (launchDist < 0.03) {
            const launchAmp = currentFaultMode === 'ferrule' ? 112 : 64;
            y -= Math.exp(-Math.pow(launchDist / 0.009, 2)) * launchAmp;
        }

        if (currentFaultMode === 'macrobend') {
            // -0.78 dB Macrobend / Splice anomaly at t=0.55 (42.1 km)
            const distFromFault = Math.abs(t - 0.55);
            if (distFromFault < 0.036) {
                y -= Math.exp(-Math.pow(distFromFault / 0.009, 2)) * 52;
            }
            if (t > 0.55) {
                y += 22;
            }
        } else if (currentFaultMode === 'splice') {
            // Subtle -0.08 dB Fusion Splice decay at t=0.42 (31.4 km)
            const distFromSplice = Math.abs(t - 0.42);
            if (distFromSplice < 0.03) {
                y -= Math.exp(-Math.pow(distFromSplice / 0.008, 2)) * 38;
            }
            if (t > 0.42) {
                y += 12;
            }
        } else if (currentFaultMode === 'ferrule') {
            // Contaminated ODF connector ringing near launch (<0.8m dead zone resolved!)
            if (t > 0.05 && t < 0.16) {
                y -= Math.sin((t - 0.05) * 170) * Math.exp(-(t - 0.05) * 32) * 34;
            }
            y += 18;
        }

        // End of 80km spool Fresnel reflection peak
        const endDist = Math.abs(t - 0.91);
        if (endDist < 0.028) {
            y -= Math.exp(-Math.pow(endDist / 0.007, 2)) * 76;
        }
        if (t > 0.925) {
            y = height * 0.84;
        }

        return y;
    }

    function drawWaveforms() {
        if (!width || !height) return;
        ctx.clearRect(0, 0, width, height);

        // Background Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
        ctx.lineWidth = 1;
        const gridSize = 40;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Distance markers along bottom (0 km to 80 km)
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(156, 163, 175, 0.6)';
        [0, 20, 40, 60, 80].forEach(km => {
            const xPos = (0.05 + (km / 80) * 0.86) * width;
            ctx.fillText(`${km} km`, xPos - 16, height - 12);
        });

        const points = 420;
        const baseSignal = [];
        for (let i = 0; i <= points; i++) {
            const t = i / points;
            baseSignal.push({ x: t * width, y: computeBaseSignal(t), t });
        }

        const splitX = sliderPos * width;

        // 1. LEFT SIDE: Legacy 8-Bit (256 Levels)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, height);
        ctx.clip();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.2;
        ctx.beginPath();

        const stepSize = 18;
        for (let i = 0; i <= points; i++) {
            const pt = baseSignal[i];
            const rawNoise = pseudoNoise(i, phaseTick) * 30;
            const quantizedY = Math.round((pt.y + rawNoise) / stepSize) * stepSize;
            if (i === 0) ctx.moveTo(pt.x, quantizedY);
            else ctx.lineTo(pt.x, quantizedY);
        }
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 68, 68, 0.07)';
        ctx.fillRect(0, height * 0.40, splitX, height * 0.34);
        ctx.restore();

        // 2. RIGHT SIDE: CableHunt 12-Bit Native (4,096 Levels)
        ctx.save();
        ctx.beginPath();
        ctx.rect(splitX, 0, width - splitX, height);
        ctx.clip();

        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.6;
        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
            const pt = baseSignal[i];
            const fineNoise = pseudoNoise(i, phaseTick) * 1.3;
            const fineY = pt.y + fineNoise;
            if (i === 0) ctx.moveTo(pt.x, fineY);
            else ctx.lineTo(pt.x, fineY);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fault callout marker on the 12-bit side
        let markerT = 0.55;
        let markerTitle = '1D-CNN DETECTED: -0.78 dB Macrobend @ 42.1km (98.4% Conf.)';
        let markerColor = '#f7941d';

        if (currentFaultMode === 'splice') {
            markerT = 0.42;
            markerTitle = '1D-CNN PROGNOSTIC: -0.08 dB Splice Decay @ 31.4km (19d to Failure)';
            markerColor = '#10b981';
        } else if (currentFaultMode === 'ferrule') {
            markerT = 0.05;
            markerTitle = 'ZERO DEAD-ZONE (<0.8m): ODF SC/APC Ferrule Contamination @ 0.4m';
            markerColor = '#ef4444';
        } else if (currentFaultMode === 'clean') {
            markerT = 0.91;
            markerTitle = '40G DWDM LOCKED: 80.0km Span Healthy (OSNR 31.4 dB | BER < 1e-12)';
            markerColor = '#10b981';
        }

        const anomalyX = width * markerT;
        const anomalyY = computeBaseSignal(markerT);

        ctx.beginPath();
        ctx.arc(anomalyX, anomalyY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(247, 148, 29, 0.25)';
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = markerColor;
        ctx.stroke();

        const labelX = Math.min(width - 410, Math.max(splitX + 16, anomalyX - 140));
        const labelY = Math.max(76, anomalyY - 26);

        ctx.fillStyle = 'rgba(8, 10, 14, 0.88)';
        ctx.fillRect(labelX - 8, labelY - 16, 398, 25);
        ctx.strokeStyle = markerColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(labelX - 8, labelY - 16, 398, 25);

        ctx.fillStyle = markerColor;
        ctx.font = 'bold 11.5px "JetBrains Mono", monospace';
        ctx.fillText(markerTitle, labelX, labelY);

        ctx.restore();

        // Center Divider Line
        ctx.strokeStyle = '#f7941d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, height);
        ctx.stroke();

        // Interactive 16x Optical Magnifying Lens (when user hovers over the scope)
        if (hoverPos && !isDragging) {
            const lensR = 68;
            const lx = Math.max(lensR + 10, Math.min(width - lensR - 10, hoverPos.x));
            const ly = Math.max(lensR + 10, Math.min(height - lensR - 10, hoverPos.y));

            ctx.save();
            ctx.beginPath();
            ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
            ctx.clip();

            ctx.fillStyle = '#03060c';
            ctx.fillRect(lx - lensR, ly - lensR, lensR * 2, lensR * 2);

            // Fine sub-millivolt 12-bit quantization grid inside lens
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
            ctx.lineWidth = 0.8;
            for (let gx = lx - lensR; gx <= lx + lensR; gx += 12) {
                ctx.beginPath(); ctx.moveTo(gx, ly - lensR); ctx.lineTo(gx, ly + lensR); ctx.stroke();
            }
            for (let gy = ly - lensR; gy <= ly + lensR; gy += 12) {
                ctx.beginPath(); ctx.moveTo(lx - lensR, gy); ctx.lineTo(lx + lensR, gy); ctx.stroke();
            }

            // Zoomed 2.8x comparison inside lens (shows 8-bit red stair-steps vs 12-bit cyan precision)
            const zoom = 2.8;
            // 8-bit red trace (dashed reference inside lens)
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.72)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            for (let i = 0; i <= points; i++) {
                const pt = baseSignal[i];
                const rawNoise = pseudoNoise(i, phaseTick) * 30;
                const qY = Math.round((pt.y + rawNoise) / stepSize) * stepSize;
                const zx = lx + (pt.x - lx) * zoom;
                const zy = ly + (qY - ly) * zoom;
                if (i === 0) ctx.moveTo(zx, zy);
                else ctx.lineTo(zx, zy);
            }
            ctx.stroke();

            // 12-bit cyan trace (ultra-clean zoomed inside lens)
            ctx.strokeStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3.0;
            ctx.beginPath();
            for (let i = 0; i <= points; i++) {
                const pt = baseSignal[i];
                const fineY = pt.y + pseudoNoise(i, phaseTick) * 1.3;
                const zx = lx + (pt.x - lx) * zoom;
                const zy = ly + (fineY - ly) * zoom;
                if (i === 0) ctx.moveTo(zx, zy);
                else ctx.lineTo(zx, zy);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Crosshair & 16x HUD label inside lens
            ctx.strokeStyle = 'rgba(247, 148, 29, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(lx - 14, ly); ctx.lineTo(lx + 14, ly);
            ctx.moveTo(lx, ly - 14); ctx.lineTo(lx, ly + 14);
            ctx.stroke();

            ctx.fillStyle = '#f7941d';
            ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
            ctx.fillText('16x 12-BIT LENS', lx - 44, ly - lensR + 18);
            const kmAtCursor = Math.max(0, Math.min(80, ((lx / width - 0.05) / 0.86) * 80)).toFixed(1);
            ctx.fillStyle = '#06b6d4';
            ctx.fillText(`${kmAtCursor} km | 4096 LVL`, lx - 48, ly + lensR - 11);
            ctx.restore();

            // Outer Lens Ring
            ctx.beginPath();
            ctx.arc(lx, ly, lensR, 0, Math.PI * 2);
            ctx.strokeStyle = '#f7941d';
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }
    }

    function updateSlider(clientX) {
        const rect = container.getBoundingClientRect();
        let pos = (clientX - rect.left) / rect.width;
        sliderPos = Math.max(0.05, Math.min(0.95, pos));
        sliderHandle.style.left = `${sliderPos * 100}%`;
        drawWaveforms();
    }

    container.addEventListener('mousedown', (e) => {
        if (e.target.closest('.fault-inject-btn')) return;
        isDragging = true;
        updateSlider(e.clientX);
    });
    container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        hoverPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (!isDragging) drawWaveforms();
    });
    container.addEventListener('mouseleave', () => {
        hoverPos = null;
        drawWaveforms();
    });
    window.addEventListener('mousemove', (e) => {
        if (isDragging) updateSlider(e.clientX);
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => {
        if (e.target.closest('.fault-inject-btn')) return;
        isDragging = true;
        updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (isDragging) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    window.addEventListener('touchend', () => { isDragging = false; });

    window.injectFiberAnomaly = (mode, btnEl) => {
        currentFaultMode = mode;
        phaseTick += 1;
        drawWaveforms();

        const allBtns = document.querySelectorAll('.fault-inject-btn');
        allBtns.forEach(b => b.classList.remove('active'));
        if (btnEl) {
            btnEl.classList.add('active');
        }

        const statusEl = document.getElementById('scope-fault-telemetry');
        if (statusEl) {
            const summaries = {
                macrobend: '<span style="color:#f7941d;">● 1D-CNN DIAGNOSTIC:</span> Physical Macrobend at <strong>42.1 km</strong> (-0.78 dB L-Band drop). <strong>Netmiko BGP/OSPF protection switch triggered in 38.4 ms.</strong>',
                splice: '<span style="color:#10b981;">● 1D-CNN PROGNOSTIC:</span> Sub-millivolt Fusion Splice Degradation at <strong>31.4 km</strong> (-0.08 dB loss). Predicted failure horizon: <strong>19 Days</strong>.',
                ferrule: '<span style="color:#ef4444;">● ZERO DEAD-ZONE (&lt;0.8m):</span> ODF SC/APC End-Face Contamination at <strong>0.4 m</strong> (-34 dB ORL spike). Dispatching IEC 61300-3-35 cleaning alert.',
                clean: '<span style="color:#06b6d4;">● 40G BROWNFIELD LOCKED:</span> 80.0 km G.652.D Span Nominal. <strong>40G DWDM (4×10G C-Band) Active</strong> | Pre-FEC BER: 1.2×10⁻¹³.'
            };
            statusEl.innerHTML = summaries[mode] || summaries.macrobend;
        }
    };

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 80);
});
