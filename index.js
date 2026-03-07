// ────────────────────────────────────────────────
// 1. Scroll-to-Top Button
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// 3. Typewriter Effect
// ────────────────────────────────────────────────
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
  cursor.textContent = '|';
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

// Start after page load (or when section becomes visible)
window.addEventListener('load', initTypewriter);
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

    // Handle resize → recalculate layout
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            currentIndex = Math.min(currentIndex, cards.length - getCardsPerView());
            updateSlide();
            updateButtonStates();
        }, 150);
    });

    // Initialize
    updateSlide();
    updateButtonStates();
}