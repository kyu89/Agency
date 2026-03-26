const routes = {
    "/": "/index.html",
    "/about-us": "/pages-html/about-page.html",
   "/services": "/pages-html/services-page.html",
    "/contact-us": "/pages-html/contact-us-page.html",
    "/book-now": "/pages-html/booking.html"
};

function loadPage(path){
    const page = routes[path] || routes["/"];

    fetch(page)
    .then(response => response.text())
    .then(data => {
        document.getElementById("content").innerHTML = data;
    });
};

document.querySelectorAll(".nav-link").forEach(link =>{
    link.addEventListener("click", function(e){

    e.preventDefault();
    const path=this.getAttribute("href");
    history.pushState({}, "", path);
    loadPage(path);

});    
});

window.addEventListener("DOMContentLoaded", () => {
    loadPage(location.pathname);
});
window.addEventListener("popstate", () => {
    loadPage(location.pathname);
});

loadPage(location.pathname);

fetch("/section-html/home.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("home").innerHTML = data;
    });
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