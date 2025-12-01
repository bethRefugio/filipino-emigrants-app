

# 🇵🇭 PhilEmigrants Data Portal - Filipino Emigrant Data Visualization Dashboard

A **Full-Stack FERN Application** built for the "Visualizing Four Decades of Filipino Emigration" case study. This interactive web dashboard provides a visual analysis of Filipino emigrant data from 1981–2020 using official CFO datasets.

## Features

This application focuses on transforming raw emigrant data into actionable insights through comprehensive visualizations and a user-friendly dashboard interface.

-----
## 🛠️ Technologies Used

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js (Vite)** | Interactive dashboard UI |
| **Backend** | **Node.js, Express.js** | RESTful API for data retrieval and processing |
| **Database** | **Firebase** (Firestore/Realtime DB) | Primary data storage for emigrant datasets |
| **Data Viz** | **Charting Library (e.g., Recharts, Chart.js)** | Rendering dynamic and interactive graphs |
-----

## 🚀 Installation

### Prerequisites

  * Node.js (LTS version)
  * npm (or yarn)
  * Access to **Firebase** for database management.

### Install Dependencies

Navigate to the respective directories and install dependencies for both the server (API) and the client (React frontend).

```bash
# Install server dependencies
npm install
```

-----

## ⚙️ Configuration

### Third-Party Services

| Service | Purpose |
| :--- | :--- |
| **Firebase** | Primary Data Storage, Authentication (optional) |

### Environment Variables

You need to create separate configuration files for the server and client to securely store API keys and other variables.

#### Server Environment Variables

Create a `firebase.js` file in the project directory:

```firebase.js
# Firebase Client SDK Configuration (Publicly accessible keys)
VITE_FIREBASE_API_KEY=your_firebase_public_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id


```

**Note:** Update `VITE_API_URL` to match your server URL (default: `http://localhost:8080`) if you change the server port.

-----

## Running the Application

### Start the Server (Backend API)

To run the React application, rendering the dashboard and visualizations.

```bash
npm run dev
```
**Contact:** bethrefugio16@gmail.com