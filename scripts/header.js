document.addEventListener("DOMContentLoaded", () => {
    const navAlreadyExists = document.querySelector('.nav-bar');

    if (navAlreadyExists) {
        setupHeaderNav();
        navigationColor();
        setupPageTransition();
    } else {
        const observer = new MutationObserver(() => {
            const nav = document.querySelector('.nav-bar');
            if (nav) {
                observer.disconnect(); 
                setupHeaderNav();
                navigationColor();
                setupPageTransition();
            }
        });

        observer.observe(document.getElementById('header') || document.body, {
            childList: true,
            subtree: true
        });
    }
});

function navigationColor() {
    const navigation = document.querySelector('.nav-bar');
    if (!navigation) return;

    const cName = document.getElementById('company-name');
    const navLinks = navigation.querySelectorAll('a');
    const spans = document.querySelectorAll('#hamburger span');

    const path = window.location.pathname.toLowerCase();

    const isSpecialPage =
        path.includes('about') ||
        path.includes('services') ||
        path.includes('contact') ||
        path.includes('book');

    function updateNav() {
        const scrolled = window.scrollY > 80;

        if (scrolled) {
            navigation.classList.add('scrolled');
            if (cName) cName.style.color = '#e5e7eb';
            navLinks.forEach(link => link.style.color = '#e5e7eb');
            spans.forEach(span => span.style.backgroundColor = '#e5e7eb');
        } else {
            navigation.classList.remove('scrolled');

            if (isSpecialPage) {
                if (cName) cName.style.color = '#007e76';
                navLinks.forEach(link => link.style.color = '#007e76');
                spans.forEach(span => span.style.backgroundColor = '#007e76');
            } else {
                if (cName) cName.style.color = '';
                navLinks.forEach(link => link.style.color = '');
                spans.forEach(span => span.style.backgroundColor = '');
            }
        }
    }

    updateNav();
    window.addEventListener('scroll', updateNav);
}

function setupHeaderNav() {
    const hamburger = document.getElementById('hamburger');
    const navigation = document.getElementById('navigation');
    const cName = document.getElementById('company-name');
    const getStarted = document.getElementById('get-started');

    if (!hamburger || !navigation || !cName) return;

    const navLinks = navigation.querySelectorAll('a');
    const spans = document.querySelectorAll('#hamburger span');
    const path = window.location.pathname.toLowerCase();

    const isSpecialPage =
        path.includes('about') ||
        path.includes('services') ||
        path.includes('contact') ||
        path.includes('book');

    (function setActiveFromPath() {
        try {
            let pageKey = '';
            if (path.includes('about'))        pageKey = 'about';
            else if (path.includes('services')) pageKey = 'services';
            else if (path.includes('contact'))  pageKey = 'contact us';
            else if (path.includes('book'))  pageKey = 'book';
            else                                pageKey = 'home';
            navLinks.forEach(l => {
                const text = (l.textContent || '').trim().toLowerCase();
                l.classList.toggle('active', text === pageKey);
            });
        } catch (e) {}
    })();

    if (isSpecialPage) {
        cName.style.color = '#007e76';
        navLinks.forEach(link => link.style.color = '#007e76');
        spans.forEach(span => span.style.backgroundColor = '#007e76');
    }

    if (getStarted) {
        const gsLink = getStarted.querySelector('a');
        if (gsLink) {
            gsLink.addEventListener('mouseover', () => {
                gsLink.style.color = '#e5e7eb';
            });
            gsLink.addEventListener('mouseout', () => {
                gsLink.style.color = isSpecialPage ? '#007e76' : '';
            });
        }
    }
}
    document.addEventListener("click", function (e) {
    const hamburger = e.target.closest("#hamburger");
    const navigation = document.getElementById("navigation");

    if (!hamburger || !navigation) return;

    hamburger.classList.toggle("active");
    navigation.classList.toggle("active");
});

function setupPageTransition() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (
                href &&
                !href.startsWith('#') &&
                !href.startsWith('http') &&
                !href.startsWith('mailto:') &&
                !href.startsWith('tel:')
            ) {
                e.preventDefault();
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                    window.location.href = href;
                }, 80);
            }
        });
    });

    window.addEventListener('pageshow', () => {
        document.body.style.opacity = '1';
    });
}