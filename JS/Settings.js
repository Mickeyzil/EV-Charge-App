document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const contactBtn = document.getElementById("contact-btn");
    const saveBtn = document.getElementById("save-settings-btn");
    const backBtn = document.getElementById("back-btn");
    const result = document.getElementById("settings-result");

    const notificationsToggle = document.getElementById("notifications-toggle");
    const darkToggle = document.getElementById("dark-toggle");
    const favoritesToggle = document.getElementById("favorites-toggle");

    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            window.location.href = "Contact.html";
        });
    }

    notificationsToggle.checked = localStorage.getItem("notifications") === "true";
    darkToggle.checked = localStorage.getItem("darkMode") === "true";
    favoritesToggle.checked = localStorage.getItem("saveFavorites") === "true";

    if (darkToggle.checked) {
        document.body.classList.add("dark-mode");
    }

    saveBtn.addEventListener("click", () => {
        localStorage.setItem("notifications", notificationsToggle.checked);
        localStorage.setItem("darkMode", darkToggle.checked);
        localStorage.setItem("saveFavorites", favoritesToggle.checked);

        if (darkToggle.checked) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }

        result.textContent = "Settings saved successfully and applied to all pages!";
        result.style.color = "green";
        result.classList.remove("hidden");
    });

    backBtn.addEventListener("click", () => {
        window.history.back();
    });
});