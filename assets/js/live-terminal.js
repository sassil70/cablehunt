/**
 * CableHunt — Live Interactive CLI & Autonomous Netmiko Switch Orchestration
 * Matches #terminal-live-body and scenarios ('macrobend', 'laser', 'cut') in index.html.
 */

const cliScenarios = {
    'macrobend': [
        { text: "$ cablehunt-cli --target=birmingham-spool-80km --mode=12bit-boxcar --averages=1024", type: "cmd" },
        { text: "[INFO] Initialising 12-Bit Native ADC Frontend (4,096 Quantisation Levels @ 1.25 GS/s)...", type: "info" },
        { text: "[PASS] Floating-Ground DC-DC Isolation Verified (2,500 Vrms barrier | 0.0mA Ground Loop).", type: "success" },
        { text: "[ALERT] L-Band (1625nm) > C-Band (1550nm) Differential Loss Detected at 42.140 km (-0.78 dB)!", type: "warn" },
        { text: "[AI-1DCNN] Classification: Physical Macrobend / Duct Pinch (Confidence: 98.4%).", type: "warn" },
        { text: "[NETMIKO] Opening SSHv2 Fast-Socket to Cisco IOS-XR & MikroTik CRS Core Switches...", type: "info" },
        { text: "[CLI-EXEC] interface TenGigE0/0/0/4 -> transceiver wavelength-shift 1310nm-o-band", type: "cmd" },
        { text: "[SUCCESS] Active traffic shifted to bend-resilient O-Band in 34.2 ms! Zero packet loss.", type: "success" },
        { text: "[REPORT] Signed .SOR trace & telemetry dispatched to info@cablehunt.co.uk.", type: "info" }
    ],
    'laser': [
        { text: "$ cablehunt-cli --daemon --watch=sfp28-dwdm-ch34 --auto-modulate=adaptive", type: "cmd" },
        { text: "[TELEMETRY] Polling DDM/DOM & 12-Bit Coherent OSNR across 64.5 km Brownfield Span...", type: "info" },
        { text: "[WARN] Transmitter Laser Bias Current Drift (+14.2%) | Tx Power Sag: -2.4 dBm -> -4.9 dBm.", type: "warn" },
        { text: "[AI-1DCNN] Prognostic Alert: DFB Laser Thermal Aging (Estimated Remaining Life: 21 Days).", type: "warn" },
        { text: "[NETMIKO] Connecting to Optical Line Terminal & Coherent DSP Controller...", type: "info" },
        { text: "[CLI-EXEC] optical-dsp modulation-format step-down 16qam -> qpsk --edfa-gain +2.5dB", type: "cmd" },
        { text: "[SUCCESS] Link Margin Restored (+6.2 dB OSNR Headroom) in 29.8 ms! Pre-FEC BER: 1.1e-12.", type: "success" },
        { text: "[TICKET] Preventive DFB transceiver swap scheduled via jalal@cablehunt.co.uk.", type: "info" }
    ],
    'cut': [
        { text: "$ cablehunt-cli --daemon --watch=trunk-london-birmingham-01 --protect=sub50ms", type: "cmd" },
        { text: "[MONITOR] Continuous 1650nm U-Band Out-of-Band Supervisory Sweep Active...", type: "info" },
        { text: "[CRITICAL] Sudden Fresnel Reflection Spike (-14.2 dB ORL) & Total Backscatter Drop at 18.412 km!", type: "err" },
        { text: "[AI-1DCNN] Classification: Physical Acoustic/Excavation Cable Cut (Confidence: 99.6%).", type: "err" },
        { text: "[NETMIKO] Executing Sub-50ms MPLS-TE Fast-Reroute & BGP-PIC Edge Protection...", type: "warn" },
        { text: "[CLI-EXEC] mpls traffic-eng tunnel-te104 path-option 1 standby-ring-b activate-immediate", type: "cmd" },
        { text: "[SUCCESS] 40G DWDM Bearer Rerouted to Diverse Ring B in 38.4 ms! SLA 99.999% Preserved.", type: "success" },
        { text: "[GIS-GPS] Splice Van Dispatched -> 52.4751° N, 1.8298° W (Precision: ±0.42m).", type: "success" }
    ]
};

// Map aliases so Closed-Loop Fault Injector buttons also drive the terminal smoothly
cliScenarios['scan'] = cliScenarios['macrobend'];
cliScenarios['40g'] = cliScenarios['laser'];

let termTimeout = null;

window.runTerminalScenario = (scenarioKey, btnEl) => {
    const output = document.getElementById('terminal-live-body') || document.getElementById('cli-terminal-output');
    if (!output) return;

    const lines = cliScenarios[scenarioKey] || cliScenarios['macrobend'];

    // Highlight only buttons inside #closed-loop
    const loopBtns = document.querySelectorAll('#closed-loop .device-hotspot-btn, #closed-loop .cli-scenario-btn');
    loopBtns.forEach(btn => {
        btn.classList.remove('active');
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (btn === btnEl || onclickAttr.includes(`'${scenarioKey}'`)) {
            btn.classList.add('active');
        }
    });

    if (termTimeout) clearTimeout(termTimeout);
    output.innerHTML = '';

    let index = 0;

    function printNextLine() {
        if (index >= lines.length) return;
        const item = lines[index];
        const div = document.createElement('div');
        div.style.marginBottom = '8px';
        div.style.fontFamily = 'var(--font-mono)';
        div.style.fontSize = '0.84rem';
        div.style.lineHeight = '1.55';

        const colors = {
            cmd: '#ffffff',
            info: '#9ca3af',
            warn: '#f7941d',
            err: '#ef4444',
            success: '#10b981'
        };
        div.style.color = colors[item.type] || '#e5e7eb';
        if (item.type === 'cmd' || item.type === 'success') {
            div.style.fontWeight = '600';
        }
        div.textContent = item.text;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
        index++;

        const delay = item.type === 'cmd' ? 320 : 250;
        termTimeout = setTimeout(printNextLine, delay);
    }

    printNextLine();
};

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (typeof window.runTerminalScenario === 'function') {
            window.runTerminalScenario('macrobend');
        }
    }, 500);
});
