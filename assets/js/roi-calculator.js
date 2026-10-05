/**
 * CableHunt Networks - 1G to 40G Speed Multiplier ROI Calculator
 * Calculates estimated civil works, re-cabling, and downtime savings in GBP (£).
 */

(function () {
  const linkSlider = document.getElementById('calc-links-slider');
  const distSlider = document.getElementById('calc-dist-slider');
  const linksVal = document.getElementById('calc-links-val');
  const distVal = document.getElementById('calc-dist-val');
  const savingsOutput = document.getElementById('calc-savings-output');
  const bandwidthOutput = document.getElementById('calc-bandwidth-output');
  const paybackOutput = document.getElementById('calc-payback-output');

  if (!linkSlider || !distSlider || !savingsOutput) return;

  function calculateROI() {
    const links = parseInt(linkSlider.value, 10);
    const distanceKm = parseFloat(distSlider.value);

    linksVal.textContent = `${links} Links`;
    distVal.textContent = `${distanceKm} km`;

    // 1. Traditional Cost to Replace / Trench New 40G-certified Glass
    // Average urban UK civil trenching / new cable deployment: £4,500 - £8,000 per km per link corridor
    const traditionalCapEx = links * (distanceKm * 4800 + 3500);

    // 2. CableHunt Cost: £450 per edge rig + £80/month SaaS
    const cablehuntYearOneCost = (links * 450) + (links * 80 * 12);

    // Net Capital Expenditure Savings
    const netSavings = Math.max(0, traditionalCapEx - cablehuntYearOneCost);

    // Aggregate Bandwidth Created (Links * 40 Gbps)
    const aggregateGbps = links * 40;

    // Formatting outputs
    savingsOutput.textContent = `£${netSavings.toLocaleString('en-GB')}`;
    if (bandwidthOutput) bandwidthOutput.textContent = `${(aggregateGbps / 1000).toFixed(1)} Tbps (${aggregateGbps} Gbps)`;
    if (paybackOutput) paybackOutput.textContent = `${Math.max(1, Math.round(cablehuntYearOneCost / (netSavings / 365)))} Days`;
  }

  linkSlider.addEventListener('input', calculateROI);
  distSlider.addEventListener('input', calculateROI);

  calculateROI();
})();
