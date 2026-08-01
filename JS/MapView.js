document.addEventListener("DOMContentLoaded", () => {

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    const backBtn = document.getElementById("back-main-btn");
    const reserveBtn = document.getElementById("map-reserve-btn");
    const favoriteBtn = document.getElementById("map-favorite-btn"); 

    const searchInput = document.getElementById("map-search");
    const statusFilter = document.getElementById("status-filter");

    const stationName = document.getElementById("station-name");
    const stationDetails = document.getElementById("station-details");
    const stationAvailable = document.getElementById("station-available");
    const stationPower = document.getElementById("station-power");
    const stationPrice = document.getElementById("station-price");

    const mapStatusContainer = document.getElementById("map-status-container");
    const mapCardContent = document.getElementById("map-card-content");
    const mapCardMessage = document.getElementById("map-card-message");

    let selectedStation = null;
    let stationsData = [];
    let markerObjects = [];
    let userFavorites = []; 

    const userId = localStorage.getItem("userId");

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "MainMenu.html";
        });
    }

    const map = L.map("leaflet-map").setView([31.8, 35.0], 7);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "© OpenStreetMap"
    }).addTo(map);

    if (userId) {
        fetch(`${API_URL}/api/favorites/${userId}`)
            .then(res => res.json())
            .then(favorites => {
                userFavorites = favorites.map(fav => fav.favorite_id || fav.station_id || fav.id);
            })
            .catch(err => console.error("Error loading user favorites:", err));
    }

    fetch(`${API_URL}/api/stations`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch stations from server");
            }
            return response.json();
        })
        .then(stations => {
            stationsData = stations; 

            if (!stationsData || stationsData.length === 0) {
                mapStatusContainer.innerHTML = `
                    <div class="no-data-state">
                        <p>🔍 No charging stations found in the system database.</p>
                    </div>
                `;
                return;
            }

            mapStatusContainer.classList.add("hidden");
            mapCardContent.classList.remove("hidden");

            stationsData.forEach(station => {
                const status = getStationStatus(station);

                const icon = L.divIcon({
                    className: "",
                    html: `<div class="custom-marker marker-${status}">⚡</div>`,
                    iconSize: [42, 42],
                    iconAnchor: [21, 21]
                });

                if (station.latitude && station.longitude) {
                    const marker = L.marker([station.latitude, station.longitude], { icon }).addTo(map);

                    marker.on("click", () => {
                        selectStation(station);
                    });

                    markerObjects.push({
                        marker,
                        station,
                        status
                    });
                }
            });

            if (searchInput) {
                searchInput.addEventListener("input", filterStations);
            }

            if (statusFilter) {
                statusFilter.addEventListener("change", filterStations);
            }
        })
        .catch(error => {
            console.error("Error loading map stations from server:", error);
            mapStatusContainer.innerHTML = `
                <div class="error-state">
                    <p>⚠️ Connection Error</p>
                    <span class="error-details">Unable to connect to the server. Please verify your internet connection or cloud database status.</span>
                </div>
            `;
        });

    function getStationStatus(station) {
        if (!station.available) return "available";
        const parts = station.available.split("/");
        const available = Number(parts[0]);
        const total = Number(parts[1]);

        if (available === 0) {
            return "full";
        }
        if (available < total) {
            return "partial";
        }
        return "available";
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

    function selectStation(station) {
        selectedStation = station;
        
        mapCardMessage.classList.add("hidden");

        stationName.textContent = station.name || "Unknown Station";
        
        const connectorsList = Array.isArray(station.connectors) ? station.connectors.join(", ") : (station.connectors || "Type 2");
        const amenitiesList = Array.isArray(station.amenities) ? station.amenities.join(", ") : (station.amenities || "WiFi");
        stationDetails.textContent = `${connectorsList} · ${amenitiesList}`;
        
        stationAvailable.textContent = station.available || "0/0";
        stationPower.textContent = station.power || "50 kW";
        stationPrice.textContent = station.price || "0.0";

        const isFull = station.available ? station.available.startsWith("0") : true;
        reserveBtn.disabled = isFull;
        reserveBtn.textContent = isFull ? "❌ Fully Booked" : "📅 Make a Reservation";

        const currentStationId = station.station_id || station.id;

        if (userFavorites.includes(currentStationId)) {
            favoriteBtn.innerHTML = "⭐ Remove from Favorites";
            favoriteBtn.classList.add("active");
        } else {
            favoriteBtn.innerHTML = "☆ Add to Favorites";
            favoriteBtn.classList.remove("active");
        }
    }

    function filterStations() {
        const searchValue = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        markerObjects.forEach(item => {
            const matchesSearch = item.station.name.toLowerCase().includes(searchValue);
            const matchesStatus = statusValue === "all" || item.status === statusValue;

            if (matchesSearch && matchesStatus) {
                item.marker.addTo(map);
            } else {
                map.removeLayer(item.marker);
            }
        });
    }

    if (reserveBtn) {
        reserveBtn.addEventListener("click", () => {
            if (!selectedStation) return;

            localStorage.setItem("selectedStationId", selectedStation.station_id || selectedStation.id);
            localStorage.setItem("selectedStationName", selectedStation.name);
            localStorage.setItem("comingFrom", "MapView.html");
            
            window.location.href = "Reservation.html";
        });
    }

    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", () => {
            if (!selectedStation) return;
            
            const currentStationId = selectedStation.station_id || selectedStation.id;
            
            if (!userId) {
                mapCardMessage.textContent = "⚠️ Please log in before saving favorites.";
                mapCardMessage.className = "station-message error-msg";
                mapCardMessage.classList.remove("hidden");
                return;
            }

            const isAlreadyFavorite = userFavorites.includes(currentStationId);
            
            const targetUrl = isAlreadyFavorite 
                ? `${API_URL}/api/favorites/remove` 
                : `${API_URL}/api/favorites/add`;
                
            const targetMethod = isAlreadyFavorite ? "DELETE" : "POST";

            fetch(targetUrl, {
                method: targetMethod,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, station_id: currentStationId })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (isAlreadyFavorite) {
                    userFavorites = userFavorites.filter(id => id !== currentStationId);
                    favoriteBtn.innerHTML = "☆ Add to Favorites";
                    favoriteBtn.classList.remove("active");
                    
                    mapCardMessage.textContent = "💔 Removed from your favorites.";
                    mapCardMessage.className = "station-message success-msg";
                    mapCardMessage.classList.remove("hidden");
                } else {
                    userFavorites.push(currentStationId);
                    favoriteBtn.innerHTML = "⭐ Remove from Favorites";
                    favoriteBtn.classList.add("active");
                    
                    mapCardMessage.textContent = "⭐ Added to your favorites successfully!";
                    mapCardMessage.className = "station-message success-msg";
                    mapCardMessage.classList.remove("hidden");
                }
                
                setTimeout(() => {
                    mapCardMessage.classList.add("hidden");
                }, 3000);
            })
            .catch(err => {
                console.error("Error updating favorites:", err);
                mapCardMessage.textContent = "⚠️ Connection Error. Failed to sync favorites.";
                mapCardMessage.className = "station-message error-msg";
                mapCardMessage.classList.remove("hidden");
            });
        });
    }
});