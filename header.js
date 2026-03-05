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
    const cName = document.getElementById('company-name');
    const navigation = document.querySelector('.nav-bar');
    const navLinks = navigation ? navigation.querySelectorAll('a') : [];

    if (!navigation) return;

    function updateNav() {
        const isAbout = window.location.pathname.includes('/pages-html/about-page.html');
        const scrolled = window.scrollY > 80;

        if (scrolled) {
            navigation.style.background = '#0c0c0caa';
            if (isAbout) {
                cName.style.color = '#e5e7eb';
                navLinks.forEach(link => {
                    link.style.color = '#e5e7eb';
                });
            }
        } else {
            navigation.style.background = 'transparent';
            if (isAbout) {
                cName.style.color = '#007e76';
                navLinks.forEach(link => {
                    link.style.color = '#007e76';
                });
            }
        }
    }
    updateNav();
    window.addEventListener('scroll', updateNav);
}

function setupHeaderNav(){
    const hamburger = document.getElementById('hamburger');
    const navigation = document.getElementById('navigation');
    const cName = document.getElementById('company-name');
    const getStarted = document.getElementById('get-started');
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
                cName.style.color = '#007e76';
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
        const isAboutPage = window.location.pathname.includes('/pages-html/about-page.html');
        if (isAboutPage) {
            cName.style.color = '#007e76';
            navLinks.forEach(link => {
                link.style.color = '#007e76';
            });
            if (getStarted) {
                const gsLink = getStarted.querySelector('a');
                if (gsLink) {
                    // clear any inline color so CSS hover styles apply normally
                    gsLink.style.color = '';
                    gsLink.addEventListener('mouseover', () => {
                        gsLink.style.color = '#e5e7eb';
                    });
                    gsLink.addEventListener('mouseout', () => {
                        gsLink.style.color = '';
                    });
                }
            }
        } else {
            cName.style.color = '';
            if (getStarted) {
                const gsLink = getStarted.querySelector('a');
                if (gsLink) {
                    gsLink.style.color = '';
                    gsLink.removeEventListener('mouseover', () => {});
                    gsLink.removeEventListener('mouseout', () => {});
                }
            }
        }
    })();
    navigationColor();
}



