/**
 * CableHunt — Interactive Brownfield CapEx & ROI Calculator
 * Models civil trenching avoidance (£140k/km UK urban/metro average) vs. CableHunt 12-bit DWDM edge upgrade.
 */

document.addEventListener('DOMContentLoaded', () => {
    const linkSlider = document.getElementById('calc-links-slider');
    const distSlider = document.getElementById('calc-dist-slider');

    const linkVal = document.getElementById('calc-links-display') || document.getElementById('calc-links-val');
    const distVal = document.getElementById('calc-dist-display') || document.getElementById('calc-dist-val');

    const savingsOutput = document.getElementById('calc-savings-total') || document.getElementById('calc-savings-output');
    const bandwidthOutput = document.getElementById('calc-bandwidth-val') || document.getElementById('calc-bandwidth-output');
    const paybackOutput = document.getElementById('calc-payback-val') || document.getElementById('calc-payback-output');
    const civilCostOutput = document.getElementById('calc-civil-cost-val');
    const chCostOutput = document.getElementById('calc-ch-cost-val');

    if (!linkSlider || !distSlider || !savingsOutput) return;

    function formatGBP(amount) {
        if (amount >= 1000000) {
            return '£' + (amount / 1000000).toFixed(2) + 'M';
        }
        return '£' + Math.round(amount).toLocaleString('en-GB');
    }

    function updateCalculator() {
        const links = parseInt(linkSlider.value, 10);
        const distKm = parseInt(distSlider.value, 10);

        // Update slider value badges
        if (linkVal) linkVal.textContent = `${links} ${links === 1 ? 'Link' : 'Links'}`;
        if (distVal) distVal.textContent = `${distKm} km`;

        // UK Metro/Regional Civil Trenching Cost: ~£140,000 per km (scaled modestly across shared duct corridors)
        // Effective civil replacement cost per link corridor:
        const civilCostPerLink = distKm * 70000; // £2.8M for 40km baseline
        const totalCivilCapEx = links * civilCostPerLink;

        // CableHunt Brownfield Upgrade (12-bit Edge Node + DWDM Transceiver Calibration + Licensing):
        // ~£12,000 base per link + £350/km optical conditioning
        const cablehuntCostPerLink = 12000 + (distKm * 350);
        const totalCablehuntCapEx = links * cablehuntCostPerLink;

        const netSavings = Math.max(0, totalCivilCapEx - totalCablehuntCapEx);

        // Unlocked capacity: 40 Gbps per upgraded brownfield link
        const totalBandwidthGbps = links * 40;
        let bandwidthText = `${totalBandwidthGbps.toLocaleString('en-GB')} Gbps`;
        if (totalBandwidthGbps >= 1000) {
            bandwidthText = `${(totalBandwidthGbps / 1000).toFixed(2)} Tbps (${totalBandwidthGbps.toLocaleString('en-GB')} Gbps)`;
        }

        // Payback period in months (economies of scale reduce payback on multi-link rollouts)
        const rawPayback = 4.2 - (Math.log10(links) * 1.15) + (distKm > 70 ? 0.4 : 0);
        const paybackMonths = Math.max(1.2, Math.min(4.8, rawPayback)).toFixed(1);

        savingsOutput.textContent = formatGBP(netSavings);
        if (bandwidthOutput) bandwidthOutput.textContent = bandwidthText;
        if (paybackOutput) paybackOutput.textContent = `< ${paybackMonths} Months`;
        if (civilCostOutput) civilCostOutput.textContent = formatGBP(totalCivilCapEx);
        if (chCostOutput) chCostOutput.textContent = formatGBP(totalCablehuntCapEx);
    }

    linkSlider.addEventListener('input', updateCalculator);
    distSlider.addEventListener('input', updateCalculator);

    // Initial calculation on load
    updateCalculator();
});
