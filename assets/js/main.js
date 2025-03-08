/**
 * CableHunt — Core UI Controller, Executive Contact Dispatch & Legal/Roadmap Modal Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.site-header') || document.getElementById('main-navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle') || document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('primary-nav-menu') || document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id], header[id]');

    window.closeMobileNav = () => {
        if (navMenu) {
            navMenu.classList.remove('open');
            navMenu.classList.remove('active');
        }
        if (mobileMenuBtn) {
            mobileMenuBtn.classList.remove('active');
        }
    };

    // 1. Navbar Glass Effect & Scroll-Spy
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        let currentSection = '';
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop - 140;
            const sectionHeight = sec.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // 2. Mobile Hamburger Menu Toggle
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                window.closeMobileNav();
            });
        });
    }
});

// 3. Executive Contact Form Dispatch (Reference Ticket + Direct Mailto to @cablehunt.co.uk)
window.submitCableHuntEnquiry = (event) => {
    event.preventDefault();
    const form = event.target;
    const name = (form.querySelector('#contact-name')?.value || 'Optical Partner').trim();
    const org = (form.querySelector('#contact-org')?.value || 'Enterprise Network').trim();
    const email = (form.querySelector('#contact-email')?.value || '').trim();
    const topic = (form.querySelector('#contact-topic')?.value || 'Technical & Pilot Enquiry').trim();
    const message = (form.querySelector('#contact-message')?.value || '').trim();

    const ticketNum = 'CH-UK-2026-' + Math.floor(1000 + Math.random() * 9000);
    const feedbackContainer = document.getElementById('contact-ticket-confirmation');

    const mailSubject = encodeURIComponent(`[${ticketNum}] ${topic} — ${name} (${org})`);
    const mailBody = encodeURIComponent(
        `Reference Ticket: ${ticketNum}\n` +
        `Sender Name: ${name}\n` +
        `Organisation: ${org}\n` +
        `Sender Email: ${email}\n` +
        `Primary Area of Interest: ${topic}\n` +
        (message ? `Additional Notes:\n${message}\n` : '') +
        `\n---\nDispatched via cablehunt.co.uk Official Portal`
    );
    const mailtoUrl = `mailto:info@cablehunt.co.uk?cc=saleem@cablehunt.co.uk,jalal@cablehunt.co.uk,batoul@cablehunt.co.uk&subject=${mailSubject}&body=${mailBody}`;

    if (feedbackContainer) {
        feedbackContainer.style.display = 'block';
        feedbackContainer.innerHTML = `
            <div style="padding: 20px; border-radius: 10px; background: rgba(16, 185, 129, 0.09); border: 1px solid rgba(16, 185, 129, 0.35); margin-top: 18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
                    <span style="font-family: var(--font-mono); font-size: 0.8rem; color: #10B981; font-weight: 700;">
                        ✔ DISPATCH LOGGED // REF TICKET: ${ticketNum}
                    </span>
                    <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--ch-orange);">
                        SLA: &lt; 24h UK Engineering Desk
                    </span>
                </div>
                <p style="font-size: 0.88rem; color: #E5E7EB; line-height: 1.6; margin-bottom: 14px;">
                    Thank you, <strong>${name.replace(/</g, '&lt;')}</strong> (<em>${org.replace(/</g, '&lt;')}</em>). Your request regarding <strong>${topic.replace(/</g, '&lt;')}</strong> has been logged for our Mayfair &amp; Birmingham desks (<strong>info@cablehunt.co.uk</strong>, <strong>saleem@cablehunt.co.uk</strong>, <strong>jalal@cablehunt.co.uk</strong>, and <strong>batoul@cablehunt.co.uk</strong>).
                </p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="text-decoration:none;">
                        Open Direct Email Dispatch (.SOR Trace Ready) &rarr;
                    </a>
                    <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('contact-ticket-confirmation').style.display='none';">
                        Dismiss
                    </button>
                </div>
            </div>
        `;
    }

    form.reset();
};

// 4. Legal, Privacy & Open-Release Roadmap Modal Controller
const legalModalContent = {
    privacy: {
        badge: 'UK GDPR & DATA PROTECTION ACT 2018',
        title: 'Privacy Policy & Optical Telemetry Governance',
        body: `
            <p style="margin-bottom:12px;"><strong>1. Data Controller &amp; UK Jurisdiction:</strong> CableHunt Networks Limited (Company No. 16093071, operating via <code>cablehunt.co.uk</code> at 3rd Floor, 45 Albemarle Street, Mayfair, London, W1S 4JL) processes corporate contact records and optical testbed telemetry in strict accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
            <p style="margin-bottom:12px;"><strong>2. Optical Telemetry &amp; .SOR Trace Confidentiality:</strong> All Bellcore <code>.SOR</code> reflectometry traces, DWDM spectral logs, and duct coordinates shared with our Birmingham engineering facility are isolated under strict non-disclosure protocols.</p>
            <p style="margin-bottom:12px;"><strong>3. Direct Executive Routing:</strong> Inbound submissions are routed exclusively to our authorised UK leadership desks (<code>info@cablehunt.co.uk</code>, <code>saleem@cablehunt.co.uk</code>, <code>jalal@cablehunt.co.uk</code>, and <code>batoul@cablehunt.co.uk</code>).</p>
        `
    },
    terms: {
        badge: 'INTELLECTUAL PROPERTY & TWO-STAGE OPEN ROADMAP',
        title: 'Terms of Service, Software (2027) & Smart AI Model (2029)',
        body: `
            <p style="margin-bottom:12px;"><strong>1. Private Evaluation Licence:</strong> All source code, 12-bit DSP schematics, and interactive visualisations published on <code>cablehunt.co.uk</code> and <a href="https://github.com/sassil70/cablehunt" target="_blank" style="color:#f7941d;">github.com/sassil70/cablehunt</a> are licensed for private technical evaluation and academic inspection only. Commercial redistribution is prohibited prior to our scheduled open milestones.</p>
            <p style="margin-bottom:12px;"><strong>2. Stage 1 — Open-Source Software Stack (September 2027):</strong> Following completion of UK/PCT patent prosecution and Birmingham 80km G.652.D carrier benchmarking, the core Python acquisition software, <code>.SOR</code> parser, and Netmiko automation drivers will become Open-Source in <strong>September 2027</strong>.</p>
            <p style="margin-bottom:12px;"><strong>3. Stage 2 — Smart Optical AI Model on Hugging Face (2029):</strong> The pre-trained weights and physics-informed 1D-CNN/Transformer optical foundation model hosted at <a href="https://huggingface.co/sassil70/cablehunt-optical-ai" target="_blank" style="color:#10b981;">huggingface.co/sassil70/cablehunt-optical-ai</a> are scheduled for open public release in <strong>2029</strong>, following multi-year UK Telecoms Security Act (TSA) Critical National Infrastructure safety verification.</p>
        `
    }
};

window.openLegalModal = (type, event) => {
    if (event) event.preventDefault();
    const modal = document.getElementById('ch-legal-modal');
    const data = legalModalContent[type] || legalModalContent.terms;
    if (!modal) return;

    document.getElementById('ch-modal-badge').textContent = data.badge;
    document.getElementById('ch-modal-title').textContent = data.title;
    document.getElementById('ch-modal-body').innerHTML = data.body;
    modal.style.display = 'flex';
};

window.closeLegalModal = () => {
    const modal = document.getElementById('ch-legal-modal');
    if (modal) modal.style.display = 'none';
};
