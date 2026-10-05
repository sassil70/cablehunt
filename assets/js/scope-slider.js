/**
 * CableHunt Networks - 12-Bit vs 8-Bit Interactive Scope Comparison Slider
 * Accurately simulates quantization noise and sub-millivolt optical macrobend resolution.
 */

(function () {
  const container = document.getElementById('scope-comparison-box');
  const canvas = document.getElementById('scope-comparison-canvas');
  const slider = document.getElementById('scope-slider-handle');

  if (!container || !canvas || !slider) return;

  const ctx = canvas.getContext('2d');
  let splitPercent = 0.5; // Starts in the middle
  let isDragging = false;

  function resizeCanvas() {
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawWaveforms();
  }

  function drawWaveforms() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    const splitX = width * splitPercent;

    ctx.clearRect(0, 0, width, height);

    // Dark grid background
    ctx.fillStyle = '#08090C';
    ctx.fillRect(0, 0, width, height);

    // Reticle Grid
    ctx.strokeStyle = '#151922';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Baseline Mathematical Signal (True Analog Optical Response)
    // Simulates: Launch Pulse -> Fiber Slope -> 0.7 dB Macrobend at 60% -> Fusion Splice -> End Face
    function getTrueSignal(x) {
      const normX = x / width;
      let y = 70 + normX * 140; // Rayleigh Slope

      // Launch Fresnel Reflection
      if (normX < 0.08) {
        y -= Math.sin(normX / 0.08 * Math.PI) * 45;
      }
      // Micro-bend impairment at 60% (The crucial fault!)
      if (normX > 0.58) {
        y += 24; // Macrobend attenuation step
      }
      // Fusion splice at 78%
      if (normX > 0.78 && normX < 0.81) {
        y -= 8;
      }
      return y;
    }

    // 1. Draw Left Side: 8-Bit Legacy Waveform (Red/Noise, 256 quantization levels)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2.0;
    ctx.beginPath();

    const quantStep8Bit = 12.0; // Large step sizes (Quantization Noise)
    for (let x = 0; x < splitX; x += 3) {
      const trueY = getTrueSignal(x);
      // Heavy 8-bit rounding & mains noise
      const quantizedY = Math.round(trueY / quantStep8Bit) * quantStep8Bit;
      const noise = (Math.random() - 0.5) * 11;
      const y = quantizedY + noise;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 8-Bit Warning Tag
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('FAULT MASKED BY QUANTIZATION NOISE', 25, height - 30);

    ctx.restore();

    // 2. Draw Right Side: 12-Bit Native ADC Waveform (CableHunt Signature Orange, 4096 levels)
    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, width - splitX, height);
    ctx.clip();

    ctx.strokeStyle = '#F7941D';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(247, 148, 29, 0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();

    const quantStep12Bit = 0.75; // 16x finer quantization
    for (let x = splitX; x < width; x += 2) {
      const trueY = getTrueSignal(x);
      // Clean 12-bit native curve
      const quantizedY = Math.round(trueY / quantStep12Bit) * quantStep12Bit;
      const noise = (Math.random() - 0.5) * 1.2; // Minimized noise floor
      const y = quantizedY + noise;

      if (x === splitX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight the detected macrobend drop!
    const macrobendX = width * 0.58;
    if (splitX < macrobendX) {
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.fillText('▲ MACROBEND DETECTED (-0.78 dB)', macrobendX - 20, 185);
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(macrobendX, 80);
      ctx.lineTo(macrobendX, 260);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();

    // Update Slider Handle Position
    slider.style.left = `${splitPercent * 100}%`;
  }

  // Drag Interactions
  function onPointerMove(e) {
    if (!isDragging) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let x = clientX - rect.left;
    x = Math.max(40, Math.min(rect.width - 40, x));
    splitPercent = x / rect.width;
    drawWaveforms();
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    onPointerMove(e);
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', onPointerMove);

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    onPointerMove(e);
  }, { passive: true });

  window.addEventListener('touchend', () => { isDragging = false; });
  window.addEventListener('touchmove', onPointerMove, { passive: true });

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);
})();
