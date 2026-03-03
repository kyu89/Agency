function setupTestimonialsCarousel(){
    const carousel = document.getElementById('testimonialCarousel');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const nextBtn = carousel.querySelector('.carousel-button.next');
    const prevBtn = carousel.querySelector('.carousel-button.prev');
    let current = 0;
    function goTo(index){
        track.style.transform = `translateX(-${index * 100}%)`;
        current = index;
    }
    if(nextBtn){
        nextBtn.addEventListener('click', ()=>{ goTo((current + 1) % slides.length); resetAuto(); });
    }
    if(prevBtn){
        prevBtn.addEventListener('click', ()=>{ goTo((current - 1 + slides.length) % slides.length); resetAuto(); });
    }
    let auto = setInterval(()=>{ goTo((current + 1) % slides.length); }, 4000);
    function resetAuto(){ clearInterval(auto); auto = setInterval(()=>{ goTo((current + 1) % slides.length); }, 4000); }
}

const scrollButton = document.querySelector('.scroll-button');
window.addEventListener('scroll', () => {
    if (window.scrollY > 800) {
        scrollButton.style.display = 'flex';
    } else {
        scrollButton.style.display = 'none';
    }
});
scrollButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

