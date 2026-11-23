/**
 * Main Interactive Script for CDTI Mini-Conference Website
 * 300-1412 Seminar in CPE - Chitralada Technology Institute
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSmoothScroll();
  initScheduleTabs();
  initAccordions();
  initModals();
  initBackToTop();
  hydrateDataBindings();
});

/**
 * Mobile Navigation Menu & Dropdown Handlers
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('mobile-open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
      toggleBtn.innerHTML = isOpen ? '✕' : '☰';
    });
  }

  // Handle dropdown on touch / mobile devices
  const dropdownItems = document.querySelectorAll('.nav-item.has-dropdown');
  dropdownItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('dropdown-open');
        }
      });
    }
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu && navMenu.classList.contains('mobile-open')) {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove('mobile-open');
        if (toggleBtn) toggleBtn.innerHTML = '☰';
      }
    }
  });
}

/**
 * Smooth Scrolling for Anchor Links & ScrollSpy
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        const navMenu = document.querySelector('.nav-menu');
        const toggleBtn = document.querySelector('.mobile-toggle');
        if (navMenu && navMenu.classList.contains('mobile-open')) {
          navMenu.classList.remove('mobile-open');
          if (toggleBtn) toggleBtn.innerHTML = '☰';
        }
      }
    });
  });

  // ScrollSpy for one-page navigation
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 120;
        const sectionId = current.getAttribute('id');
        const correspondingLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (correspondingLink) {
          if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            correspondingLink.classList.add('active');
          } else {
            correspondingLink.classList.remove('active');
          }
        }
      });
    }, { passive: true });
  }
}

/**
 * Schedule Tab Filtering (ecti-fit style)
 */
function initScheduleTabs() {
  const tabButtons = document.querySelectorAll('.schedule-tabs .tab-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  if (tabButtons.length === 0) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      tabButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.getAttribute('data-filter') || 'all';

      timelineItems.forEach(item => {
        const sessionType = item.getAttribute('data-type');
        if (filter === 'all') {
          item.style.display = 'block';
        } else if (filter === 'morning') {
          // Morning sessions (time starts with 08, 09, 10, 11)
          const time = item.querySelector('.session-time')?.textContent || '';
          if (time.includes('08:') || time.includes('09:') || time.includes('10:') || time.includes('11:')) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        } else if (filter === 'afternoon') {
          // Afternoon sessions (time starts with 12, 13, 14, 15, 16)
          const time = item.querySelector('.session-time')?.textContent || '';
          if (time.includes('12:') || time.includes('13:') || time.includes('14:') || time.includes('15:') || time.includes('16:')) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        } else if (filter === 'oral') {
          item.style.display = (sessionType === 'oral') ? 'block' : 'none';
        } else if (filter === 'poster') {
          item.style.display = (sessionType === 'poster') ? 'block' : 'none';
        }
      });
    });
  });
}

/**
 * Collapsible Accordions for 6 Organizing Teams
 */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const content = this.nextElementSibling;
      const isOpen = this.classList.contains('active');

      // Toggle this item
      if (isOpen) {
        this.classList.remove('active');
        content.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
      } else {
        this.classList.add('active');
        content.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Open first accordion by default if present
  if (accordionHeaders.length > 0) {
    accordionHeaders[0].classList.add('active');
    const firstContent = accordionHeaders[0].nextElementSibling;
    if (firstContent) {
      firstContent.classList.add('open');
      accordionHeaders[0].setAttribute('aria-expanded', 'true');
    }
  }
}

/**
 * Interactive Modals (Submission, Registration, Guidelines)
 */
function initModals() {
  // Open modal buttons
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetModalId = trigger.getAttribute('data-modal-target');
      const targetModal = document.getElementById(targetModalId);
      if (targetModal) {
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close buttons
  const closeButtons = document.querySelectorAll('.modal-close-btn, [data-modal-close]');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Close on backdrop click
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // Handle mock submission form
  const submissionForm = document.getElementById('mockSubmissionForm');
  if (submissionForm) {
    submissionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('paperTitle')?.value || '[Paper Title]';
      const author = document.getElementById('paperAuthor')?.value || '[Author Name]';
      const track = document.getElementById('paperTrack')?.value || 'Track 1';

      showToast(`ส่งบทความ "${title.substring(0, 24)}..." เรียบร้อยแล้ว (จำลองระบบทดสอบ)`);
      submissionForm.reset();

      const modal = submissionForm.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle mock registration form
  const registrationForm = document.getElementById('mockRegistrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName')?.value || 'Participant';
      showToast(`ลงทะเบียนสำเร็จสำหรับคุณ ${name} (รหัสจำลอง: CDTI-2025-${Math.floor(1000 + Math.random() * 9000)})`);
      registrationForm.reset();

      const modal = registrationForm.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Handle contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('ส่งข้อความสอบถามถึงทีมงานสัมมนาเรียบร้อยแล้ว');
      contactForm.reset();
    });
  }
}

/**
 * Toast Notification Utility
 */
function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = `toast-notice ${type}`;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
window.showToast = showToast;

/**
 * Back to Top Button
 */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Central Data Hydration:
 * Automatically reads window.CONFERENCE_DATA and populates [data-bind] attributes
 * if present. This allows non-coders to edit only conference-data.js!
 */
function hydrateDataBindings() {
  if (typeof window.CONFERENCE_DATA === 'undefined') return;
  const data = window.CONFERENCE_DATA;

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
  };

  const bindElements = document.querySelectorAll('[data-bind]');
  bindElements.forEach(el => {
    const key = el.getAttribute('data-bind');
    const val = getNestedValue(data, key);
    if (val !== undefined && val !== null) {
      el.textContent = val;
    }
  });

  const bindLinks = document.querySelectorAll('[data-bind-href]');
  bindLinks.forEach(el => {
    const key = el.getAttribute('data-bind-href');
    const val = getNestedValue(data, key);
    if (val !== undefined && val !== null) {
      el.setAttribute('href', val);
    }
  });
}
