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