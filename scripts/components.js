const scrollButton = document.querySelector('.scroll-button');
if (scrollButton) {
  const toggleScrollButton = () => {
    scrollButton.style.display = window.scrollY > 800 ? 'flex' : 'none';
  };

  window.addEventListener('scroll', toggleScrollButton);
  scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initial check (in case page is already scrolled)
  toggleScrollButton();
}

// Alternative: use IntersectionObserver if it's lower on page
function setupTestimonialsCarousel() {
    const carousel = document.querySelector('#testimonialCarousel');
    if (!carousel) {
        console.warn('Carousel container not found');
        return;
    }

    const track = carousel.querySelector('.carousel-track');
    const cards = carousel.querySelectorAll('.carousel-card');
    const prevBtn = carousel.querySelector('.carousel-button.prev');
    const nextBtn = carousel.querySelector('.carousel-button.next');

    let currentIndex = 0;

    function getCardWidthWithGap() {
        if (cards.length === 0) return 0;
        const cardWidth = cards[0].offsetWidth;
        // Calculate the gap from CSS custom property or computed style
        const trackStyle = window.getComputedStyle(track);
        const gapValue = trackStyle.gap || '1.5rem';
        // Convert rem to pixels (assuming 1rem = 16px)
        const gap = gapValue.includes('rem') ? parseFloat(gapValue) * 16 : parseFloat(gapValue);
        return cardWidth + gap;
    }

    function getCardsPerView() {
        const width = window.innerWidth;
        if (width >= 1200) return 2;
        if (width >= 768) return 1;
        return 1;
    }

    function updateSlide() {
        if (!track || cards.length === 0) return;
        const slideAmount = currentIndex * getCardWidthWithGap();
        track.style.transform = `translateX(-${slideAmount}px)`;
    }

    function updateButtonStates() {
        if (!prevBtn || !nextBtn) return;
        const maxIndex = cards.length - getCardsPerView();
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= maxIndex;
        // Optional: visual feedback
        prevBtn.style.opacity = currentIndex <= 0 ? '0.4' : '1';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
    }

    function goToNext() {
        const maxIndex = cards.length - getCardsPerView();
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlide();
            updateButtonStates();
        }
    }

    function goToPrev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlide();
            updateButtonStates();
        }
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', goToPrev);
    if (nextBtn) nextBtn.addEventListener('click', goToNext);

    let startX = 0;
let endX = 0;
let isSwiping = false;

track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
});

track.addEventListener("touchmove", (e) => {
    if (!isSwiping) return;
    endX = e.touches[0].clientX;
});

track.addEventListener("touchend", () => {
    if (!isSwiping) return;

    const threshold = 30; // minimum swipe distance

    if (startX - endX > threshold) {
        // 👉 swipe left
        goToNext();
    } else if (endX - startX > threshold) {
        // 👉 swipe right
        goToPrev();
    }

    isSwiping = false;

    if (track.children.length <= 1) return;
});
    // Handle resize → recalculate layout
    let resizeTimeout;
 window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {

        const maxIndex = cards.length - getCardsPerView();

        // 🔥 FIX: keep index within valid range
        currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

        updateSlide();
        updateButtonStates();

    }, 150);
});

    // Initialize
    updateSlide();
    updateButtonStates();
}

// ================================================================
// TYPEWRITER EFFECT (unchanged as requested)
// ================================================================

function initTypewriter() {
  const heading = document.getElementById('typing-heading');
  if (!heading) return;

  // Prevent running multiple times
  if (heading.dataset.typed) return;
  heading.dataset.typed = 'true';

  const text = heading.textContent.trim();
  heading.textContent = ''; // clear original text

  // Create cursor
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '';
  heading.appendChild(cursor);

  let i = 0;
  const speed = 50;           // ms per character

  function type() {
    if (i < text.length) {
      const char = document.createTextNode(text[i]);
      heading.insertBefore(char, cursor);
      i++;
      setTimeout(type, speed);
    } else {
      // Optional: keep blinking cursor or remove it
      // cursor.classList.add('blink-slow');
      // or
      setTimeout(() => cursor.remove(), 2000);
    }
  }

  // Small delay before starting
  setTimeout(type, 400);
}

// ================================================================
// FAQ ACCORDION
// ================================================================

/**
 * Initializes FAQ accordion behavior
 * @param {string} containerSelector - Selector for the container of FAQ items
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.allowMultiple=false] - Allow multiple items open at once
 * @param {string} [options.activeClass='active'] - Class name for open items
 */
function initFaqAccordion(containerSelector, options = {}) {
  const {
    allowMultiple = false,
    activeClass   = 'active'
  } = options;

  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`FAQ container not found: ${containerSelector}`);
    return;
  }

  const questions = container.querySelectorAll('.faq-question');

  // ── Core toggle logic ───────────────────────────────────────
  function toggleItem(questionBtn) {
    const item     = questionBtn.closest('.faq-item');
    const answerId = questionBtn.getAttribute('aria-controls');
    const answer   = document.getElementById(answerId);
    const question = document.getElementById('faq-question');
    if (!answer) return;

    const isOpen = questionBtn.getAttribute('aria-expanded') === 'true';

    // Close others (unless multiple allowed)
    if (!allowMultiple) {
      questions.forEach(otherBtn => {
        if (otherBtn === questionBtn) return;
        closeItem(otherBtn);
      });
    }

    // Toggle current item
    const shouldOpen = !isOpen;
    questionBtn.setAttribute('aria-expanded', shouldOpen);
    item.classList.toggle(activeClass, shouldOpen);

    if (shouldOpen) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    } else {
      answer.style.maxHeight = 0;
    }
  }

  function closeItem(questionBtn) {
    const item   = questionBtn.closest('.faq-item');
    const answer = document.getElementById(questionBtn.getAttribute('aria-controls'));
    if (!answer) return;

    questionBtn.setAttribute('aria-expanded', 'false');
    item.classList.remove(activeClass);
    answer.style.maxHeight = null;
  }

  // ── Event listeners ─────────────────────────────────────────
  questions.forEach(question => {
    // Click
    question.addEventListener('click', () => {
      console.log('FAQ question clicked:', question.textContent.trim());
      toggleItem(question);
    });

    // Keyboard accessibility (Enter / Space)
    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        console.log('FAQ question keyboard activated:', question.textContent.trim());
        toggleItem(question);
      }
    });
  });

  // ── Initialization feedback ────────────────────────────────
  console.log(`FAQ Accordion initialized (${questions.length} items)`);
}

// ================================================================
// Initialize features when DOM is ready
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  // FAQ Accordion
  initFaqAccordion('#faqList', {
    allowMultiple: false,    // ← change to true for independent open/close
    activeClass: 'active'
  });

  // Typewriter (you can also move this here instead of window.load if preferred)
  // initTypewriter();
});

// Optional: if you prefer to start typewriter on load (as originally)
window.addEventListener('load', initTypewriter);

// Auto-growing textarea
document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('message');
    
    if (textarea) {
        function autoGrow() {
            textarea.style.height = 'auto';           // reset height
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        // Run when user types
        textarea.addEventListener('input', autoGrow);

        // Also run once on page load (in case of pre-filled text)
        autoGrow();
    }
});

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "goToBooking") {
    window.location.href = "../pages-html/booking.html";
  }
  else if(e.target && e.target.id === "goToServices"){
    window.location.href = "../pages-html/services-page.html"
  }
});

function loadPrivacyModal() {
  const modalHTML = `
    <div id="privacyModal" class="privacy-modal">
      <div class="privacy-content">

        <div class="privacy-header">
          <h2>Privacy Policy</h2>
          <span id="closePrivacy">&times;</span>
        </div>

        <div class="privacy-body">
          <p><strong>Agency</strong> values your privacy. We collect basic information such as your name, email, and project details to match you with the right professionals.</p>

          <h4>How We Use Data</h4>
          <ul>
            <li>Match you with freelancers</li>
            <li>Communicate with you</li>
            <li>Improve our services</li>
          </ul>

          <h4>Data Protection</h4>
          <p>Your data is securely stored and never sold.</p>
        </div>

        <div class="privacy-footer">
          <button id="acceptPrivacy">Accept</button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

  loadPrivacyModal();

  setTimeout(() => {
  const modal = document.getElementById("privacyModal");
  const closeBtn = document.getElementById("closePrivacy");
  const acceptBtn = document.getElementById("acceptPrivacy");

  if (!modal) return;

  // Show on first visit
  if (!localStorage.getItem("privacyAccepted")) {
    modal.style.display = "flex";
  }

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  acceptBtn.onclick = () => {
    localStorage.setItem("privacyAccepted", "true");
    modal.style.display = "none";
  };
}, 100);

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "openPrivacy") {
    e.preventDefault();
    const modal = document.getElementById("privacyModal");
    if (modal) modal.style.display = "flex";
  }
});