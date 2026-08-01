document.addEventListener("DOMContentLoaded", () => {
    const logoContainer = document.querySelector(".logo-container");

    if (!logoContainer) return;

    const currentPage = window.location.pathname.split("/").pop();

    const blockedPages = ["index.html", "Register.html", ""];

    if (blockedPages.includes(currentPage)) {
        return;
    }

    logoContainer.style.cursor = "pointer";

    logoContainer.addEventListener("click", () => {
        window.location.href = "MainMenu.html";
    });
});