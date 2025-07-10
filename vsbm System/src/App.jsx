import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FrontPage from "./Components/FrontPage";
import ConsumerLogin from "./Components/ConsumerLogin";
import ConsumerSignup from "./Components/ConsumerSignup";
import NotFound from "./Components/NotFound";
import ServiceLogin from "./Components/ServiceLogin";
import ServiceSignup from "./Components/ServiceSignup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/consumer-login" element={<ConsumerLogin />} />
        <Route path="/consumer-signup" element={<ConsumerSignup />} />
        <Route path="/service-login" element={<ServiceLogin />} />         
        <Route path="/service-signup" element={<ServiceSignup />} />      
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
