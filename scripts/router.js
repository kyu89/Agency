
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