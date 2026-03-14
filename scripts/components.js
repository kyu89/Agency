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