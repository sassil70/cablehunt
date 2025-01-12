/**
 * CableHunt Networks Limited - Main UI Controller
 * Handles navigation states, smooth scrolling, animated counters, and interactive tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header Sticky & Scroll Class
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.closeMobileNav = function () {
    if (navMenu) navMenu.classList.remove('open');
    if (mobileToggle) mobileToggle.classList.remove('active');
  };

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
    });
  }

  // 3. Smooth Anchor Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        window.closeMobileNav();
      }
    });
  });

  // 4. Animated Counters on Scroll
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const speed = 200;

  const countUp = (counter) => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText.replace(/[^0-9.]/g, '');
    const inc = target / speed;

    if (count < target) {
      const current = Math.ceil(count + inc);
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.innerText = `${prefix}${current}${suffix}`;
      setTimeout(() => countUp(counter), 20);
    } else {
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      counter.innerText = `${prefix}${target}${suffix}`;
    }
  };

  const observerOptions = { threshold: 0.5 };
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(c => observer.observe(c));

  // 5. Research Tabs Toggle
  window.switchResearchTab = function (tabId) {
    document.querySelectorAll('.research-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.research-tab-content').forEach(content => content.classList.remove('active'));

    const activeBtn = document.querySelector(`.research-tab-btn[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(`tab-${tabId}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
  };
});
