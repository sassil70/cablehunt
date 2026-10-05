/**
 * CableHunt Networks Limited - Autonomous Optical AI Agent
 * Official British Technical English Integration
 * Powered by Google Gemini Pro / Flash Core
 */

(function () {
  const GEMINI_API_KEY = (window.CABLEHUNT_CONFIG && window.CABLEHUNT_CONFIG.GEMINI_API_KEY && window.CABLEHUNT_CONFIG.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE")
    ? window.CABLEHUNT_CONFIG.GEMINI_API_KEY
    : "";
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;

  const SYSTEM_INSTRUCTION = `You are the CableHunt Autonomous Optical AI Agent, the official technical and commercial diagnostic intelligence representing CableHunt Networks Limited (Mayfair, London, UK).

CORE REMIT & MANDATORY GUARDRAILS:
1. STRICT DOMAIN SPECIALISATION: You ONLY answer technical, architectural, operational, and commercial questions directly regarding CableHunt Networks, physical-layer optical fibre diagnostics, 12-bit native ADC reflectometry, the 1G-to-40G Speed Multiplier, adaptive spectral optimisation, closed-loop network self-healing (Netmiko/Cisco/MikroTik), our Birmingham optical R&D testbed, and optical telecommunications engineering.
2. OUT-OF-SCOPE ENQUIRIES: If a visitor asks about anything outside of CableHunt Networks or optical network engineering (e.g. general chit-chat, weather, unrelated coding, generic trivia), you MUST politely, firmly, and authoritatively decline in refined British English and guide them back to our optical engineering technologies and capabilities.
3. LANGUAGE & SPELLING: You MUST write exclusively in immaculate, formal British Technical English at all times (e.g. "fibre", "optimisation", "specialised", "characterisation", "data centre", "programmes", "modelling", "colour", "signalling").
4. ACCURATE CORPORATE FACTS:
   - Entity: CableHunt Networks Limited (UK Company No. 16093071).
   - Headquarters: 3rd Floor, 45 Albemarle Street, Mayfair, London, W1S 4JL, United Kingdom.
   - Central Inbound Enquiries: info@cablehunt.co.uk | Telephone: +44 20 78702243.
   - Engineering Prototyping Facility: Birmingham, West Midlands, United Kingdom. We welcome network engineers, data centre architects, and photonics specialists for collaborative technical exchange by prior appointment.
   - Executive Leadership: Batoul Zien Alabdin (Chief Executive Officer - CEO), Ahmad Jalal Assil (Chief Operating Officer & Co-Founder - COO), and Eng. Saleem Asseel (Lead Scientific Advisor & Founding Systems Architect).
   - 12-Bit Native ADC: Delivers 4,096 discrete levels (16x vertical resolution enhancement over legacy 8-bit OTDRs), resolving Rayleigh backscatter slopes down to 0.05 dB with an event dead zone under 0.8 metres.
   - 1G-to-40G Speed Multiplier: Boosts brownfield single-mode optical links from 1G to 40G line-rates in software via dynamic chromatic dispersion compensation and ITU-T spectral allocation, bypassing multimillion-pound civil excavation and saving up to 88% in CapEx.
   - Handheld Unit Capabilities: Integrates dual-domain TDR, 12-Bit OTDR, Computer Vision cable defect recognition, RF over Fiber (RFOF) hybrid testing, and MICE industrial resilience.
   - Closed-Loop Remediation: Sub-50ms automated protection switching via Netmiko CLI scripts on core switches.
5. TONE: Authoritative, deeply technical, mathematically precise, polite, and commercially inspiring. Encourage technical dialogue and lab demonstration bookings.`;

  // Elements for Floating Drawer Modal
  const modal = document.getElementById('ai-chat-modal');
  const trigger = document.getElementById('ai-widget-trigger');
  const closeBtn = document.getElementById('ai-chat-close');
  const modalChatBody = document.getElementById('ai-chat-body');
  const modalInput = document.getElementById('ai-chat-input');
  const modalSendBtn = document.getElementById('ai-send-btn');

  // Elements for Dedicated On-Page Console
  const consoleChatBody = document.getElementById('console-chat-body');
  const consoleInput = document.getElementById('console-chat-input');
  const consoleSendBtn = document.getElementById('console-send-btn');

  // Modal toggle
  if (trigger && modal) {
    trigger.addEventListener('click', () => {
      modal.classList.toggle('open');
      if (modal.classList.contains('open') && modalInput) {
        modalInput.focus();
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  function appendBubble(container, sender, text) {
    if (!container) return null;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble-${sender}`;
    bubble.textContent = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }

  async function queryGeminiAgent(userPrompt) {
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${SYSTEM_INSTRUCTION}\n\nVisitor Enquiry: ${userPrompt}` }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 750,
        temperature: 0.25,
        topP: 0.9
      }
    };

    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return reply || "Thank you for your enquiry. CableHunt Networks pioneers 12-bit native optical reflectometry and closed-loop network remediation. Please feel free to submit a technical demonstration request to our Mayfair executive office via info@cablehunt.co.uk.";
    } catch (err) {
      console.warn("Gemini Agent Query Fallback:", err);
      return "CableHunt Networks Limited (Mayfair, London) is a premier British optical deep-tech enterprise pioneering 12-bit native ADC reflectometry, the 1G-to-40G Speed Multiplier, and autonomous closed-loop network self-healing. For dedicated technical consultations, kindly contact info@cablehunt.co.uk.";
    }
  }

  // Handle send in on-page console
  async function handleConsoleSend(customText) {
    const text = customText || (consoleInput ? consoleInput.value.trim() : '');
    if (!text || !consoleChatBody) return;

    if (consoleInput) consoleInput.value = '';
    appendBubble(consoleChatBody, 'user', text);

    const indicator = appendBubble(consoleChatBody, 'bot', 'CableHunt Neural Core is analysing physical-layer telemetry...');
    const response = await queryGeminiAgent(text);
    if (indicator) {
      indicator.textContent = response;
    }
  }

  // Handle send in floating drawer modal
  async function handleModalSend(customText) {
    const text = customText || (modalInput ? modalInput.value.trim() : '');
    if (!text || !modalChatBody) return;

    if (modalInput) modalInput.value = '';
    appendBubble(modalChatBody, 'user', text);

    const indicator = appendBubble(modalChatBody, 'bot', 'CableHunt Neural Core is analysing physical-layer telemetry...');
    const response = await queryGeminiAgent(text);
    if (indicator) {
      indicator.textContent = response;
    }
  }

  if (consoleSendBtn) {
    consoleSendBtn.addEventListener('click', () => handleConsoleSend());
  }
  if (consoleInput) {
    consoleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConsoleSend();
    });
  }

  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', () => handleModalSend());
  }
  if (modalInput) {
    modalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleModalSend();
    });
  }

  // Global Chip Click Handler
  window.askOpticalAI = function (promptText) {
    const consoleSection = document.getElementById('optical-ai-console');
    if (consoleSection) {
      consoleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      handleConsoleSend(promptText);
    } else {
      if (modal) {
        modal.classList.add('open');
        handleModalSend(promptText);
      }
    }
  };

  // Launch Drawer Button in Nav
  window.openOpticalAIDrawer = function () {
    if (modal) {
      modal.classList.add('open');
      if (modalInput) modalInput.focus();
    }
  };
})();
