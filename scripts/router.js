// Cache for loaded sections to avoid redundant requests
const sectionCache = {};

// Sections to load with their IDs
const sectionsToLoad = [
    { id: 'header', path: '/section-html/header.html', callback: 'setupHeaderNav' },
    { id: 'home', path: '/section-html/home.html' },
    { id: 'about', path: '/section-html/about.html' },
    { id: 'services', path: '/section-html/services.html' },
    { id: 'testimonials', path: '/section-html/testimonials.html', callback: 'setupTestimonialsCarousel' },
    { id: 'cta', path: '/section-html/cta.html' },
    { id: 'footer', path: '/section-html/footer.html' }
];

async function fetchSection(section) {
    try {
        // Return cached data if available
        if (sectionCache[section.id]) {
            return sectionCache[section.id];
        }

        const response = await fetch(section.path);
        if (!response.ok) {
            throw new Error(`Failed to load ${section.path}: ${response.status}`);
        }

        const data = await response.text();
        // Cache the result
        sectionCache[section.id] = data;
        return data;
    } catch (error) {
        console.error(`Error loading section ${section.id}:`, error);
        return null;
    }
}

// Load all sections in parallel for better performance
async function loadAllSections() {
    try {
        // Fetch all sections in parallel using Promise.all
        const results = await Promise.all(
            sectionsToLoad.map(section => fetchSection(section))
        );

        // Insert the loaded content into the DOM
        results.forEach((data, index) => {
            if (data) {
                const section = sectionsToLoad[index];
                const element = document.getElementById(section.id);
                if (element) {
                    element.innerHTML = data;
                    // Run callback if provided (e.g., for dynamic setup)
                    if (section.callback && typeof window[section.callback] === 'function') {
                        window[section.callback]();
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading sections:', error);
    }
}

// Load sections when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllSections);
} else {
    loadAllSections();
}