import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
});

// --- Request interceptor: attach JWT token ---
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Response interceptor: handle 401/errors ---
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't redirect for auth endpoints (login, register, OTP etc.)
            const url = error.config?.url || '';
            const isAuthRoute = url.includes('/auth/');
            if (!isAuthRoute) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    sendOTP: (data) => api.post('/auth/send-otp', data),
    sendOTPAfterLogin: (data) => api.post('/auth/send-otp-after-login', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    loginWithOTP: (data) => api.post('/auth/login-with-otp', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data),
};

// ==================== CUSTOMER ====================
export const customerAPI = {
    // Profile
    getProfile: () => api.get('/customer/profile'),
    updateProfile: (data) => api.put('/customer/profile', data),

    // Vehicles
    getVehicles: () => api.get('/customer/vehicles'),
    addVehicle: (data) => api.post('/customer/vehicles', data),
    updateVehicle: (id, data) => api.put(`/customer/vehicles/${id}`, data),
    deleteVehicle: (id) => api.delete(`/customer/vehicles/${id}`),

    // Services
    getServices: (params) => api.get('/customer/services', { params }),

    // Bookings
    getBookings: (params) => api.get('/customer/bookings', { params }),
    getBookingById: (id) => api.get(`/customer/bookings/${id}`),
    createBooking: (data) => api.post('/customer/bookings', data),
    cancelBooking: (id, reason) => api.put(`/customer/bookings/${id}/cancel`, { reason }),

    // Issues
    getIssues: (bookingId) => api.get(`/customer/bookings/${bookingId}/issues`),
    approveIssue: (id) => api.put(`/customer/issues/${id}/approve`),
    declineIssue: (id, reason) => api.put(`/customer/issues/${id}/decline`, { reason }),

    // Messages
    getMessages: (bookingId) => api.get(`/customer/bookings/${bookingId}/messages`),
    sendMessage: (bookingId, data) => api.post(`/customer/bookings/${bookingId}/messages`, data),

    // Reviews
    getMyReviews: () => api.get('/customer/reviews'),
    createReview: (data) => api.post('/customer/reviews', data),

    // Discounts
    validateDiscount: (data) => api.post('/customer/discounts/validate', data),
    getDiscounts: () => api.get('/customer/discounts'),

    // Emergency
    getNearbyProviders: (lat, lng, radius = 20) => api.get('/customer/nearby-providers', { params: { lat, lng, radius } }),
};

// ==================== SERVICE PROVIDER ====================
export const providerAPI = {
    // Profile
    getProfile: () => api.get('/service-provider/profile'),
    updateProfile: (data) => api.put('/service-provider/profile', data),

    // Services
    getMyServices: () => api.get('/service-provider/services'),
    createService: (data) => api.post('/service-provider/services', data),
    updateService: (id, data) => api.put(`/service-provider/services/${id}`, data),
    deleteService: (id) => api.delete(`/service-provider/services/${id}`),

    // Bookings
    getBookings: (params) => api.get('/service-provider/bookings', { params }),
    getBookingById: (id) => api.get(`/service-provider/bookings/${id}`),
    updateBookingStatus: (id, data) => api.put(`/service-provider/bookings/${id}/status`, data),

    // Issues
    getIssues: (bookingId) => api.get(`/service-provider/bookings/${bookingId}/issues`),
    addIssue: (bookingId, data) => api.post(`/service-provider/bookings/${bookingId}/issues`, data),

    // Messages
    getMessages: (bookingId) => api.get(`/service-provider/bookings/${bookingId}/messages`),
    sendMessage: (bookingId, data) => api.post(`/service-provider/bookings/${bookingId}/messages`, data),

    // Discounts
    getDiscounts: () => api.get('/service-provider/discounts'),
    createDiscount: (data) => api.post('/service-provider/discounts', data),
    updateDiscount: (id, data) => api.put(`/service-provider/discounts/${id}`, data),

    // Reviews
    getReviews: () => api.get('/service-provider/reviews'),
    replyToReview: (id, reply) => api.put(`/service-provider/reviews/${id}/reply`, { reply }),

    // Stats
    getStats: () => api.get('/service-provider/stats'),
};

// ==================== PUBLIC ====================
export const publicAPI = {
    getServices: (params) => api.get('/public/services', { params }),
    getProviders: (params) => api.get('/public/providers', { params }),
    getProviderById: (id) => api.get(`/public/providers/${id}`),
    getCategories: () => api.get('/public/categories'),
};

export default api;
