document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("register-message");
    const backLoginBtn = document.getElementById("back-login-btn");
    const settingsBtn = document.getElementById('settings-btn');
    const contactBtn = document.getElementById('contact-btn');

    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            window.location.href = "Settings.html";
        });
    }

    if (contactBtn) {
        contactBtn.addEventListener("click", () => {
            window.location.href = "Contact.html";
        });
    }

    if (backLoginBtn) {
        backLoginBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const fullName = document.getElementById("full-name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();
            const carModel = document.getElementById("car-model").value; 

            const namePattern = /^[A-Za-z\s]{2,}$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phonePattern = /^\+?[0-9\s-]{9,15}$/; 
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

            hideMessage();

            if (!fullName || !email || !phone || !password || !confirmPassword || !carModel) {
                showMessage("Please fill all fields.", "error");
                return;
            }

            if (!namePattern.test(fullName)) {
                showMessage("Full name must contain only letters and spaces.", "error");
                return;
            }

            if (!emailPattern.test(email)) {
                showMessage("Please enter a valid email address.", "error");
                return;
            }

            if (!phonePattern.test(phone)) {
                showMessage("Please enter a valid phone number.", "error");
                return;
            }

            if (!passwordPattern.test(password)) {
                showMessage("Password must be at least 8 characters, with uppercase, lowercase and a number.", "error");
                return;
            }

            if (password !== confirmPassword) {
                showMessage("Passwords do not match.", "error");
                return;
            }

            const spinner = document.getElementById("loading-spinner");
            const registerBtn = registerForm.querySelector(".register-btn");

            if (spinner) spinner.classList.remove("hidden");
            if (registerBtn) {
                registerBtn.disabled = true;
                registerBtn.innerText = "Creating Account...";
            }

            fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    full_name: fullName, 
                    email: email, 
                    password: password, 
                    phone: phone, 
                    car_model: carModel 
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || "Registration failed");
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.message && data.message.includes('successfully')) {
                    showMessage("Account created successfully! Redirecting to login...", "success");
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1200);
                } else {
                    if (spinner) spinner.classList.add("hidden");
                    if (registerBtn) {
                        registerBtn.disabled = false;
                        registerBtn.innerText = "Create Account";
                    }
                    showMessage(data.message || "Registration failed", "error");
                }
            })
            .catch(err => {
                if (spinner) spinner.classList.add("hidden");
                if (registerBtn) {
                    registerBtn.disabled = false;
                    registerBtn.innerText = "Create Account";
                }
                console.error('Error during fetch:', err);
                showMessage(err.message || "Server error, please try again later", "error");
            }); 
        });
    }

    function showMessage(message, type) {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `register-message ${type}`;
        }
    }

    function hideMessage() {
        if (messageBox) {
            messageBox.className = "register-message hidden";
            messageBox.textContent = "";
        }
    }
});