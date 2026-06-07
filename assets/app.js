/* ============================================================
   PROXYM PORTFOLIO CONTROLLER
   Plain JS, offline-safe, performance-conscious.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFormHandler();
  initScrollAnimations();
  initNavPill();
  initActiveSectionObserver();
  initVideoLightbox();
});

/* 1. MOBILE NAVIGATION TOGGLE */
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navHeader = document.getElementById('nav');
  
  if (!toggleBtn || !navLinks) return;

  // Track lines for visual button animation
  const line1 = document.getElementById('nav-line-1');
  const line2 = document.getElementById('nav-line-2');
  const line3 = document.getElementById('nav-line-3');

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('nav__links--open');
    
    // Toggle icon lines to close X shape
    if (!isExpanded) {
      toggleBtn.setAttribute('aria-label', 'Close menu');
      if (line1 && line2 && line3) {
        line1.style.transform = 'translate(4px, 4px) rotate(45deg)';
        line2.style.opacity = '0';
        line3.style.transform = 'translate(4px, -4px) rotate(-45deg)';
      }
    } else {
      toggleBtn.setAttribute('aria-label', 'Open menu');
      if (line1 && line2 && line3) {
        line1.style.transform = 'none';
        line2.style.opacity = '1';
        line3.style.transform = 'none';
      }
    }
  });

  // Close mobile menu when clicking nav links
  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav__link') || e.target.classList.contains('nav__cta')) {
      navLinks.classList.remove('nav__links--open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open menu');
      if (line1 && line2 && line3) {
        line1.style.transform = 'none';
        line2.style.opacity = '1';
        line3.style.transform = 'none';
      }
    }
  });

  // Frosted nav background transition on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navHeader.classList.add('nav--scrolled');
    } else {
      navHeader.classList.remove('nav--scrolled');
    }
  }, { passive: true });
}

/* 2. PROGRESSIVE ENHANCEMENT WEB3FORMS HANDLER */
function initFormHandler() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !statusDiv) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check honeypot bot prevention field
    const honeypot = form.querySelector('.hidden-honeypot');
    if (honeypot && honeypot.checked) {
      statusDiv.className = 'form-status form-status--error';
      statusDiv.textContent = 'Spam validation failed.';
      return;
    }

    // Set submitting loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('btn--loading');
    submitBtn.textContent = 'Sending...';
    statusDiv.className = 'form-status';
    statusDiv.textContent = '';

    const formData = new FormData(form);
    
    // Map to JSON object for api call
    const object = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    const json = JSON.stringify(object);

    // Call Web3Forms API
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
    .then(async (response) => {
      const data = await response.json();
      if (response.status === 200) {
        // Render success state
        statusDiv.className = 'form-status form-status--success';
        statusDiv.textContent = 'Got it. I will be in touch within 24 hours.';
        form.reset();
      } else {
        // Handle API failures
        statusDiv.className = 'form-status form-status--error';
        statusDiv.textContent = data.message || 'Submission failed. Please check your inputs.';
      }
    })
    .catch((error) => {
      // Handle network errors
      statusDiv.className = 'form-status form-status--error';
      statusDiv.textContent = 'Network error. Please email me directly instead.';
    })
    .finally(() => {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.textContent = 'Send it over';
    });
  });
}

/* 3. SCROLL INTERSECTION REVEALS */
function initScrollAnimations() {
  // Honoring prefers-reduced-motion check or dev override
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isRevealForced = window.location.search.includes('reveal=true');
  const reveals = document.querySelectorAll('.js-reveal');

  if (hasReducedMotion || isRevealForced) {
    // Instantly reveal all components if user prefers reduced motion or forced reveal
    reveals.forEach(el => el.classList.add('js-reveal--active'));
    return;
  }

  // Setup intersection observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // fires when 10% of element is visible
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('js-reveal--active');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => {
    revealObserver.observe(el);
  });
}

/* 4. THEATRICAL VIDEO LIGHTBOX MODAL */
function initVideoLightbox() {
  const modal = document.getElementById('video-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.getElementById('modal-close-btn');
  const cards = document.querySelectorAll('.media-card[data-video-id]');

  if (!modal || !modalBody || !closeBtn) return;

  cards.forEach(card => {
    // Make the media aspect container clickable
    const aspect = card.querySelector('.media-aspect');
    if (!aspect) return;

    aspect.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = card.getAttribute('data-video-id');
      const platform = card.getAttribute('data-video-platform');
      const aspectType = card.getAttribute('data-video-aspect');

      if (!videoId) return;

      // Set modal layout class (widescreen vs vertical)
      if (aspectType === 'vertical') {
        modalBody.className = 'video-modal__body video-modal__body--vertical';
      } else {
        modalBody.className = 'video-modal__body';
      }

      // Load dynamic iframe
      let iframeSrc = '';
      if (platform === 'youtube') {
        iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      } else if (platform === 'vimeo') {
        iframeSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&badge=0&byline=0&portrait=0`;
      }

      if (iframeSrc) {
        modalBody.innerHTML = `<iframe src="${iframeSrc}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        modal.showModal();
      }
    });
  });

  // Stop playing video when modal closes (e.g. Esc key or close click)
  const handleClose = () => {
    modalBody.innerHTML = '';
  };

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('close', handleClose);

  // Fallback for browsers without native <dialog closedby> support
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (isDialogContent) return;
      modal.close();
    });
  }
}

/* 5. NAVIGATION SLIDING INDICATOR PILL */
function initNavPill() {
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav__link');
  
  if (!navLinksContainer || navLinks.length === 0) return;

  // Check if pill already exists, if not create it
  let pill = document.getElementById('nav-pill');
  if (!pill) {
    pill = document.createElement('div');
    pill.className = 'nav__pill';
    pill.id = 'nav-pill';
    navLinksContainer.appendChild(pill);
  }

  const positionPill = (element) => {
    const rect = element.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();
    
    const left = rect.left - containerRect.left;
    const width = rect.width;
    
    pill.style.left = `${left}px`;
    pill.style.width = `${width}px`;
    pill.style.opacity = '1';
  };

  // Set initial position based on active link
  const activeLink = document.querySelector('.nav__link.active');
  if (activeLink) {
    setTimeout(() => positionPill(activeLink), 150);
  }

  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
      positionPill(link);
    });

    link.addEventListener('mouseleave', () => {
      const currentActive = document.querySelector('.nav__link.active');
      if (currentActive) {
        positionPill(currentActive);
      } else {
        pill.style.opacity = '0';
        pill.style.width = '0';
      }
    });
  });

  // Reposition pill on window resize
  window.addEventListener('resize', () => {
    const currentActive = document.querySelector('.nav__link.active');
    if (currentActive) {
      positionPill(currentActive);
    }
  }, { passive: true });
}

/* 6. SCROLL SECTION SYNC WITH NAV PILL */
function initActiveSectionObserver() {
  const sections = document.querySelectorAll('section[id], main > span[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const navLinksContainer = document.getElementById('nav-links');
  
  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px', // triggers when section is in upper-mid viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const targetHref = id === 'top' ? '#top' : `#${id}`;

        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === targetHref || (id === 'top' && href === '#work')) { // fallback
            link.classList.add('active');
            
            // Reposition pill to active link
            const pill = document.getElementById('nav-pill');
            if (pill && navLinksContainer) {
              const rect = link.getBoundingClientRect();
              const containerRect = navLinksContainer.getBoundingClientRect();
              const left = rect.left - containerRect.left;
              const width = rect.width;
              
              pill.style.left = `${left}px`;
              pill.style.width = `${width}px`;
              pill.style.opacity = '1';
            }
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}
