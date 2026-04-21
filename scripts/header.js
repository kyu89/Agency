document.addEventListener("DOMContentLoaded", () => {
    const navAlreadyExists = document.querySelector('.nav-bar');

    if (navAlreadyExists) {
        setupHeaderNav();
        navigationColor();
        setupDropdown();
        setupPageTransition();
    } else {
        const observer = new MutationObserver(() => {
    const nav = document.querySelector('.nav-bar');
    if (nav) {
        observer.disconnect();
        setupHeaderNav();
        navigationColor();
        setupDropdown();
        setupPageTransition();

        // Direct hamburger bind AFTER everything else
        const hamburger = document.getElementById('hamburger');
        const navigation = document.getElementById('navigation');

        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log('direct click fired');
            hamburger.classList.toggle('active');
            navigation.classList.toggle('active');
            console.log('navigation classes:', navigation.classList);
        });
    }
});

        observer.observe(document.getElementById('header') || document.body, {
            childList: true,
            subtree: true
        });
    }
});

function navigationColor() {
    const navbar = document.querySelector('.nav-bar');
    if (!navbar) return;

    const cName = document.getElementById('company-name');
    const navLinks = navbar.querySelectorAll('a');
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
            navbar.classList.add('scrolled');
            if (cName) cName.style.color = '#e5e7eb';
            navLinks.forEach(link => link.style.color = '#e5e7eb');
            spans.forEach(span => span.style.backgroundColor = '#e5e7eb');
        } else {
            navbar.classList.remove('scrolled');
            if (isSpecialPage) {
                if (cName) cName.style.color = '#F47D02';
                navLinks.forEach(link => link.style.color = '#F47D02');
                spans.forEach(span => span.style.backgroundColor = '#F47D02');
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

    // Set active link from current path
    try {
        let pageKey = '';
        if (path.includes('about'))         pageKey = 'about';
        else if (path.includes('services')) pageKey = 'services';
        else if (path.includes('contact'))  pageKey = 'contact us';
        else if (path.includes('book'))     pageKey = 'book';
        else                                pageKey = 'home';

        navLinks.forEach(l => {
            const text = (l.textContent || '').trim().toLowerCase();
            l.classList.toggle('active', text === pageKey);
        });
    } catch (e) {}

    if (isSpecialPage) {
        cName.style.color = '#F47D02';
        navLinks.forEach(link => link.style.color = '#F47D02');
        spans.forEach(span => span.style.backgroundColor = '#F47D02');
    }

    if (getStarted) {
        const gsLink = getStarted.querySelector('a');
        if (gsLink) {
            gsLink.addEventListener('mouseover', () => {
                gsLink.style.color = '#e5e7eb';
            });
            gsLink.addEventListener('mouseout', () => {
                gsLink.style.color = isSpecialPage ? '#F47D02' : '';
            });
        }
    }

    // Hamburger toggle
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navigation.classList.toggle('active');
    });
}

function setupDropdown() {
    const dropdown = document.querySelector('.nav-item.dropdown');
    if (!dropdown) return;

    const dropdownLink = dropdown.querySelector('.nav-link');

    dropdownLink.addEventListener('click', function (e) {
        if (window.innerWidth <= 991) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('open');
        }
    });

    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });
}

function setupPageTransition() {
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (
                !href ||
                href === '#' ||
                href.startsWith('http') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')
            ) return;

            // Skip if inside hamburger
            if (this.closest('#hamburger')) return;

            // Skip if this is the dropdown Services link on mobile/tablet
            if (this.closest('.nav-item.dropdown') && 
                this.classList.contains('nav-link') && 
                window.innerWidth <= 991) return;

            e.preventDefault();
            document.body.style.opacity = '0.8';
            setTimeout(() => {
                window.location.href = href;
            }, 80);
        });
    });

    window.addEventListener('pageshow', () => {
        document.body.style.opacity = '1';
    });
}