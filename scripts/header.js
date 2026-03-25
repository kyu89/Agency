document.addEventListener("DOMContentLoaded", () => {
    // FIX: .nav-bar is injected by components.js dynamically, so it may
    // not exist at DOMContentLoaded. Use a MutationObserver to wait for
    // it to appear before wiring up any nav logic.
    const navAlreadyExists = document.querySelector('.nav-bar');

    if (navAlreadyExists) {
        // Component was injected synchronously — safe to init immediately
        setupHeaderNav();
        navigationColor();
        setupPageTransition();
    } else {
        // Wait for components.js to inject the nav into #header
        const observer = new MutationObserver(() => {
            const nav = document.querySelector('.nav-bar');
            if (nav) {
                observer.disconnect();  // stop watching once found
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


/* =========================
   NAVIGATION COLOR
========================= */
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
        path.includes('booking');

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


/* =========================
   HEADER NAV
========================= */
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
        path.includes('booking');

    /* HAMBURGER */
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navigation.classList.toggle('active');
    });

    /* ACTIVE LINK */
    (function setActiveFromPath() {
        try {
            let pageKey = '';
            if (path.includes('about'))        pageKey = 'about';
            else if (path.includes('services')) pageKey = 'services';
            else if (path.includes('contact'))  pageKey = 'contact us';
            else if (path.includes('booking'))  pageKey = 'booking';
            else                                pageKey = 'home';

            navLinks.forEach(l => {
                const text = (l.textContent || '').trim().toLowerCase();
                l.classList.toggle('active', text === pageKey);
            });
        } catch (e) {}
    })();

    /* INITIAL COLORS */
    if (isSpecialPage) {
        cName.style.color = '#007e76';
        navLinks.forEach(link => link.style.color = '#007e76');
        spans.forEach(span => span.style.backgroundColor = '#007e76');
    }

    /* GET STARTED HOVER FIX */
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


/* =========================
   PAGE TRANSITION
========================= */
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
                document.body.style.opacity = '0.7';
                setTimeout(() => {
                    window.location.href = href;
                }, 150);
            }
        });
    });

    window.addEventListener('pageshow', () => {
        document.body.style.opacity = '1';
    });
}