document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".container.logo");
    const header = document.querySelector(".site-header");
    const logoOffset = logo.offsetTop;

    window.addEventListener("scroll", () => {
        if (window.scrollY > logoOffset) {
            logo.classList.add("fixed");
            header.classList.add("has-fixed-logo");
        } else {
            logo.classList.remove("fixed");
            header.classList.remove("has-fixed-logo");
        }
    });
});
