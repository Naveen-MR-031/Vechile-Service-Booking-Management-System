# Vehicle Service Booking Management System (VSBM) 🚗🛠️

A comprehensive platform connecting vehicle owners with trusted service providers. This full-stack application enables users to book services, track status in real-time, and manage their vehicle history, while providing service centers with tools to manage jobs, earnings, and business profile.

## 🌟 Features

### For Vehicle Owners (Customers)
*   **Bookings**: Easy service scheduling with stage-by-stage tracking (8-stage tracker).
*   **Dashboard**: Overview of active bookings, total spend, and vehicle status.
*   **Payments**: Secure payment gateway simulation (Card & UPI).
*   **Invoices**: Downloadable PDF invoices for completed services.
*   **Real-time Alerts**: Notifications for booking status updates.

### For Service Providers (Mechanics/Garages)
*   **Job Board**: Accept/Reject incoming job requests.
*   **Service Management**: Add, edit, and price your service offerings.
*   **Earnings Analytics**: Visual charts for revenue tracking and transaction history.
*   **Business Profile**: Manage operating hours and business details.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Framer Motion, Chart.js, Lucide React, Socket.io-client
*   **Backend**: Node.js, Express.js, MongoDB (Atlas), Socket.io
*   **Authentication**: JWT (JSON Web Tokens) with OTP verification
*   **Styling**: CSS Modules with a custom Design System (Dark/Light mode)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   MongoDB URI

### Installation

1.  **Clone the repository**
2.  **Install Dependencies**
    ```bash
    # Root directory (if concurrently is used) or separate folders
    cd "vsbm System"
    npm install
    
    cd server
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5001
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    CLIENT_URL=http://localhost:5173
    ```

4.  **Run the Application**
    *   **Frontend**: `npm run dev` (in root/frontend folder)
    *   **Backend**: `node server.js` (in server folder)

## 📂 Project Structure

*   `src/Components/Auth`: Login & Signup modules
*   `src/Components/CustomerDashboard`: Customer-facing features
*   `src/Components/ServiceDashboard`: Provider-facing features
*   `src/Components/Common`: Reusable components (ThemeToggle, NotificationCenter)
*   `src/context`: React Contexts (Theme, Socket)
*   `server/`: Backend API and Database models

## 🎨 Theme
The project features a **Glassmorphism** inspired design with a toggleable **Dark/Light** theme system.

---
© 2025 Vehicle Service Hub. All rights reserved.
