document.addEventListener("DOMContentLoaded", () => {

    const API_URL = window.API_URL || "https://ev-charge-backend-27a3.onrender.com";

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const contactBtn = document.getElementById("contact-btn");
    const settingsBtn = document.getElementById("settings-btn");

    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            window.location.href = "Contact.html";
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            window.location.href = "Settings.html";
        });
    }

    const signupBtn = document.getElementById("signup-btn");
    if (signupBtn) {
        signupBtn.addEventListener("click", () => {
            window.location.href = "Register.html";
        });
    }

    const loginForm = document.getElementById("login-form");
    
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const errorBox = document.getElementById("error-message");
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const spinner = document.getElementById("loading-spinner"); 

            if (errorBox) {
                errorBox.classList.add("hidden");
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            if (email === "" || password === "") {
                if (errorBox) {
                    errorBox.innerHTML = "Please fill all fields";
                    errorBox.classList.remove("hidden");
                }
                return;
            }

            if (!emailPattern.test(email)) {
                if (errorBox) {
                    errorBox.innerHTML = "Invalid email format";
                    errorBox.classList.remove("hidden");
                }
                return;
            }

            if (!passwordPattern.test(password)) {
                if (errorBox) {
                    errorBox.innerHTML = "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.";
                    errorBox.classList.remove("hidden");
                }
                return;
            }

            const submitBtn = loginForm.querySelector("button[type='submit']");

            if (spinner) spinner.classList.remove("hidden");
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = "0.6";
                submitBtn.innerText = "Logging in...";
            }

            fetch(`${API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            })
            .then(res => {
                if (res.ok) {
                    localStorage.setItem("userFullName", "Driver");
                    localStorage.setItem("userId", "2");

                    return res.json()
                        .then(data => {
                            if (data && data.token) {
                                localStorage.setItem("token", data.token);
                            }
                            if (data && data.user) {
                                localStorage.setItem("userFullName", data.user.full_name || "Driver");
                                localStorage.setItem("userId", data.user.user_id);
                            }
                            window.location.href = "MainMenu.html";
                        })
                        .catch(() => {
                            window.location.href = "MainMenu.html";
                        });
                } else {
                    return res.json()
                        .then(data => {
                            throw new Error(data.message || "Login failed");
                        })
                        .catch(err => {
                            throw new Error(err.message || "Login failed");
                        });
                }
            })
            .catch(err => {
                if (spinner) spinner.classList.add("hidden");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = "1";
                    submitBtn.innerText = "Log In";
                }
                console.error('Error during login fetch:', err);
                if (errorBox) {
                    errorBox.innerHTML = err.message || "Server error, please try again.";
                    errorBox.classList.remove("hidden");
                }
            });
        });
    }
});