fetch("/section-html/about.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("about").innerHTML = data;
    });

fetch("/section-html/services.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("services").innerHTML = data;
    });
fetch("/section-html/testimonials.html")
.then(response => response.text())
.then(data => {
    document.getElementById("testimonials").innerHTML = data;
    setupTestimonialsCarousel();
});
fetch("/section-html/cta.html")
.then(response => response.text())
.then(data => {
    document.getElementById("cta").innerHTML = data;
});
fetch("/section-html/footer.html")
.then(response => response.text())
.then(data => {
    document.getElementById("footer").innerHTML = data;
});
fetch("/section-html/header.html")
.then(response => response.text())
.then(data => {
    document.getElementById("header").innerHTML = data;
    setupHeaderNav();
});

function navigationColor(){
    const navigation = document.querySelector('.nav-bar');
    if (!navigation) return;
    window.addEventListener('scroll', function() {
        if (window.scrollY > 80) {
            navigation.style.background = '#0c0c0caa';
        }else{
            navigation.style.background = 'transparent';
        }
    });
}

function setupHeaderNav(){
    const hamburger = document.getElementById('hamburger');
    const navigation = document.getElementById('navigation');
    const cName = document.getElementById('company-name');
    if (!hamburger || !navigation || !cName) return;

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navigation.classList.toggle('active');
    });

    const navLinks = navigation.querySelectorAll('a');
    // set active link based on current page path (so cross-page highlighting works)
    (function setActiveFromPath(){
        try{
            const path = (window.location.pathname || '').toLowerCase();
            let pageKey = '';
            if(path.includes('about-page')) pageKey = 'about';
            else if(path.includes('services-page')) pageKey = 'services';
            else if(path.includes('index.html') || path === '/' || path === '') pageKey = 'home';
            else if(path.includes('contact')) pageKey = 'contact us';

            if(pageKey){
                navLinks.forEach(l => {
                    const text = (l.textContent || '').trim().toLowerCase();
                    if(text === pageKey) l.classList.add('active');
                    else l.classList.remove('active');
                });
            }
        }catch(e){ /* fail silently */ }
    })();
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            hamburger.classList.remove('active');
            navigation.classList.remove('active');
            const text = (this.textContent || '').trim().toLowerCase();
            if (text === 'about') {
                e.preventDefault();
                cName.style.color = '#ff4b2b';
                window.location.href = '/pages-html/about-page.html';      
            } else if (text === 'home') {
                e.preventDefault();
                window.location.href = '/index.html';
            } else if (text === 'services') {
                e.preventDefault();
                window.location.href = '/pages-html/services-page.html';
            }
        });
    });
    (function updateCompanyColour(){
        if (window.location.pathname.includes('/pages-html/about-page.html')) {
            cName.style.color = '#ff4b2b';
            navLinks.forEach(link => {
                link.style.color = '#ff4b2b';
            });
        } else {
            cName.style.color = ''; // reset to stylesheet default
        }
    })();
    navigationColor();
}
    


