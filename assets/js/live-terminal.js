/**
 * CableHunt Networks - Live Cisco & MikroTik Autonomous Remediation Terminal
 * Simulates real-time physical-layer fault ingestion, 1D-CNN classification, and Netmiko CLI injection.
 */

(function () {
  const terminalBody = document.getElementById('terminal-live-body');
  if (!terminalBody) return;

  const scenarios = {
    macrobend: [
      { text: '> INGESTING CH1 ANALOG WAVEFORM: Attenuation spike at 1550nm (+4.2 dB)...', cls: 'prompt-prefix', delay: 100 },
      { text: '> SPECTRAL ANOMALY: 1310nm attenuation normal (0.33 dB/km), 1550nm severely degraded.', cls: 'terminal-output', delay: 350 },
      { text: '> NEURAL CLASSIFIER (1D-CNN + TST): Fault Classified as [MACROBEND] at marker 4.250 km (Confidence: 99.4%)', cls: 'terminal-highlight', delay: 700 },
      { text: '> TRIGGERING AUTONOMOUS REMEDIATION VIA NETMIKO (SSH -> Cisco IE-3000 Switch)...', cls: 'prompt-prefix', delay: 1050 },
      { text: 'cisco-switch# configure terminal', cls: 'terminal-output', delay: 1300 },
      { text: 'cisco-switch(config)# interface TenGigabitEthernet0/0/1', cls: 'terminal-output', delay: 1550 },
      { text: 'cisco-switch(config-if)# transceiver transmit-power dynamic auto', cls: 'terminal-output', delay: 1800 },
      { text: 'cisco-switch(config-if)# service-policy input OPTICAL_SPECTRAL_PROFILE_LOW_LOSS', cls: 'terminal-output', delay: 2050 },
      { text: 'cisco-switch(config-if)# exit', cls: 'terminal-output', delay: 2200 },
      { text: '> ACTION EXECUTED: Wavelength auto-shifted to O-Band window. Link throughput restored to 40G (0 packet loss).', cls: 'terminal-highlight', delay: 2500 }
    ],
    laser: [
      { text: '> INGESTING CH3 SFP DDM TELEMETRY: Laser Bias current Tx_Bias = 34.2 mA (Warning > 30.0 mA)', cls: 'prompt-prefix', delay: 100 },
      { text: '> ANALOG METRIC: Vpp dropped by 18%, Optical Sag exceeded 15.2%', cls: 'terminal-output', delay: 350 },
      { text: '> NEURAL CLASSIFIER: [LASER_DEGRADATION] detected. Gradual soft failure predicted in 48 hours.', cls: 'terminal-highlight', delay: 700 },
      { text: '> AUTONOMOUS SWITCH ACTION: Boosting Transceiver Optical Margin & Modulation Adaptation...', cls: 'prompt-prefix', delay: 1050 },
      { text: 'cisco-switch(config-if)# optical modulation-adaptation enable', cls: 'terminal-output', delay: 1350 },
      { text: 'cisco-switch(config-if)# transceiver threshold optical-power tx warning 3.5', cls: 'terminal-output', delay: 1650 },
      { text: '> ACTION EXECUTED: Modulation adapted to QPSK tolerance. Zero service downtime. Maintenance ticket dispatched.', cls: 'terminal-highlight', delay: 2000 }
    ],
    cut: [
      { text: '> HARDWARE TRIGGER (CH4 RX_LOS): Sudden Loss of Signal latch detected (<0.1ms)!', cls: 'prompt-prefix', delay: 100 },
      { text: '> ANALOG LEVEL: Vpp = 0.0 mV. OTDR trace reveals Fresnel reflection peak followed by noise floor.', cls: 'terminal-output', delay: 350 },
      { text: '> FAULT LOCALIZATION REGRESSOR: Hard cut located precisely at 1,842.15 metres!', cls: 'terminal-highlight', delay: 700 },
      { text: '> INITIATING OPTICAL PROTECTION SWITCHING (OPS < 50ms)...', cls: 'prompt-prefix', delay: 1000 },
      { text: '> TRAFFIC REROUTED VIA SECONDARY DIVERSE FIBRE RING (SRv6 / MPLS-TE Fast Reroute active).', cls: 'terminal-highlight', delay: 1300 },
      { text: '> JSON WORK ORDER DISPATCHED TO BIRMINGHAM RAPID RESPONSE CREW WITH GPS COORDINATES.', cls: 'terminal-output', delay: 1700 }
    ]
  };

  window.runTerminalScenario = function (scenarioKey) {
    const lines = scenarios[scenarioKey];
    if (!lines) return;

    terminalBody.innerHTML = '';
    
    lines.forEach(item => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = item.cls;
        div.textContent = item.text;
        terminalBody.appendChild(div);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }, item.delay);
    });
  };

  // Run macrobend on init
  setTimeout(() => {
    window.runTerminalScenario('macrobend');
  }, 1000);
})();
