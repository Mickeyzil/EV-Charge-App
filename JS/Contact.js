document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const form = document.getElementById("contact-form");
    const messageBox = document.getElementById("contact-message");
    const backBtn = document.getElementById("back-btn");

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!fullName || !email || !message) {
            messageBox.textContent = "Please fill all fields.";
            messageBox.style.color = "red";
            messageBox.classList.remove("hidden");
            return;
        }

        messageBox.textContent = "Your message was sent successfully!";
        messageBox.style.color = "green";
        messageBox.classList.remove("hidden");

        form.reset();
    });
});