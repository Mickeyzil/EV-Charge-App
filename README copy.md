# ⚡ EV Charge – Smart Electric Vehicle Charging Management System

🌐 Live Demo:
https://mickeyzil.github.io/ev-charge-frontend/index.html

---

## 📌 Authors

- **Gil Cohen**
- **Mickey Zilberman**

**Software Engineering Department**  
**Shenkar College of Engineering, Design and Art**  
**Academic Year: 2025–2026**

---

## 📖 Project Overview

**EV Charge** is a full-stack web application designed to simplify the charging experience for electric vehicle drivers.

The system enables EV drivers to:

- Locate nearby charging stations
- View charging station availability in real-time
- Browse charging power and connector types
- Add charging stations to favorites
- Reserve charging slots
- Manage personal reservations
- View charging stations on an interactive map

Additionally, the platform provides external charging companies (such as Tesla, Paz Yellow, Sonol EVI, EV Edge, and Electra Power) with API access, allowing them to update station information dynamically without direct access to the database.

---

## 🎯 Project Goals

The main objectives of the project are:

- Improve the charging experience for electric vehicle drivers
- Centralize charging information from multiple providers
- Allow external charging companies to update station information through APIs
- Provide a modern, responsive, and user-friendly interface
- Demonstrate a scalable client-server architecture

---

## 🏗️ System Architecture

The project follows a classic three-tier architecture:

```text
Frontend (GitHub Pages)
        ↓
Backend API (Node.js + Express on Render)
        ↓
MySQL Cloud Database
```

---

## 💻 Technologies Used

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Design
- GitHub Pages Deployment

### Backend

- Node.js
- Express.js
- REST API Architecture
- CORS
- dotenv
- MySQL2

### Database

- MySQL Cloud Database

### Development Tools

- Visual Studio Code
- Git & GitHub
- Postman
- Render
- Figma

---

## ✨ Main Features

### 🔐 User Authentication

Users can:

- Register new accounts
- Login securely
- Logout
- Maintain user sessions

---

### 📍 Nearby Charging Stations

Users can:

- View all charging stations
- See real-time availability
- View charging prices
- View charging power
- View available connector types
- View station amenities

---

### 🗺️ Interactive Map View

Users can:

- Browse charging stations visually
- Select stations directly from the map
- Navigate directly to reservations

---

### ❤️ Favorites Management

Users can:

- Add stations to favorites
- Remove stations from favorites
- View favorite charging stations

---

### 📅 Reservation System

Users can:

- Create charging reservations
- View reservation history
- Manage charging sessions

---

### 👤 Profile Management

Users can:

- Edit personal information
- Update contact information
- Manage account preferences

---

## ⚡ External Company API

External charging providers can update station information dynamically using REST APIs.

### Supported Providers

- Tesla
- Paz Yellow
- Sonol EVI
- EV Edge
- Electra Power

### Example Endpoint

```http
PUT /api/stations/external-update/:station_id
```

### Example Request

```json
{
  "available_slots": 4,
  "total_slots": 6,
  "power_kw": 350,
  "price_kwh": 2.15,
  "connectors": "CCS, Type 2",
  "amenities": "WiFi, Coffee Shop",
  "latitude": 32.7940,
  "longitude": 34.9896
}
```

---

## 📊 Statistics API

The system provides administrative statistics.

### Endpoint

```http
GET /api/statistics
```

### Example Response

```json
{
  "total_users": 25,
  "total_stations": 5,
  "total_reservations": 63,
  "total_favorites": 41,
  "available_stations": 4,
  "fully_booked_stations": 1
}
```

---

## 📬 Postman Collection

The project includes a complete Postman collection demonstrating the system APIs.

### Authentication

- Register
- Login

### Stations

- Get All Stations
- External Station Update

### Favorites

- Add Favorite
- Get Favorites
- Remove Favorite

### Reservations

- Create Reservation
- Get User Reservations

### Statistics

- Get System Statistics

---

## 📁 Project Structure

```text
Frontend/
│
├── HTML/
├── CSS/
├── JS/
├── Images/
└── Data/

Backend/
│
├── controllers/
├── routes/
├── SQL/
├── package.json
└── Server.js
```

---

## 🚀 Deployment

### Frontend

Hosted using GitHub Pages.

### Backend

Hosted using Render.

### Database

Hosted using MySQL Cloud Database.

---

## 🔒 Security Features

The system implements:

- Client-side validation
- Server-side validation
- CORS protection
- Environment variables
- Separation between frontend and backend
- External API access control design

---

## 🧪 Testing

The project was tested using:

- Manual testing
- API testing using Postman
- Frontend integration testing
- Database testing
- Cross-browser testing

---

## 🌟 Future Improvements

Possible future enhancements include:

- Payment integration
- Real-time station updates
- Push notifications
- Reservation cancellation
- Mobile application support
- AI-based station recommendations

---

## 📜 License

This project was developed for academic purposes as part of the Software Engineering program at Shenkar College.

---

## 🎓 Academic Project

This project demonstrates:

- Full-stack web development
- Cloud deployment
- REST API design
- Database management
- Third-party API integration
- Responsive user interface design

---

## © Authors

**Gil Cohen**  
**Mickey Zilberman**

Shenkar College of Engineering, Design and Art  
2026