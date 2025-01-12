/**
 * CableHunt Networks - Interactive ITU-T Optical Spectrum Explorer
 * Simulates wavelength attenuation, water peak absorption, and optimal band shift recommendations.
 */

(function () {
  const slider = document.getElementById('spectrum-wave-slider');
  const waveVal = document.getElementById('spectrum-current-wave');
  const bandBadge = document.getElementById('spectrum-active-band');
  const lossVal = document.getElementById('spectrum-loss-val');
  const actionText = document.getElementById('spectrum-action-text');

  if (!slider || !waveVal || !bandBadge || !lossVal || !actionText) return;

  const bands = [
    { name: 'O-Band (Original)', min: 1260, max: 1360, class: 'O', desc: 'Zero chromatic dispersion window. Ideal for upstream PON and severe macrobend bypass.' },
    { name: 'E-Band (Extended)', min: 1360, max: 1460, class: 'E', desc: 'Water peak absorption zone (1383nm in legacy G.652.A/B). Bypassed by CableHunt dynamic routing.' },
    { name: 'S-Band (Short Wave)', min: 1460, max: 1530, class: 'S', desc: 'Low-loss expansion band. Used for distributed Raman amplification and live out-of-band telemetry.' },
    { name: 'C-Band (Conventional)', min: 1530, max: 1565, class: 'C', desc: 'Primary DWDM & EDFA band. Lowest glass loss (~0.19 dB/km), but highly vulnerable to macrobends.' },
    { name: 'L-Band (Long Wave)', min: 1565, max: 1625, class: 'L', desc: 'High-capacity DWDM expansion. Ultra-low attenuation for long-haul inter-data-centre trunks.' },
    { name: 'U-Band (Ultra-Long)', min: 1625, max: 1675, class: 'U', desc: 'Dedicated out-of-band maintenance & real-time live OTDR link surveillance.' }
  ];

  function updateSpectrum(wavelength) {
    waveVal.textContent = `${wavelength.toFixed(1)} nm`;

    // Identify active ITU-T band
    const currentBand = bands.find(b => wavelength >= b.min && wavelength <= b.max) || bands[3];
    bandBadge.textContent = currentBand.name;

    // Physical Loss Formula
    const rayleigh = 0.18 + 0.001 * Math.pow(wavelength - 1550.0, 2) / 1000.0;
    const waterPeak = (wavelength >= 1375 && wavelength <= 1405) ? (0.28 * Math.exp(-Math.pow(wavelength - 1383, 2) / 30)) : 0.0;
    const totalLoss = rayleigh + waterPeak;

    lossVal.textContent = `${totalLoss.toFixed(3)} dB/km`;

    // Dynamic Action recommendation
    if (wavelength >= 1375 && wavelength <= 1405) {
      actionText.innerHTML = `<span class="text-orange">⚠️ WATER PEAK HAZARD:</span> High OH-ion absorption detected. CableHunt algorithm auto-shifts to 1310nm or 1550nm.`;
    } else if (wavelength >= 1530 && wavelength <= 1565) {
      actionText.innerHTML = `<span class="text-green">✔ OPTIMAL DWDM WINDOW:</span> 0.19 dB/km minimum physical attenuation. Transceiver power auto-balanced.`;
    } else if (wavelength < 1360) {
      actionText.innerHTML = `<span class="text-cyan">✔ MACROBEND RESILIENT:</span> Short wavelength reduces macrobending loss by up to 8x compared to 1550nm.`;
    } else {
      actionText.innerHTML = `<span class="text-orange">ℹ EXPANSION ROUTE:</span> CableHunt closed-loop reroutes traffic to maintain 40G throughput without packet drops.`;
    }

    // Highlight band pill
    document.querySelectorAll('.band-pill').forEach(pill => {
      if (pill.dataset.band === currentBand.class) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  slider.addEventListener('input', (e) => {
    updateSpectrum(parseFloat(e.target.value));
  });

  window.selectBand = function (wave) {
    slider.value = wave;
    updateSpectrum(wave);
  };

  updateSpectrum(1550.0);
})();
