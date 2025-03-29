/**
 * CableHunt — Hybrid Optical Engineering AI Agent (Gemini 2.5 Flash + Built-In Bilingual Optical DSP & Support Knowledge Core)
 * Powers both the Centerpiece AI Console (#optical-ai-console) and the Floating AI Drawer (#ai-chat-modal).
 */

const RAW_GEMINI_KEY = (typeof window !== 'undefined' && window.CABLEHUNT_CONFIG && window.CABLEHUNT_CONFIG.GEMINI_API_KEY)
    ? window.CABLEHUNT_CONFIG.GEMINI_API_KEY.trim()
    : "";

// Only call generativelanguage.googleapis.com if key is a valid AIza... Google AI Studio browser key
const GEMINI_API_KEY = RAW_GEMINI_KEY.startsWith("AIza") ? RAW_GEMINI_KEY : "";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const CABLEHUNT_SYSTEM_PROMPT = `
You are the Official CableHunt Autonomous Optical AI & Customer Support Agent (powered by Gemini 2.5 Flash).
You represent CableHunt Networks Limited (https://cablehunt.co.uk), a British deep-tech optical telemetry and autonomous network remediation company headquartered in Mayfair, London with an 80km optical R&D testbed in Birmingham, United Kingdom.
Respond in the language the user writes in (British English or Arabic). Keep your tone articulate, grounded British engineering—clear, helpful, technically rigorous, and concise.

Core Facts:
1. 12-Bit Native ADC Architecture: Legacy OTDRs use 8-bit ADCs (256 vertical levels, ~48.1 dB SNR), burying micro-events in quantization stair-steps. CableHunt uses a 12-bit native ADC (4,096 vertical levels, ~74.0 dB theoretical SNR, 72.2 dB dynamic range with N=1024 hardware Boxcar averaging), providing 16x vertical resolution and <0.8m event dead-zone to detect -0.05 dB splice decay and micro-bends.
2. Brownfield 1G-to-40G Speed Multiplier: Upgrades legacy 1G G.652 single-mode fiber links to 40 Gbps using dynamic chromatic dispersion compensation (~16.8 ps/(nm·km)) and C-Band DWDM (4x10G or 40G QSFP28/SFP+), bypassing civil excavation (£70k–£140k/km) and saving up to 96% CapEx.
3. Hardware & 400x Optical Lens: Integrates dual-domain TDR/OTDR, an InGaAs PIN-TIA detector across O, E, S, C, L, and U bands (1260nm–1675nm), Computer Vision 400x ferrule/jacket defect scanning lens, RF over Fiber (RFOF), and a 2,500 Vrms Floating-Ground galvanic isolation barrier.
4. Closed-Loop Automation: A 1D-CNN model classifies .SOR and raw 12-bit waveforms with >98% precision and triggers autonomous BGP/MPLS or wavelength protection switching in <50ms (38.4ms average) via Netmiko across Cisco IOS-XR, MikroTik RouterOS v7, Juniper Junos, and Arista EOS.
5. Two-Stage Open Release Roadmap:
   - Stage 1 (Code — September 2026): Core Python DSP acquisition stack, .SOR parser, and Netmiko drivers published on GitHub (https://github.com/sassil70/cablehunt).
   - Stage 2 (AI Model — 2029): The Smart Optical AI Foundation Model & 1D-CNN weights on Hugging Face (https://huggingface.co/sassil/cablehunt-optical-ai) will be released publicly in 2029 following multi-year UK Telecoms Security Act (TSA) Critical National Infrastructure safety verification.
6. Executive & Engineering Leadership (@cablehunt.co.uk):
   - Batoul Zien Alabdin (Chief Executive Officer — batoul@cablehunt.co.uk)
   - Ahmad Jalal Assil (Chief Operating Officer & Co-Founder — jalal@cablehunt.co.uk)
   - Eng. Saleem Asseel (Lead Scientific Advisor & Systems Architect — saleem@cablehunt.co.uk)
   - Central Enquiries & Support Desk: info@cablehunt.co.uk | Tel: +44 20 78702243
`;

function isArabicText(text) {
    return /[\u0600-\u06FF]/.test(text);
}

function generateSupportEscalationFooter(isAr, query) {
    const cleanQ = encodeURIComponent(query);
    if (isAr) {
        return `<div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-wrap:wrap; gap:8px; align-items:center; font-size:0.78rem;">` +
            `<span style="color:#9ca3af;">التواصل المباشر مع الدعم الهندسي:</span>` +
            `<a href="mailto:info@cablehunt.co.uk?cc=saleem@cablehunt.co.uk,jalal@cablehunt.co.uk,batoul@cablehunt.co.uk&subject=CableHunt%20AI%20Support%20Enquiry&body=${cleanQ}" style="color:#f7941d; font-family:var(--font-mono); text-decoration:none; font-weight:600;">✉ info@cablehunt.co.uk</a>` +
            `<span style="color:#4b5563;">|</span>` +
            `<a href="#contact" onclick="const m=document.getElementById('ai-chat-modal');if(m){m.classList.remove('open');}" style="color:#06b6d4; text-decoration:none; font-weight:600;">فتح تذكرة دعم رسمية &larr;</a>` +
            `</div>`;
    }
    return `<div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-wrap:wrap; gap:10px; align-items:center; font-size:0.78rem;">` +
        `<span style="color:#9ca3af;">Direct UK Support Escalation:</span>` +
        `<a href="mailto:info@cablehunt.co.uk?cc=saleem@cablehunt.co.uk,jalal@cablehunt.co.uk,batoul@cablehunt.co.uk&subject=CableHunt%20Technical%20Support%20Enquiry&body=${cleanQ}" style="color:#f7941d; font-family:var(--font-mono); text-decoration:none; font-weight:600;">✉ info@cablehunt.co.uk</a>` +
        `<span style="color:#4b5563;">|</span>` +
        `<a href="tel:+442078702243" style="color:#10b981; font-family:var(--font-mono); text-decoration:none;">☎ +44 20 78702243</a>` +
        `<span style="color:#4b5563;">|</span>` +
        `<a href="#contact" onclick="const m=document.getElementById('ai-chat-modal');if(m){m.classList.remove('open');}" style="color:#06b6d4; text-decoration:none; font-weight:600;">Log Support Ticket &rarr;</a>` +
        `</div>`;
}

function generateLocalKnowledgeResponse(query) {
    const q = query.toLowerCase();
    const isAr = isArabicText(query);

    // 1. Arabic Queries Support
    if (isAr) {
        if (q.includes('12') || q.includes('8') || q.includes('بت') || q.includes('دقة') || q.includes('عدسة') || q.includes('فحص')) {
            return `<div dir="rtl" style="text-align:right;">` +
                `<strong>الفرق الهندسي بين دقة 12-Bit الأصلية (4,096 مستوى) وأجهزة 8-Bit التقليدية + العدسة البصرية 400x:</strong><br><br>` +
                `تعمل أجهزة OTDR التقليدية بمحوّلات <strong>8-Bit (أي 256 مستوى تكميم فقط)</strong> مما يجعل الأعطال الدقيقة مثل تدهور اللحامات بمقدار <code>-0.08 dB</code> تضيع داخل ضجيج التكميم.<br><br>` +
                `أما جهاز <strong>CableHunt CH-12B</strong> فيعمل بدقة <strong>12-Bit أصلية (4,096 مستوى رأسي — دقة أعلى بـ 16 ضعفاً)</strong> مع متوسط عتادي Boxcar ($N=1024$) ومنطقة ميتة أقل من <code>0.8 متر</code>، بالإضافة إلى <strong>عدسة ميكروسكوب بصري 400x بالذكاء الاصطناعي</strong> لفحص أطراف الكابلات واكتشاف الأعطال قبل 3 أسابيع من انقطاع الخدمة.` +
                generateSupportEscalationFooter(true, query) +
                `</div>`;
        }
        if (q.includes('40') || q.includes('سرعة') || q.includes('حفر') || q.includes('توفير') || q.includes('سعر') || q.includes('تكلف')) {
            return `<div dir="rtl" style="text-align:right;">` +
                `<strong>مضاعف السرعة من 1G إلى 40G دون حفر الشوارع (توفير حتى 96% من التكلفة الرأسمالية CapEx):</strong><br><br>` +
                `يقوم نظام CableHunt بمسح الطيف البصري الكامل ($1260\\text{nm}–1675\\text{nm}$) بدقة 12-Bit لتعويض التشتت اللوني ديناميكياً ($16.8\\text{ ps/(nm}\\cdot\\text{km)}$) وتوزيع قنوات <strong>40G DWDM / QSFP28</strong> فوق الألياف القديمة المزروعة مسبقاً، مما يغني عن أعمال الحفر المدنية المكلفة (£70k–£140k لكل كيلومتر).` +
                generateSupportEscalationFooter(true, query) +
                `</div>`;
        }
        if (q.includes('دعم') || q.includes('تواصل') || q.includes('اتصال') || q.includes('إيميل') || q.includes('اميل') || q.includes('سليم') || q.includes('جلال') || q.includes('بتول') || q.includes('طلب') || q.includes('شراء')) {
            return `<div dir="rtl" style="text-align:right;">` +
                `<strong>مركز الدعم الهندسي والتواصل المباشر — CableHunt Networks UK:</strong><br><br>` +
                `يسعدنا تواصلك المباشر مع مكتبنا التنفيذي في <strong>مايفير - لندن</strong> أو مختبر الأبحاث البصرية (80 كم) في <strong>برمنغهام</strong>:<br>` +
                `• <strong>المكتب المركزي وخدمة العملاء:</strong> <a href="mailto:info@cablehunt.co.uk" style="color:#f7941d;">info@cablehunt.co.uk</a><br>` +
                `• <strong>المهندس سليم أصيل</strong> (المستشار العلمي الرئيسي ومهندس الأنظمة): <a href="mailto:saleem@cablehunt.co.uk" style="color:#06b6d4;">saleem@cablehunt.co.uk</a><br>` +
                `• <strong>أحمد جلال أصيل</strong> (الرئيس التنفيذي للعمليات والشريك المؤسس): <a href="mailto:jalal@cablehunt.co.uk" style="color:#06b6d4;">jalal@cablehunt.co.uk</a><br>` +
                `• <strong>بتول زين العابدين</strong> (الرئيس التنفيذي CEO): <a href="mailto:batoul@cablehunt.co.uk" style="color:#06b6d4;">batoul@cablehunt.co.uk</a><br>` +
                `• <strong>الهاتف المباشر (لندن):</strong> <a href="tel:+442078702243" dir="ltr" style="color:#10b981;">+44 20 78702243</a>` +
                generateSupportEscalationFooter(true, query) +
                `</div>`;
        }
        return `<div dir="rtl" style="text-align:right;">` +
            `<strong>المساعد الذكي الرسمي لشركة CableHunt Networks (لندن - برمنغهام):</strong><br><br>` +
            `بخصوص استفسارك: <em>"${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</em> — توفر منظومة CableHunt تشخيصاً بصرياً بدقة <strong>12-Bit أصلية (4,096 مستوى، مدى ديناميكي 72.2 dB)</strong> مع <strong>مضاعفة سرعة الألياف من 1G إلى 40G دون حفر</strong>، وتحويل مسار الشبكة تلقائياً في <strong>أقل من 50 ملي ثانية (38.4ms)</strong> عبر Netmiko.<br><br>` +
            `• <strong>المرحلة الأولى (سبتمبر 2026):</strong> نشر الكود البرمجي ومحلل ملفات <code>.SOR</code> على <a href="https://github.com/sassil70/cablehunt" target="_blank" style="color:#f7941d;">GitHub (Sept 2026)</a>.<br>` +
            `• <strong>المرحلة الثانية (عام 2029):</strong> الإطلاق المفتوح لأوزان الموديل الذكي على <a href="https://huggingface.co/sassil/cablehunt-optical-ai" target="_blank" style="color:#10b981;">Hugging Face (2029 Release)</a>.` +
            generateSupportEscalationFooter(true, query) +
            `</div>`;
    }

    // 2. English Queries Support
    if (q.includes('12-bit') || q.includes('8-bit') || q.includes('adc') || q.includes('quantiz') || q.includes('mathematical') || q.includes('4096')) {
        return `<strong>12-Bit Native vs. 8-Bit Quantisation Mathematics:</strong><br><br>` +
            `Conventional field OTDRs operate with <strong>8-bit ADCs (256 vertical quantisation levels)</strong>, limiting theoretical Signal-to-Noise Ratio to <strong>49.9 dB</strong> (~48.1 dB effective). At 256 levels, a subtle <strong>-0.08 dB fusion splice decay</strong> or early macrobend falls inside a single quantisation stair-step and is indistinguishable from thermal noise.<br><br>` +
            `CableHunt’s digitiser samples Rayleigh backscatter at <strong>12-bit native resolution (4,096 vertical levels — 16× finer vertical precision)</strong> coupled with hardware Boxcar averaging (N=1024, adding +15 dB processing gain). This yields <strong>72.2 dB effective dynamic range</strong> and an event dead-zone under 0.8 m, enabling our 1D-CNN classifier to identify sub-millivolt degradation up to <strong>3 weeks prior to link failure</strong>.` +
            generateSupportEscalationFooter(false, query);
    }

    if (q.includes('40g') || q.includes('1g') || q.includes('brownfield') || q.includes('excavation') || q.includes('dwdm') || q.includes('capex') || q.includes('upgrade')) {
        return `<strong>1G-to-40G Brownfield Line-Rate Upgrade (Zero Civil Excavation):</strong><br><br>` +
            `Legacy single-mode G.652 fibres installed across UK metro corridors (London Docklands, Slough, Birmingham) are frequently throttled at <strong>1 Gbps</strong>—not because the silica core is exhausted, but because unmapped micro-bends, water-peak absorption (1383 nm), and chromatic dispersion collapse unconditioned high-baud signals.<br><br>` +
            `CableHunt executes a 12-bit spectral audit across 1260 nm–1675 nm to pinpoint and neutralise exact ODF/splice bottlenecks, pre-compensates chromatic dispersion (~16.8 ps/(nm·km) in C-Band), and allocates <strong>4×10G or 40G QSFP28/SFP+ DWDM channels</strong> over the existing ducted glass—bypassing £70k–£140k/km street trenching and saving up to <strong>96% in CapEx</strong>.` +
            generateSupportEscalationFooter(false, query);
    }

    if (q.includes('50') || q.includes('netmiko') || q.includes('closed-loop') || q.includes('switch') || q.includes('orchestration') || q.includes('reroute')) {
        return `<strong>Sub-50ms Closed-Loop Switch Orchestration via Netmiko:</strong><br><br>` +
            `Rather than waiting for a catastrophic transceiver <code class="font-mono">RX_LOS</code> alarm, CableHunt links Layer-1 optical physics directly to Layer-2/3 switch orchestration.<br><br>` +
            `When our embedded <strong>1D-CNN model</strong> detects a physical macrobend (1625 nm L-Band &gt; 1550 nm C-Band attenuation differential) or DFB laser sag, our edge daemon opens a persistent fast-socket SSH/NETCONF session via <strong>Netmiko / RouterOS v7 REST API</strong> to Cisco IOS-XR, MikroTik CRS, or Arista switches—shifting wavelengths to the bend-resilient O-Band or triggering MPLS/BGP protection switching in <strong>38.4 ms</strong> with zero dropped packets.` +
            generateSupportEscalationFooter(false, query);
    }

    if (q.includes('vision') || q.includes('camera') || q.includes('lens') || q.includes('400x') || q.includes('apparatus') || q.includes('adapt') || q.includes('ferrule') || q.includes('rfof')) {
        return `<strong>400× Computer Vision Optical Lens &amp; Dynamic Parameter Adaptation:</strong><br><br>` +
            `The CableHunt Handheld Unit integrates a <strong>400× coaxial ferrule microscope lens (IEC 61300-3-35)</strong> and an external computer vision module alongside its dual-domain TDR/OTDR and <strong>RF over Fiber (RFOF)</strong> ports.<br><br>` +
            `Before injecting laser pulses, the embedded vision pipeline classifies connector geometry (SC/APC 8° vs FC/UPC), inspects end-face micro-contamination down to 0.5 µm, and reads cable jacket/ODF QR metadata—automatically tuning pulse width (5 ns–20 µs), wavelength band, and 12-bit Boxcar averaging parameters.` +
            generateSupportEscalationFooter(false, query);
    }

    if (q.includes('birmingham') || q.includes('testbed') || q.includes('session') || q.includes('contact') || q.includes('support') || q.includes('ticket') || q.includes('team') || q.includes('saleem') || q.includes('jalal') || q.includes('batoul') || q.includes('order') || q.includes('price') || q.includes('demo')) {
        return `<strong>UK Customer Support, Birmingham R&amp;D Testbed &amp; Executive Desks:</strong><br><br>` +
            `Our hardware-in-the-loop facility in <strong>Birmingham, West Midlands</strong> houses <strong>80 km G.652.D and G.657.A1 fibre characterisation spools</strong>, 12-bit high-speed digitisers, and live Cisco/MikroTik switching fabrics. Our executive office is at <strong>45 Albemarle Street, Mayfair, London</strong>.<br><br>` +
            `Connect directly with our UK leadership and engineering support team:<br>` +
            `• <strong>Central Support &amp; Orders Desk:</strong> <a href="mailto:info@cablehunt.co.uk" style="color:#f7941d;">info@cablehunt.co.uk</a> (Tel: <a href="tel:+442078702243" style="color:#10b981;">+44 20 78702243</a>)<br>` +
            `• <strong>Eng. Saleem Asseel</strong> (Lead Scientific Advisor &amp; Systems Architect): <a href="mailto:saleem@cablehunt.co.uk" style="color:#06b6d4;">saleem@cablehunt.co.uk</a><br>` +
            `• <strong>Ahmad Jalal Assil</strong> (COO &amp; Co-Founder): <a href="mailto:jalal@cablehunt.co.uk" style="color:#06b6d4;">jalal@cablehunt.co.uk</a><br>` +
            `• <strong>Batoul Zien Alabdin</strong> (Chief Executive Officer): <a href="mailto:batoul@cablehunt.co.uk" style="color:#06b6d4;">batoul@cablehunt.co.uk</a>` +
            generateSupportEscalationFooter(false, query);
    }

    if (q.includes('2026') || q.includes('2027') || q.includes('2029') || q.includes('open') || q.includes('hugging') || q.includes('github') || q.includes('model') || q.includes('stage')) {
        return `<strong>Two-Stage Open Release Roadmap (Sept 2026 Software / 2029 Smart AI Model):</strong><br><br>` +
            `• <strong>Stage 1 — September 2026 (Open-Source Software Stack):</strong> Our Python 12-bit DSP acquisition suite, Bellcore <code>.SOR</code> parser, and Netmiko switch automation drivers hosted at <a href="https://github.com/sassil70/cablehunt" target="_blank" style="color:#f7941d;">github.com/sassil70/cablehunt</a> are published under our Stage 1 Open-Source release (September 2026).<br><br>` +
            `• <strong>Stage 2 — 2029 (Smart Optical AI Model on Hugging Face):</strong> Our flagship physics-informed 1D-CNN &amp; spectral prognostics foundation model (<a href="https://huggingface.co/sassil/cablehunt-optical-ai" target="_blank" style="color:#10b981;">huggingface.co/sassil/cablehunt-optical-ai</a>) is confirmed for open public weight release in <strong>2029</strong>, following completion of UK Telecoms Security Act (TSA) Critical National Infrastructure safety audits.` +
            generateSupportEscalationFooter(false, query);
    }

    return `<strong>CableHunt 12-Bit Optical Telemetry &amp; 40G Remediation Analysis:</strong><br><br>` +
        `Regarding <em>"${query.replace(/</g, '&lt;').replace(/>/g, '&gt;')}"</em>: CableHunt unifies <strong>12-bit native ADC reflectometry (4,096 vertical levels, 72.2 dB SNR)</strong> with <strong>400× computer vision inspection</strong>, <strong>adaptive multi-band spectral optimisation (1260 nm–1675 nm)</strong>, and <strong>sub-50ms Netmiko switch orchestration</strong>.<br><br>` +
        `This enables operators to detect -0.05 dB micro-faults invisible to 8-bit OTDRs and upgrade legacy 1G brownfield fibre directly to <strong>40G line rates</strong> without civil excavation. Explore our <a href="https://github.com/sassil70/cablehunt" target="_blank" style="color:#f7941d;">GitHub Repository (Sept 2026)</a> and our <a href="https://huggingface.co/sassil/cablehunt-optical-ai" target="_blank" style="color:#10b981;">Hugging Face Smart Optical AI Model (2029 Release)</a>.` +
        generateSupportEscalationFooter(false, query);
}

async function dispatchQueryToContainer(userQuery, chatContainer) {
    if (!userQuery || !userQuery.trim() || !chatContainer) return;

    const cleanQuery = userQuery.trim();

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble chat-bubble-user';
    userBubble.textContent = cleanQuery;
    chatContainer.appendChild(userBubble);

    // Append thinking bubble
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble chat-bubble-bot';
    loadingBubble.style.fontFamily = 'var(--font-mono)';
    loadingBubble.style.fontSize = '0.84rem';
    loadingBubble.style.color = 'var(--ch-cyan)';
    loadingBubble.innerHTML = `● Running 12-Bit Optical DSP &amp; Neural Telemetry Inference...`;
    chatContainer.appendChild(loadingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (!GEMINI_API_KEY) {
        setTimeout(() => {
            if (loadingBubble.parentNode === chatContainer) {
                chatContainer.removeChild(loadingBubble);
            }
            const botBubble = document.createElement('div');
            botBubble.className = 'chat-bubble chat-bubble-bot';
            botBubble.innerHTML = generateLocalKnowledgeResponse(cleanQuery);
            chatContainer.appendChild(botBubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 280);
        return;
    }

    try {
        const response = await fetch(GEMINI_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: `${CABLEHUNT_SYSTEM_PROMPT}\n\nUser Question: ${cleanQuery}` }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 550
                }
            })
        });

        const data = await response.json();
        if (loadingBubble.parentNode === chatContainer) {
            chatContainer.removeChild(loadingBubble);
        }

        let aiHtml = '';
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            aiHtml = data.candidates[0].content.parts[0].text
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--ch-orange);">$1</strong>')
                .replace(/\n/g, '<br>') + generateSupportEscalationFooter(isArabicText(cleanQuery), cleanQuery);
        } else {
            aiHtml = generateLocalKnowledgeResponse(cleanQuery);
        }

        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble chat-bubble-bot';
        botBubble.innerHTML = aiHtml;
        chatContainer.appendChild(botBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (e) {
        if (loadingBubble.parentNode === chatContainer) {
            chatContainer.removeChild(loadingBubble);
        }
        const fallbackBubble = document.createElement('div');
        fallbackBubble.className = 'chat-bubble chat-bubble-bot';
        fallbackBubble.innerHTML = generateLocalKnowledgeResponse(cleanQuery);
        chatContainer.appendChild(fallbackBubble);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const consoleBody = document.getElementById('console-chat-body');
    const consoleInput = document.getElementById('console-chat-input');
    const consoleSendBtn = document.getElementById('console-send-btn');

    const drawerModal = document.getElementById('ai-chat-modal');
    const drawerTrigger = document.getElementById('ai-widget-trigger');
    const drawerClose = document.getElementById('ai-chat-close');
    const drawerBody = document.getElementById('ai-chat-body');
    const drawerInput = document.getElementById('ai-chat-input');
    const drawerSendBtn = document.getElementById('ai-send-btn');

    // Global function called by Prompt Chips & Navbar "Launch Technical AI" button
    window.askOpticalAI = (promptText) => {
        const consoleSection = document.getElementById('optical-ai-console');
        if (consoleSection && consoleBody) {
            consoleSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dispatchQueryToContainer(promptText, consoleBody);
        } else if (drawerBody && drawerModal) {
            drawerModal.classList.add('open');
            dispatchQueryToContainer(promptText, drawerBody);
        }
    };

    if (consoleSendBtn && consoleInput && consoleBody) {
        consoleSendBtn.addEventListener('click', () => {
            const q = consoleInput.value;
            consoleInput.value = '';
            dispatchQueryToContainer(q, consoleBody);
        });
        consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = consoleInput.value;
                consoleInput.value = '';
                dispatchQueryToContainer(q, consoleBody);
            }
        });
    }

    if (drawerTrigger && drawerModal) {
        drawerTrigger.addEventListener('click', () => {
            drawerModal.classList.toggle('open');
        });
    }

    if (drawerClose && drawerModal) {
        drawerClose.addEventListener('click', () => {
            drawerModal.classList.remove('open');
        });
    }

    if (drawerSendBtn && drawerInput && drawerBody) {
        drawerSendBtn.addEventListener('click', () => {
            const q = drawerInput.value;
            drawerInput.value = '';
            dispatchQueryToContainer(q, drawerBody);
        });
        drawerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const q = drawerInput.value;
                drawerInput.value = '';
                dispatchQueryToContainer(q, drawerBody);
            }
        });
    }
});
