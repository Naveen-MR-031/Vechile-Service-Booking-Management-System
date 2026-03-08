import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth.jsx';
import { useMockData } from './context/MockDataContext';

// Pages
import HomePage from './features/HomePage';
import ServicesPage from './features/ServicesPage';
import AboutPage from './features/AboutPage';
import ContactPage from './features/ContactPage';
import Login from './features/auth/Login';
import CustomerLogin from './features/auth/CustomerLogin';
import Signup from './features/auth/Signup';
import CustomerDashboard from './features/customer/CustomerDashboard';
import BookService from './features/customer/BookService';
import ServiceDashboard from './features/provider/ServiceDashboard';
import ProviderLogin from './features/auth/ProviderLogin';
import ProviderSignup from './features/auth/ProviderSignup';
import EmergencyBooking from './features/customer/EmergencyBooking';

// Styles
import './styles/themes.css';

// Protected Route — uses MockDataContext for auth
const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { currentUser } = useMockData();
  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

// Redirect logged-in users away from auth pages
const GuestRoute = ({ children }) => {
  const { currentUser } = useMockData();
  if (currentUser) {
    const dest = currentUser.userType === 'serviceProvider' ? '/provider/dashboard' : '/customer/dashboard';
    return <Navigate to={dest} replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<GuestRoute><CustomerLogin /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
            <Route path="/track" element={<Navigate to="/customer/dashboard?tab=track" replace />} />
            <Route path="/book-service" element={<ProtectedRoute><BookService /></ProtectedRoute>} />
            <Route path="/emergency-booking" element={<ProtectedRoute><EmergencyBooking /></ProtectedRoute>} />

            {/* Legacy Routes - Redirect */}
            <Route path="/consumer-login" element={<Navigate to="/login" replace />} />
            <Route path="/consumer-signup" element={<Navigate to="/signup" replace />} />
            <Route path="/service-login" element={<Navigate to="/login" replace />} />
            <Route path="/service-signup" element={<Navigate to="/signup" replace />} />

            {/* Provider Auth Routes */}
            <Route path="/provider/login" element={<ProviderLogin />} />
            <Route path="/provider/signup" element={<ProviderSignup />} />

            {/* Customer Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Provider Routes */}
            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute>
                  <ServiceDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--destructive)',
                secondary: 'white',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;