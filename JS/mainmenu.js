document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const storedName = localStorage.getItem("userFullName");
    const welcomeHeading = document.getElementById("welcome-message");
    if (welcomeHeading && storedName) {
        welcomeHeading.textContent = `Hello, ${storedName}! 👋`;
    }

    const profileBtn = document.getElementById("profile-btn");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            window.location.href = "EditProfile.html";
        });
    }
    const contactBtn = document.getElementById("contact-btn");

    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            window.location.href = "Contact.html";
        });
    }

    const settingsBtn = document.getElementById("settings-btn");

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            window.location.href = "Settings.html";
        });
    }
    
    const favoritesBtn = document.getElementById("favorites-btn");
    if (favoritesBtn) {
        favoritesBtn.addEventListener("click", () => {
            window.location.href = "Favorites.html";
        });
    }

    const stationsBtn = document.getElementById("stations-btn");
    if (stationsBtn) {
        stationsBtn.addEventListener("click", () => {
            window.location.href = "NearbyStations.html";
        });
    }
   
    const mapBtn = document.getElementById("map-btn");

    if (mapBtn) {
        mapBtn.addEventListener("click", () => {
            window.location.href = "MapView.html";
        });
    }
    
    const logoutBtn = document.getElementById("logout-btn");
    const logoutModal = document.getElementById("logout-modal");
    const logoutConfirmBtn = document.getElementById("logout-confirm-btn");
    const logoutCancelBtn = document.getElementById("logout-cancel-btn");

    if (logoutBtn && logoutModal) {
        logoutBtn.addEventListener("click", () => {
            logoutModal.classList.remove("hidden");
        });
    }

    if (logoutCancelBtn && logoutModal) {
        logoutCancelBtn.addEventListener("click", () => {
            logoutModal.classList.add("hidden");
        });
    }

    if (logoutConfirmBtn) {
        logoutConfirmBtn.addEventListener("click", () => {
            localStorage.removeItem("userFullName");
            localStorage.removeItem("userId");
            window.location.href = "index.html";
        });
    }
});