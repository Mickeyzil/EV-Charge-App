document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const backBtn = document.getElementById("back-stations-btn");
    const form = document.getElementById("reservation-form");
    const submitBtn = document.getElementById("submit-reservation-btn");
    const messageBanner = document.getElementById("message-banner");

    const fullNameInput = document.getElementById("full-name");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const dateInput = document.getElementById("arrival-date");
    const timeInput = document.getElementById("arrival-time");
    const carTypeSelect = document.getElementById("car-type");
    const connectorSelect = document.getElementById("connector-type");

    const stationName = localStorage.getItem("selectedStationName");
    const stationId = localStorage.getItem("selectedStationId");
    const userId = localStorage.getItem("userId");

    function showMessage(text, isSuccess = false) {
        if (!messageBanner) return;
        messageBanner.textContent = text;
        messageBanner.className = `message-banner ${isSuccess ? "success-msg" : "error-msg"}`;
        messageBanner.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (!userId || userId === "undefined" || userId === "null") {
        showMessage("Please log in before making a reservation. Redirecting...");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 3000);
        return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (dateInput) {
        dateInput.min = today;
    }

    if (fullNameInput) fullNameInput.placeholder = "Loading user profile...";

    fetch(`${API_URL}/api/users/${userId}`)
        .then(response => response.json())
        .then(user => {
            fullNameInput.value = user.full_name || "";
            emailInput.value = user.email || "";
            phoneInput.value = user.phone || "";

            fullNameInput.readOnly = true;
            emailInput.readOnly = true;
            phoneInput.readOnly = true;

            if (carTypeSelect && user.car_model) {
                carTypeSelect.value = user.car_model;
            }
        })
        .catch(error => {
            console.error("Error loading user data:", error);
            showMessage("Failed to load user details. Please login again.");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        });

    if (backBtn) {
        const comingFrom = localStorage.getItem("comingFrom");

        if (comingFrom === "Favorites.html") {
            backBtn.innerHTML = "&#9664; Back to Favorites";
        } else if (comingFrom === "MapView.html" || comingFrom === "map") {
            backBtn.innerHTML = "&#9664; Back to Map View";
        } else {
            backBtn.innerHTML = "&#9664; Back to Nearby Stations";
        }

        backBtn.addEventListener("click", () => {
            const currentComingFrom = localStorage.getItem("comingFrom");

            if (currentComingFrom === "Favorites.html") {
                localStorage.removeItem("comingFrom");
                window.location.href = "./Favorites.html";
            } else if (currentComingFrom === "MapView.html" || currentComingFrom === "map") {
                localStorage.removeItem("comingFrom");
                window.location.href = "./MapView.html";
            } else {
                localStorage.removeItem("comingFrom");
                window.location.href = "./NearbyStations.html";
            }
        });
    }

    if (stationName) {
        const formTitle = document.getElementById("form-title");
        if (formTitle) {
            formTitle.textContent = `Reservation to ${stationName}`;
        }
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

    if (!form) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const arrivalDate = dateInput.value;
        const arrivalTime = timeInput.value;
        const carModel = carTypeSelect.value;
        const connectorType = connectorSelect.value;

        if (!stationId || stationId === "undefined" || stationId === "null") {
            showMessage("Station selection error. Redirecting to stations list...");
            setTimeout(() => {
                window.location.href = "NearbyStations.html";
            }, 3000);
            return;
        }

        if (!arrivalDate) {
            showMessage("Please select an arrival date.");
            return;
        }

        if (!arrivalTime) {
            showMessage("Please select an arrival time.");
            return;
        }

        const now = new Date();
        const selectedDateTime = new Date(`${arrivalDate}T${arrivalTime}`);

        if (selectedDateTime <= now) {
            showMessage("Please choose a future date and time.");
            return;
        }

        if (!connectorType) {
            showMessage("Please select a connector type.");
            return;
        }

        if (!carModel) {
            showMessage("Please select a car model.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Booking your spot... ⏳";
        if (messageBanner) messageBanner.classList.add("hidden");

        fetch(`${API_URL}/api/reservations/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                station_id: stationId,
                full_name: fullName,
                email: email,
                phone: phone,
                arrival_date: arrivalDate,
                arrival_time: arrivalTime,
                car_model: carModel,
                connector_type: connectorType
            })
        })
            .then(response => response.json())
            .then(data => {
                if (!data.reservationId && !data.reservation_id && !data.message?.includes("success")) {
                    showMessage(data.message || "Failed to create reservation.");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Confirm Reservation";
                    return;
                }

                const mainContent = document.querySelector(".main-content");

                mainContent.innerHTML = `
                    <div class="welcome-section confirmation-card">
                        <h1>🎉 Reservation Confirmed!</h1>
                        <p>Thank you, <strong>${fullName}</strong>. Your spot has been successfully booked.</p>
                        <div class="confirmation-details">
                            <p>Station: <strong>${stationName || "Selected Station"}</strong></p>
                            <p>Date: <strong>${arrivalDate}</strong></p>
                            <p>Time: <strong>${arrivalTime}</strong></p>
                            <p>Car: <strong>${carModel}</strong></p>
                            <p>Connector: <strong>${connectorType}</strong></p>
                        </div>
                        <p class="confirmation-email-tip">A confirmation email was sent to: ${email}</p>

                        <button class="back-btn back-menu-btn" id="back-main-after-reservation">
                            Back to Main Menu
                        </button>
                    </div>
                `;

                const backMainBtn = document.getElementById("back-main-after-reservation");
                if (backMainBtn) {
                    backMainBtn.addEventListener("click", () => {
                        window.location.href = "MainMenu.html";
                    });
                }
            })
            .catch(error => {
                console.error("Reservation error:", error);
                showMessage("Server error. Please try again later.");
                submitBtn.disabled = false;
                submitBtn.textContent = "Confirm Reservation";
            });
    });
});