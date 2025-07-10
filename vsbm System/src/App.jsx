import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FrontPage from "./Components/FrontPage";
import ConsumerLogin from "./Components/ConsumerLogin";
import ConsumerSignup from "./Components/ConsumerSignup";
import NotFound from "./Components/NotFound";
import ServiceLogin from "./Components/ServiceLogin";
import ServiceSignup from "./Components/ServiceSignup";
import BookingPage from './Components/CustomerDashboard/BookingPage';
import BookingStatus from './Components/CustomerDashboard/BookingStatus';
import CustomerDashboard from "./Components/CustomerDashboard/CustomerDashboard";
import ServiceDashboard from "./Components/ServiceDashboard/ServiceDashboard"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/consumer-login" element={<ConsumerLogin />} />
        <Route path="/consumer-signup" element={<ConsumerSignup />} />
        <Route path="/service-login" element={<ServiceLogin />} />
        <Route path="/service-signup" element={<ServiceSignup />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/service-dashboard" element={<ServiceDashboard />} />
        <Route path="/booking-page" element={<BookingPage />} />
        <Route path="/booking-status" element={<BookingStatus />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;