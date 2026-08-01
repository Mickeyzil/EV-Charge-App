document.addEventListener("DOMContentLoaded", () => {
    const backMainBtn = document.getElementById("back-main-btn");
    const contactBtn = document.getElementById("contact-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const container = document.getElementById("stations-container");

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    if (backMainBtn) {
        backMainBtn.addEventListener("click", () => {
            window.location.href = "MainMenu.html";
        });
    }

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

    if (!container) return;

    container.innerHTML = `
        <div class="status-message-container loading-state">
            <div class="spinner"></div>
            <p>Loading nearby charging stations... ⏳</p>
        </div>
    `;

    fetch(`${API_URL}/api/stations`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            container.innerHTML = "";

            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="status-message-container no-data-state">
                        <p>🔍 No charging stations available at the moment.</p>
                    </div>
                `;
                return;
            }

            data.forEach(station => {
                const card = document.createElement("div");
                card.className = "station-display-card";

                const connectorsHTML = station.connectors
                    .map(connector => `<span class="tag-item">${connector}</span>`)
                    .join(" ");

                const amenitiesHTML = station.amenities
                    .map(amenity => `<span class="tag-item">${amenity}</span>`)
                    .join(" ");

                const isFull = station.available[0] === "0";

                card.innerHTML = `
                    <div class="station-card-header">
                        <h2 class="station-card-title">${station.name}</h2>
                        <span class="status-dot" style="background-color: ${station.statusColor};"></span>
                    </div>

                    <div class="station-card-body">
                        <div class="info-row-main">
                            <div class="info-block">
                                <span class="info-label">AVAILABLE</span>
                                <span class="info-value-strong">${station.available}</span>
                            </div>

                            <div class="info-block align-right">
                                <span class="info-label">POWER</span>
                                <span class="info-value-highlight">⚡ ${station.power}</span>
                            </div>
                        </div>

                        <div class="price-row">
                            <span class="price-icon">💲</span>
                            <span class="price-value">${station.price}</span>
                        </div>

                        <div class="spec-row">
                            <span class="spec-icon">🔌</span>
                            <div class="tags-container">${connectorsHTML}</div>
                        </div>

                        <div class="spec-row">
                            <span class="spec-icon">📶</span>
                            <div class="tags-container">${amenitiesHTML}</div>
                        </div>

                        <p class="station-message hidden"></p>

                        <div class="card-actions">
                            <button class="btn-secondary favorite-btn" type="button">
                                ❤️ Add to Favorites
                            </button>

                            <button class="btn-primary reserve-btn ${isFull ? "disabled-btn" : ""}" type="button" ${isFull ? "disabled" : ""}>
                                ${isFull ? "❌ Fully Booked" : "📅 Make a Reservation"}
                            </button>
                        </div>
                    </div>
                `;

                const reserveBtn = card.querySelector(".reserve-btn");
                const favoriteBtn = card.querySelector(".favorite-btn");
                const messageBox = card.querySelector(".station-message");

                reserveBtn.addEventListener("click", () => {
                    localStorage.setItem("selectedStationId", station.station_id);
                    localStorage.setItem("selectedStationName", station.name);
                    localStorage.setItem("comingFrom", "NearbyStations.html");

                    window.location.href = "Reservation.html";
                });

                favoriteBtn.addEventListener("click", () => {
                    const userId = localStorage.getItem("userId");

                    if (!userId) {
                        messageBox.textContent = "You must be logged in!";
                        messageBox.className = "station-message error-msg"; 
                        return;
                    }

                    fetch(`${API_URL}/api/favorites/add`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            user_id: userId,
                            station_id: station.station_id
                        })
                    })
                        .then(async response => {
                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(data.message || "Failed to add to favorites");
                            }

                            return data;
                        })
                        .then(data => {
                            messageBox.textContent = `⭐ ${data.message || "Added to favorites!"}`;
                            messageBox.className = "station-message success-msg"; 

                            favoriteBtn.disabled = true;
                            favoriteBtn.textContent = "❤️ Already in Favorites";
                        })
                        .catch(error => {
                            messageBox.textContent = error.message;
                            messageBox.className = "station-message error-msg"; 

                            if (error.message === "Station already in favorites") {
                                favoriteBtn.disabled = true;
                                favoriteBtn.textContent = "❤️ Already in Favorites";
                            }
                        });
                });

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading stations:", error);
            container.innerHTML = `
                <div class="status-message-container error-state">
                    <p>⚠️ Connection Error</p>
                    <span class="error-details">Unable to load stations. Please verify that the cloud database is running and try again.</span>
                </div>
            `;
        });
});