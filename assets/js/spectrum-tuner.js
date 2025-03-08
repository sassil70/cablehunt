/**
 * CableHunt — Interactive ITU-T Optical Grid Explorer (1260nm – 1675nm) & Live 40G Eye Diagram
 * Matches #spectrum-wave-slider, .band-pill, and selectBand(wavelength) in index.html.
 */

let currentWavelength = 1550;
let eyeCompensated = true;

function getBandInfo(nm) {
    if (nm < 1360) {
        return {
            code: 'O',
            name: 'O-Band (Original • Zero-Dispersion Window)',
            loss: (0.34 - (nm - 1260) * 0.0003).toFixed(3),
            dispersion: '0.4 ps/(nm·km)',
            eyeOpening: 0.89,
            color: '#06b6d4',
            action: '<span class="text-cyan">✔ ZERO-DISPERSION WINDOW:</span> Optimal for macrobend resilience &amp; low-latency 40G grey/LAN-WDM links.'
        };
    } else if (nm < 1460) {
        const waterPeak = Math.exp(-Math.pow((nm - 1383) / 14, 2)) * 0.24;
        const lossVal = (0.27 + waterPeak).toFixed(3);
        return {
            code: 'E',
            name: 'E-Band (Extended • OH⁻ Water Peak Zone)',
            loss: lossVal,
            dispersion: '5.4 ps/(nm·km)',
            eyeOpening: waterPeak > 0.08 ? 0.58 : 0.78,
            color: '#f59e0b',
            action: waterPeak > 0.08
                ? '<span class="text-orange">⚠ OH⁻ WATER PEAK DETECTED:</span> High hydroxyl absorption around 1383nm. Auto-shifting channels to C/O-Band.'
                : '<span class="text-green">✔ E-BAND GUARD WINDOW:</span> Moderate attenuation; suitable for auxiliary CWDM expansion.'
        };
    } else if (nm < 1530) {
        return {
            code: 'S',
            name: 'S-Band (Short-Wavelength Window)',
            loss: (0.22 - (nm - 1460) * 0.0003).toFixed(3),
            dispersion: '12.6 ps/(nm·km)',
            eyeOpening: 0.86,
            color: '#38bdf8',
            action: '<span class="text-cyan">✔ S-BAND COEXISTENCE:</span> Low-loss window ideal for Raman pumping &amp; PON/DWDM supervisory channels.'
        };
    } else if (nm <= 1565) {
        return {
            code: 'C',
            name: 'C-Band (Conventional • Primary 40G DWDM)',
            loss: '0.190',
            dispersion: '16.8 ps/(nm·km) [DSP Pre-Compensated]',
            eyeOpening: 0.96,
            color: '#10b981',
            action: '<span class="text-green">✔ OPTIMAL 40G DWDM WINDOW:</span> 0.190 dB/km minimum physical silica attenuation. 4×10G / 40G locked.'
        };
    } else if (nm <= 1625) {
        return {
            code: 'L',
            name: 'L-Band (Long-Wavelength • Bend Sensitive)',
            loss: (0.205 + (nm - 1565) * 0.0005).toFixed(3),
            dispersion: '20.4 ps/(nm·km)',
            eyeOpening: 0.90,
            color: '#f7941d',
            action: '<span class="text-orange">⚡ L-BAND EXTENDED CAPACITY:</span> High sensitivity to physical duct pinches; active 12-bit bend tracking.'
        };
    } else {
        return {
            code: 'U',
            name: 'U-Band (Ultra-Long • 1650nm Out-of-Band OTDR)',
            loss: (0.245 + (nm - 1625) * 0.0012).toFixed(3),
            dispersion: '23.2 ps/(nm·km)',
            eyeOpening: 0.82,
            color: '#ef4444',
            action: '<span class="text-orange">🔬 1650nm LIVE IN-SERVICE OTDR:</span> Out-of-band 12-bit fault polling active without disturbing C-Band 40G traffic.'
        };
    }
}

function drawEyeDiagram() {
    const canvas = document.getElementById('eye-diagram-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle oscilloscope grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 28) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    const info = getBandInfo(currentWavelength);
    const opening = eyeCompensated ? info.eyeOpening : 0.31;
    const traceColor = eyeCompensated ? info.color : '#ef4444';

    const midY = h * 0.54;
    const amp = (h * 0.33) * opening;
    const jitter = eyeCompensated ? 3.0 : 16.5;

    ctx.save();
    ctx.strokeStyle = traceColor;
    ctx.shadowColor = traceColor;
    ctx.shadowBlur = eyeCompensated ? 8 : 2;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.48;

    const patterns = [
        [1, 1, 1], [0, 0, 0], [0, 1, 0], [1, 0, 1],
        [0, 1, 1], [1, 1, 0], [0, 0, 1], [1, 0, 0]
    ];

    for (let pass = 0; pass < 3; pass++) {
        patterns.forEach((bits, pIdx) => {
            ctx.beginPath();
            const steps = 90;
            const phaseOffset = ((pIdx * 7 + pass * 13) % 11 - 5) * (jitter * 0.004);
            const ampNoise = ((pIdx * 3 + pass * 5) % 7 - 3) * (jitter * 0.35);

            for (let s = 0; s <= steps; s++) {
                const u = s / steps;
                const x = u * w;
                const pos = (u + phaseOffset) * 2;
                const idx = Math.floor(Math.max(0, Math.min(1.99, pos)));
                const frac = pos - idx;
                const bStart = bits[idx] ? -1 : 1;
                const bEnd = bits[idx + 1] ? -1 : 1;
                const cosineBlend = (1 - Math.cos(Math.PI * frac)) / 2;
                let level = bStart * (1 - cosineBlend) + bEnd * cosineBlend;

                if (!eyeCompensated) {
                    level *= 0.65;
                    level += Math.sin(u * Math.PI * 6 + pIdx) * 0.3;
                }

                const y = midY + level * amp + ampNoise * Math.sin(u * Math.PI * 4);
                if (s === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
    }
    ctx.restore();

    if (eyeCompensated) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(w * 0.5, midY - amp * 0.78);
        ctx.lineTo(w * 0.5, midY + amp * 0.78);
        ctx.moveTo(w * 0.32, midY);
        ctx.lineTo(w * 0.68, midY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.fillStyle = eyeCompensated ? '#10b981' : '#ef4444';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    const qFactor = eyeCompensated ? (8.1 * opening).toFixed(1) : '2.1 (ISI Closed)';
    const statusText = eyeCompensated
        ? `40G OPTICAL EYE OPEN | Q-Factor: ${qFactor} | Dispersion: ${info.dispersion}`
        : `UNCOMPENSATED 1G LEGACY | Chromatic Dispersion Closure (Q: ${qFactor})`;
    ctx.fillText(statusText, 12, 18);
}

function updateSpectrumUI(nm) {
    currentWavelength = parseFloat(nm);
    const info = getBandInfo(currentWavelength);

    const waveEl = document.getElementById('spectrum-current-wave');
    const bandEl = document.getElementById('spectrum-active-band');
    const lossEl = document.getElementById('spectrum-loss-val');
    const actionEl = document.getElementById('spectrum-action-text');
    const sliderEl = document.getElementById('spectrum-wave-slider');

    if (waveEl) waveEl.textContent = `${currentWavelength.toFixed(1)} nm`;
    if (bandEl) bandEl.textContent = info.name;
    if (lossEl) lossEl.textContent = `${info.loss} dB/km`;
    if (actionEl) actionEl.innerHTML = info.action;
    if (sliderEl && parseFloat(sliderEl.value) !== currentWavelength) {
        sliderEl.value = currentWavelength;
    }

    // Highlight only .band-pill buttons inside #spectral-engine
    const pills = document.querySelectorAll('#spectral-engine .band-pill');
    pills.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-band') === info.code);
    });

    drawEyeDiagram();
}

window.selectBand = (wavelengthNm) => {
    updateSpectrumUI(wavelengthNm);
};

window.toggleEyeCompensation = (compensated, btnEl) => {
    eyeCompensated = compensated;
    const btns = document.querySelectorAll('.eye-mode-btn');
    btns.forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    drawEyeDiagram();
};

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('spectrum-wave-slider');
    if (slider) {
        slider.addEventListener('input', (e) => updateSpectrumUI(e.target.value));
    }
    setTimeout(() => updateSpectrumUI(1550), 90);
    window.addEventListener('resize', drawEyeDiagram);
});
