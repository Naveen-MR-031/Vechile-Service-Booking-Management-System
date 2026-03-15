/**
 * MockDataContext — API-backed compatibility layer
 * 
 * Provides the same `useMockData()` interface that all existing components use,
 * but fetches real data from the backend API instead of local JSON files.
 * 
 * Field mappings: backend → frontend convenience names
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, customerAPI, providerAPI, publicAPI } from '../services/api';

const MockDataContext = createContext();

export const useMockData = () => {
    return useContext(MockDataContext);
};

// Status info mapping
const STATUS_MAP = {
    'pending': { name: 'Pending', color: '#FFA500' },
    'accepted': { name: 'Accepted', color: '#3B82F6' },
    'vehiclePickedUp': { name: 'Vehicle Picked Up', color: '#6366F1' },
    'underService': { name: 'Under Service', color: '#8B5CF6' },
    'issuesIdentified': { name: 'Issues Found', color: '#EF4444' },
    'estimateApproved': { name: 'Estimate Approved', color: '#14B8A6' },
    'qualityCheck': { name: 'Quality Check', color: '#0EA5E9' },
    'readyForDelivery': { name: 'Ready for Delivery', color: '#22C55E' },
    'completed': { name: 'Completed', color: '#28A745' },
    'cancelled': { name: 'Cancelled', color: '#EF4444' },
    'rejected': { name: 'Rejected', color: '#DC2626' },
    // uppercase aliases for backward compatibility
    'PENDING': { name: 'Pending', color: '#FFA500' },
    'ACCEPTED': { name: 'Accepted', color: '#3B82F6' },
    'WORK_IN_PROGRESS': { name: 'Under Service', color: '#8B5CF6' },
    'COMPLETED': { name: 'Completed', color: '#28A745' },
    'CANCELLED': { name: 'Cancelled', color: '#EF4444' },
    'DECLINED': { name: 'Declined', color: '#DC2626' },
    'PICKUP_SCHEDULED': { name: 'Pickup Scheduled', color: '#6366F1' },
    'OUT_FOR_PICKUP': { name: 'Out for Pickup', color: '#6366F1' },
    'PICKED_UP': { name: 'Picked Up', color: '#6366F1' },
    'INSPECTION': { name: 'Inspection', color: '#8B5CF6' },
    'ISSUES_IDENTIFIED': { name: 'Issues Found', color: '#EF4444' },
    'ESTIMATE_APPROVED': { name: 'Estimate Approved', color: '#14B8A6' },
    'PARTS_ORDERED': { name: 'Parts Ordered', color: '#F59E0B' },
    'PARTS_RECEIVED': { name: 'Parts Received', color: '#F59E0B' },
    'QUALITY_CHECK': { name: 'Quality Check', color: '#0EA5E9' },
    'TESTING': { name: 'Testing', color: '#0EA5E9' },
    'READY_FOR_DELIVERY': { name: 'Ready for Delivery', color: '#22C55E' },
    'OUT_FOR_DELIVERY': { name: 'Out for Delivery', color: '#22C55E' },
    'DELIVERED': { name: 'Delivered', color: '#22C55E' },
};

// --- Backend status → Frontend status mapping ---
const BACKEND_TO_FRONTEND_STATUS = {
    'pending': 'PENDING',
    'accepted': 'ACCEPTED',
    'vehiclePickedUp': 'PICKED_UP',
    'underService': 'WORK_IN_PROGRESS',
    'issuesIdentified': 'ISSUES_IDENTIFIED',
    'estimateApproved': 'ESTIMATE_APPROVED',
    'qualityCheck': 'QUALITY_CHECK',
    'readyForDelivery': 'READY_FOR_DELIVERY',
    'completed': 'COMPLETED',
    'cancelled': 'CANCELLED',
    'rejected': 'DECLINED',
};

// --- Frontend status → Backend status mapping (for API calls) ---
const FRONTEND_TO_BACKEND_STATUS = Object.fromEntries(
    Object.entries(BACKEND_TO_FRONTEND_STATUS).map(([k, v]) => [v, k])
);

// Random auto shop / garage stock photos for providers without custom images
const SHOP_PHOTOS = [
    'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1567818735868-e71b99932e29?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&h=400&fit=crop',
];
let _providerIdx = 0;
const _providerPhotoMap = {};
const getShopPhotos = (id) => {
    if (_providerPhotoMap[id]) return _providerPhotoMap[id];
    const offset = (_providerIdx * 3) % SHOP_PHOTOS.length;
    _providerIdx++;
    const photos = [
        SHOP_PHOTOS[offset % SHOP_PHOTOS.length],
        SHOP_PHOTOS[(offset + 1) % SHOP_PHOTOS.length],
        SHOP_PHOTOS[(offset + 2) % SHOP_PHOTOS.length],
    ];
    _providerPhotoMap[id] = photos;
    return photos;
};

// --- Transform backend data to match old frontend field names ---
const transformProvider = (p) => {
    const fallbackPhotos = getShopPhotos(p._id);
    return {
    provider_id: p._id,
    company_name: p.businessName || p.name,
    business_logo: p.businessLogo || fallbackPhotos[0],
    cover_image: p.businessLogo || fallbackPhotos[0],
    gallery: p.businessLogo ? [p.businessLogo] : fallbackPhotos,
    email: p.email,
    phone: p.phone,
    address: [p.address?.street, p.address?.city, p.address?.state].filter(Boolean).join(', ') || '',
    description: p.description || '',
    rating: p.rating || 0,
    review_count: p.totalReviews || 0,
    amenities: p.amenities || [],
    services_offered: p.servicesOffered || [],
    year_established: p.createdAt ? new Date(p.createdAt).getFullYear() : 2024,
    total_employees: 0,
    verification_status: p.isVerified ? 'Verified' : 'Pending',
    featured_provider: true,
};};

const transformService = (s) => ({
    service_id: s._id,
    provider_id: s.serviceProviderId?._id || s.serviceProviderId,
    service_name: s.name,
    service_description: s.description,
    service_category_id: s.category,
    category_name: s.category,
    base_price: s.basePrice,
    estimated_duration: parseInt(s.estimatedDuration) * 60 || 60, // convert hours to minutes
    price_type: 'Fixed',
    is_active: s.isActive,
    popular_service: true,
});

const transformBooking = (b) => ({
    booking_id: b._id,
    booking_number: b.bookingId,
    customer_id: b.customerId?._id || b.customerId,
    provider_id: b.serviceProviderId?._id || b.serviceProviderId,
    vehicle_id: b.vehicleId?._id || b.vehicleId,
    booking_date: b.preferredDate,
    preferred_date: b.preferredDate ? new Date(b.preferredDate).toLocaleDateString('en-IN') : '',
    current_status: BACKEND_TO_FRONTEND_STATUS[b.status] || b.status?.toUpperCase() || 'PENDING',
    total_amount: b.finalCost || b.estimatedCost || 0,
    payment_status: b.paymentStatus === 'paid' ? 'Paid' : 'Pending',
    special_instructions: b.customerNotes || b.description,
    booking_type: b.preferredTimeSlot || 'Drop-off',
    services: b.services?.map(s => ({
        service_id: s.serviceId,
        service_name: s.serviceName,
        unit_price: s.unitPrice,
        quantity: s.quantity || 1,
        line_total: s.lineTotal || s.unitPrice
    })) || [],
    status_history: b.statusHistory?.map(sh => ({
        status: sh.status,
        name: STATUS_MAP[sh.status]?.name || sh.status,
        color: STATUS_MAP[sh.status]?.color || '#666',
        timestamp: sh.timestamp,
        notes: sh.notes
    })) || [],
    provider: b.serviceProviderId?.name ? transformProvider(b.serviceProviderId) : null,
    vehicle: b.vehicleId ? transformVehicle(b.vehicleId) : null,
});

const transformVehicle = (v) => ({
    vehicle_id: v._id,
    customer_id: v.customerId,
    vehicle_make: v.make,
    make: v.make,
    vehicle_model: v.model,
    model: v.model,
    vehicle_year: v.year,
    year: v.year,
    registration_number: v.registrationNumber,
    license_plate: v.registrationNumber,
    vehicle_type: v.vehicleType,
    fuel_type: v.fuelType,
    color: v.color,
    vehicle_color: v.color,
    transmission: v.transmission,
    current_mileage: v.odometerKm,
    mileage: v.odometerKm,
    is_primary: v.isPrimary,
    vehicle_image: null,
});

const transformIssue = (i) => ({
    issue_id: i._id,
    booking_id: i.bookingId,
    issue_description: i.issueDescription,
    issue_title: i.issueTitle,
    issue_type: i.issueType,
    severity: i.severity,
    estimated_additional_cost: i.estimatedAdditionalCost,
    issue_status: i.issueStatus === 'pending_approval' ? 'Pending Approval' :
        i.issueStatus === 'approved' ? 'Approved' :
            i.issueStatus === 'declined' ? 'Declined' : i.issueStatus,
    identified_date: i.createdAt,
});

const transformComm = (c) => ({
    comm_id: c._id,
    booking_id: c.bookingId,
    sender_type: c.senderRole === 'customer' ? 'Customer' : 'Provider',
    message: c.message,
    timestamp: c.timestamp || c.createdAt,
    is_read: c.isRead,
});

const transformReview = (r) => ({
    review_id: r._id,
    booking_id: r.bookingId,
    customer_id: r.customerId?._id || r.customerId,
    provider_id: r.providerId?._id || r.providerId,
    rating: r.rating,
    comment: r.comment || r.title,
    created_at: r.createdAt,
    customer_name: r.customerId?.name || 'Customer',
});

const transformDiscount = (d) => ({
    discount_id: d._id,
    provider_id: d.serviceProviderId,
    code: d.discountCode,
    type: d.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
    value: d.discountValue,
    description: d.description || d.title,
    min_order: d.minBookingAmount || 0,
    max_discount: d.maxDiscountAmount || 0,
    valid_from: d.validFrom,
    valid_until: d.validUntil,
    is_active: d.isActive,
    auto_apply: false,
});

export const MockDataProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data stores
    const [providers, setProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [issues, setIssues] = useState([]);
    const [communications, setCommunications] = useState([]);

    const serviceCategories = [
        { category_id: 'General Service', category_name: 'General Service', icon: 'Wrench' },
        { category_id: 'Oil Change', category_name: 'Oil Change', icon: 'Droplets' },
        { category_id: 'Tire Service', category_name: 'Tire Service', icon: 'Circle' },
        { category_id: 'Battery Service', category_name: 'Battery Service', icon: 'Battery' },
        { category_id: 'Engine Repair', category_name: 'Engine Repair', icon: 'AlertTriangle' },
        { category_id: 'Diagnostics', category_name: 'Diagnostics', icon: 'Search' },
        { category_id: 'AC Service', category_name: 'AC Service', icon: 'Snowflake' },
        { category_id: 'Brake Service', category_name: 'Brake Service', icon: 'Settings' },
        { category_id: 'Denting & Painting', category_name: 'Denting & Painting', icon: 'Sparkles' },
    ];

    const bookingStatuses = [
        { code: 'PENDING', name: 'Pending', color: '#FFA500', order: 1 },
        { code: 'ACCEPTED', name: 'Accepted', color: '#3B82F6', order: 2 },
        { code: 'PICKUP_SCHEDULED', name: 'Pickup Scheduled', color: '#6366F1', order: 3 },
        { code: 'OUT_FOR_PICKUP', name: 'Out for Pickup', color: '#6366F1', order: 4 },
        { code: 'PICKED_UP', name: 'Picked Up', color: '#6366F1', order: 5 },
        { code: 'INSPECTION', name: 'Inspection', color: '#8B5CF6', order: 6 },
        { code: 'ISSUES_IDENTIFIED', name: 'Issues Found', color: '#EF4444', order: 7 },
        { code: 'ESTIMATE_APPROVED', name: 'Estimate Approved', color: '#14B8A6', order: 8 },
        { code: 'PARTS_ORDERED', name: 'Parts Ordered', color: '#F59E0B', order: 9 },
        { code: 'PARTS_RECEIVED', name: 'Parts Received', color: '#F59E0B', order: 10 },
        { code: 'WORK_IN_PROGRESS', name: 'Under Service', color: '#8B5CF6', order: 11 },
        { code: 'QUALITY_CHECK', name: 'Quality Check', color: '#0EA5E9', order: 12 },
        { code: 'TESTING', name: 'Testing', color: '#0EA5E9', order: 13 },
        { code: 'READY_FOR_DELIVERY', name: 'Ready for Delivery', color: '#22C55E', order: 14 },
        { code: 'OUT_FOR_DELIVERY', name: 'Out for Delivery', color: '#22C55E', order: 15 },
        { code: 'DELIVERED', name: 'Delivered', color: '#22C55E', order: 16 },
        { code: 'COMPLETED', name: 'Completed', color: '#28A745', order: 17 },
    ];

    // --- Load initial data ---
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Check for stored user
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    const user = JSON.parse(storedUser);
                    setCurrentUser(user);

                    // Fetch role-specific data
                    if (user.userType === 'customer') {
                        await loadCustomerData(user);
                    } else if (user.userType === 'serviceProvider') {
                        await loadProviderData(user);
                    }
                }

                // Load public data
                await loadPublicData();
            } catch (err) {
                console.error('Init error:', err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const loadPublicData = async () => {
        try {
            const [provRes, svcRes] = await Promise.all([
                publicAPI.getProviders().catch(() => ({ data: { data: [] } })),
                publicAPI.getServices().catch(() => ({ data: { data: [] } })),
            ]);
            setProviders((provRes.data?.data || []).map(transformProvider));
            setServices((svcRes.data?.data || []).map(transformService));
        } catch (err) {
            console.error('Load public data error:', err);
        }
    };

    const loadCustomerData = async (user) => {
        try {
            const [bkRes, vehRes, revRes] = await Promise.all([
                customerAPI.getBookings().catch(() => ({ data: { data: [] } })),
                customerAPI.getVehicles().catch(() => ({ data: { data: [] } })),
                customerAPI.getMyReviews().catch(() => ({ data: { data: [] } })),
            ]);
            setBookings((bkRes.data?.data || []).map(transformBooking));
            setVehicles((vehRes.data?.data || []).map(transformVehicle));
            setReviews((revRes.data?.data || []).map(transformReview));
        } catch (err) {
            console.error('Load customer data error:', err);
        }
    };

    const loadProviderData = async (user) => {
        try {
            const [bkRes, svcRes, discRes, revRes] = await Promise.all([
                providerAPI.getBookings().catch(() => ({ data: { data: [] } })),
                providerAPI.getMyServices().catch(() => ({ data: { data: [] } })),
                providerAPI.getDiscounts().catch(() => ({ data: { data: [] } })),
                providerAPI.getReviews().catch(() => ({ data: { data: [] } })),
            ]);
            setBookings((bkRes.data?.data || []).map(transformBooking));
            setServices(prev => {
                const providerServices = (svcRes.data?.data || []).map(transformService);
                // Merge with existing public services
                const publicServices = prev.filter(s => s.provider_id !== user.id);
                return [...publicServices, ...providerServices];
            });
            setDiscounts((discRes.data?.data || []).map(transformDiscount));
            setReviews((revRes.data?.data || []).map(transformReview));
        } catch (err) {
            console.error('Load provider data error:', err);
        }
    };

    // ==================== AUTH ====================
    const loginCustomer = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        const userObj = {
            ...user,
            customer_id: user.id,
            first_name: user.name?.split(' ')[0] || user.name,
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            role: 'customer',
            registration_date: new Date().toISOString()
        };
        setCurrentUser(userObj);
        await loadCustomerData(userObj);
        return userObj;
    };

    const loginProvider = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        const userObj = {
            ...user,
            provider_id: user.id,
            company_name: user.businessName || user.name,
            role: 'provider',
        };
        setCurrentUser(userObj);
        await loadProviderData(userObj);
        return userObj;
    };

    // ===== OTP-based login =====
    const sendOTPAfterLogin = async (email, password) => {
        const res = await authAPI.sendOTPAfterLogin({ email, password });
        return res.data; // { success, message, userType, userName }
    };

    const sendOTP = async (email, forSignup = false, name = '') => {
        const res = await authAPI.sendOTP({ email, forSignup, name });
        return res.data;
    };

    const loginWithOTP = async (email, otp, userType) => {
        // Get user's current location
        let location = null;
        try {
            const pos = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: true });
            });
            location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) { /* location optional */ }

        const res = await authAPI.loginWithOTP({ email, otp, location });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        let userObj;
        if (user.userType === 'serviceProvider') {
            userObj = {
                ...user,
                provider_id: user.id,
                company_name: user.businessName || user.name,
                role: 'provider',
            };
            setCurrentUser(userObj);
            await loadProviderData(userObj);
        } else {
            userObj = {
                ...user,
                customer_id: user.id,
                first_name: user.name?.split(' ')[0] || user.name,
                last_name: user.name?.split(' ').slice(1).join(' ') || '',
                role: 'customer',
                registration_date: new Date().toISOString()
            };
            setCurrentUser(userObj);
            await loadCustomerData(userObj);
        }
        return userObj;
    };

    const registerCustomer = async (userData) => {
        const res = await authAPI.register({ ...userData, userType: 'customer' });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        const userObj = {
            ...user,
            customer_id: user.id,
            first_name: user.name?.split(' ')[0] || user.name,
            last_name: user.name?.split(' ').slice(1).join(' ') || '',
            role: 'customer',
            registration_date: new Date().toISOString()
        };
        setCurrentUser(userObj);
        await loadCustomerData(userObj);
        return { success: true, user: userObj };
    };

    const registerProvider = async (userData) => {
        const res = await authAPI.register({ ...userData, userType: 'serviceProvider' });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        const userObj = {
            ...user,
            provider_id: user.id,
            company_name: user.businessName || user.name,
            role: 'provider',
        };
        setCurrentUser(userObj);
        await loadProviderData(userObj);
        return { success: true, user: userObj };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentUser(null);
        setBookings([]);
        setVehicles([]);
        setIssues([]);
        setCommunications([]);
        setServices([]);
        setProviders([]);
        setDiscounts([]);
        setReviews([]);
        toast.success('Logged out successfully');
        setTimeout(() => {
            window.location.href = '/login';
        }, 500);
    };

    // ==================== GETTERS (from cache) ====================
    const getBookingsByCustomerId = useCallback((customerId) => {
        return bookings;
    }, [bookings]);

    const getBookingsByProviderId = useCallback((providerId) => {
        return bookings;
    }, [bookings]);

    const getVehiclesByCustomerId = useCallback((customerId) => {
        return vehicles;
    }, [vehicles]);

    const getServicesByProviderId = useCallback((providerId) => {
        return services.filter(s => s.provider_id === providerId);
    }, [services]);

    const getIssuesByBookingId = useCallback((bookingId) => {
        return issues.filter(i => i.booking_id === bookingId);
    }, [issues]);

    const getCommunicationsByBookingId = useCallback((bookingId) => {
        return communications.filter(c => c.booking_id === bookingId);
    }, [communications]);

    const getStatusHistoryByBookingId = useCallback((bookingId) => {
        const booking = bookings.find(b => b.booking_id === bookingId);
        return booking?.status_history || [];
    }, [bookings]);

    const getStatusInfo = useCallback((status) => {
        const fromStatuses = bookingStatuses.find(s => s.code === status);
        if (fromStatuses) return fromStatuses;
        return STATUS_MAP[status] || { name: status, color: '#666' };
    }, []);

    const getDiscountsByProviderId = useCallback((providerId) => {
        return discounts;
    }, [discounts]);

    const getReviewsByProviderId = useCallback((providerId) => {
        return reviews;
    }, [reviews]);

    const getBusinessHoursByProviderId = useCallback((providerId) => {
        return null;
    }, []);

    const getAddressesByCustomerId = useCallback(() => {
        return [];
    }, []);

    // ==================== ACTIONS ====================
    const updateBookingStatus = async (bookingId, newStatus, dateFields = {}) => {
        try {
            const backendStatus = FRONTEND_TO_BACKEND_STATUS[newStatus] || newStatus.toLowerCase();
            const payload = { status: backendStatus, ...dateFields };
            const res = await providerAPI.updateBookingStatus(bookingId, payload);
            setBookings(prev => prev.map(b =>
                b.booking_id === bookingId
                    ? {
                        ...b,
                        current_status: newStatus,
                        status_history: [...b.status_history, { status: newStatus, timestamp: new Date().toISOString() }],
                        confirmed_date: dateFields.confirmedDate || b.confirmed_date,
                        pickup_date: dateFields.pickUpDate || b.pickup_date,
                        dropoff_date: dateFields.dropOffDate || b.dropoff_date,
                        provider_notes: dateFields.serviceProviderNotes || b.provider_notes
                    }
                    : b
            ));
        } catch (err) {
            console.error('Update status error:', err);
            throw err;
        }
    };

    const approveIssue = async (issueId) => {
        try {
            await customerAPI.approveIssue(issueId);
            setIssues(prev => prev.map(i =>
                i.issue_id === issueId ? { ...i, issue_status: 'Approved' } : i
            ));
        } catch (err) {
            console.error('Approve issue error:', err);
        }
    };

    const declineIssue = async (issueId) => {
        try {
            await customerAPI.declineIssue(issueId);
            setIssues(prev => prev.map(i =>
                i.issue_id === issueId ? { ...i, issue_status: 'Declined' } : i
            ));
        } catch (err) {
            console.error('Decline issue error:', err);
        }
    };

    const cancelBooking = async (bookingId) => {
        try {
            await customerAPI.cancelBooking(bookingId);
            setBookings(prev => prev.map(b =>
                b.booking_id === bookingId ? { ...b, current_status: 'CANCELLED' } : b
            ));
        } catch (err) {
            console.error('Cancel booking error:', err);
        }
    };

    const sendMessage = async (bookingId, message) => {
        try {
            const role = currentUser?.role;
            const api = role === 'provider' ? providerAPI : customerAPI;
            const res = await api.sendMessage(bookingId, { message });
            const newMsg = transformComm(res.data.data);
            setCommunications(prev => [...prev, newMsg]);
        } catch (err) {
            console.error('Send message error:', err);
        }
    };

    const addVehicle = async (vehicleData) => {
        try {
            const payload = {
                make: vehicleData.make,
                model: vehicleData.model,
                year: vehicleData.year,
                registrationNumber: vehicleData.registration_number,
                vehicleType: vehicleData.vehicle_type === 'Sedan' || vehicleData.vehicle_type === 'SUV' || vehicleData.vehicle_type === 'Hatchback' ? 'Car' : vehicleData.vehicle_type === 'Bike' || vehicleData.vehicle_type === 'Scooter' ? 'Bike' : 'Car',
                fuelType: vehicleData.fuel_type,
                color: vehicleData.color,
            };
            const res = await customerAPI.addVehicle(payload);
            setVehicles(prev => [...prev, transformVehicle(res.data.data)]);
        } catch (err) {
            console.error('Add vehicle error:', err);
            throw err;
        }
    };

    const deleteVehicle = async (vehicleId) => {
        try {
            await customerAPI.deleteVehicle(vehicleId);
            setVehicles(prev => prev.filter(v => v.vehicle_id !== vehicleId));
        } catch (err) {
            console.error('Delete vehicle error:', err);
        }
    };

    const addReview = async (reviewData) => {
        try {
            const res = await customerAPI.createReview(reviewData);
            setReviews(prev => [...prev, transformReview(res.data.data)]);
        } catch (err) {
            console.error('Add review error:', err);
        }
    };

    const addIssue = async (bookingId, issueData) => {
        try {
            const payload = {
                issueTitle: issueData.issue_description?.substring(0, 50) || 'Issue',
                issueDescription: issueData.issue_description,
                issueType: issueData.issue_type || 'Mechanical',
                severity: issueData.severity || 'Moderate',
                estimatedAdditionalCost: issueData.estimated_additional_cost || 0,
            };
            const res = await providerAPI.addIssue(bookingId, payload);
            setIssues(prev => [...prev, transformIssue(res.data.data)]);
        } catch (err) {
            console.error('Add issue error:', err);
            throw err;
        }
    };

    const addService = async (serviceData) => {
        try {
            const payload = {
                name: serviceData.service_name,
                description: serviceData.service_description || serviceData.service_name,
                category: serviceCategories.find(c => c.category_id === serviceData.service_category_id)?.category_name || 'Other',
                basePrice: serviceData.base_price,
                estimatedDuration: `${Math.round(serviceData.estimated_duration / 60)} hours`,
                vehicleTypes: ['Car'],
            };
            const res = await providerAPI.createService(payload);
            setServices(prev => [...prev, transformService(res.data.data)]);
        } catch (err) {
            console.error('Add service error:', err);
            throw err;
        }
    };

    const deleteService = async (serviceId) => {
        try {
            await providerAPI.deleteService(serviceId);
            setServices(prev => prev.filter(s => s.service_id !== serviceId));
        } catch (err) {
            console.error('Delete service error:', err);
        }
    };

    const updateService = async (serviceId, serviceData) => {
        try {
            const payload = {
                name: serviceData.service_name,
                description: serviceData.service_description || serviceData.service_name,
                category: serviceCategories.find(c => c.category_id === serviceData.service_category_id)?.category_name || 'Other',
                basePrice: serviceData.base_price,
                estimatedDuration: `${Math.round(serviceData.estimated_duration / 60)} hours`,
                vehicleTypes: ['Car'],
            };
            const res = await providerAPI.updateService(serviceId, payload);
            setServices(prev => prev.map(s => s.service_id === serviceId ? transformService(res.data.data) : s));
            return res.data;
        } catch (err) {
            console.error('Update service error:', err);
            throw err;
        }
    };

    const createDiscount = async (discountData) => {
        try {
            const payload = {
                discountCode: discountData.code,
                title: discountData.description,
                description: discountData.description,
                discountType: discountData.type === 'Percentage' ? 'percentage' : 'fixed',
                discountValue: discountData.value,
                minBookingAmount: discountData.min_order,
                maxDiscountAmount: discountData.max_discount,
                validFrom: discountData.valid_from || new Date(),
                validUntil: discountData.valid_until || new Date(Date.now() + 30 * 86400000),
            };
            const res = await providerAPI.createDiscount(payload);
            setDiscounts(prev => [...prev, transformDiscount(res.data.data)]);
        } catch (err) {
            console.error('Create discount error:', err);
            throw err;
        }
    };

    const createBooking = async (bookingData) => {
        try {
            const payload = {
                serviceProviderId: bookingData.provider_id,
                services: bookingData.services?.map(s => ({
                    serviceId: s.service_id,
                    serviceName: s.service_name,
                    unitPrice: s.unit_price,
                    quantity: s.quantity || 1,
                    lineTotal: s.line_total || s.unit_price
                })) || [],
                preferredDate: bookingData.preferred_date || bookingData.booking_date,
                preferredTimeSlot: bookingData.preferred_time || bookingData.booking_type,
                customerNotes: bookingData.special_instructions || bookingData.description,
                estimatedCost: bookingData.total_amount,
                serviceType: bookingData.services?.[0]?.service_name || bookingData.serviceType || 'General Service',
                vehicleDetails: bookingData.vehicleDetails || undefined,
                isEmergency: bookingData.isEmergency || false,
                customerLocation: bookingData.customerLocation || undefined,
            };
            const res = await customerAPI.createBooking(payload);
            const newBooking = transformBooking(res.data.data);
            setBookings(prev => [...prev, newBooking]);
            return newBooking;
        } catch (err) {
            console.error('Create booking error:', err);
            throw err;
        }
    };

    const deleteDiscount = async (discountId) => {
        try {
            await providerAPI.updateDiscount(discountId, { isActive: false });
            setDiscounts(prev => prev.filter(d => d.discount_id !== discountId));
        } catch (err) {
            console.error('Delete discount error:', err);
        }
    };

    const fetchCustomerDiscounts = async () => {
        try {
            const res = await customerAPI.getDiscounts();
            const raw = res.data.data || [];
            return raw.map(d => ({
                discount_id: d._id,
                code: d.discountCode,
                title: d.title,
                description: d.description,
                type: d.discountType === 'percentage' ? 'Percentage' : 'Fixed',
                value: d.discountValue,
                validUntil: d.validUntil,
                validFrom: d.validFrom,
                providerName: d.serviceProviderId?.businessName || d.serviceProviderId?.name || 'Service Provider',
                applicableServices: d.applicableServices?.map(s => s.name) || [],
                minBookingAmount: d.minBookingAmount || 0,
            }));
        } catch (err) {
            console.error('Fetch discounts error:', err);
            return [];
        }
    };

    const getNearbyProviders = async (lat, lng, radius = 20) => {
        try {
            const res = await customerAPI.getNearbyProviders(lat, lng, radius);
            return res.data.data || [];
        } catch (err) {
            console.error('Nearby providers error:', err);
            return [];
        }
    };

    const updateProfile = async (profileData) => {
        try {
            // Combine first_name/last_name into name if needed
            const payload = { ...profileData };
            if (payload.first_name !== undefined || payload.last_name !== undefined) {
                payload.name = [payload.first_name, payload.last_name].filter(Boolean).join(' ');
                delete payload.first_name;
                delete payload.last_name;
            }

            if (currentUser?.role === 'provider' || currentUser?.userType === 'serviceProvider') {
                const res = await providerAPI.updateProfile(payload);
                const updated = res.data.data;
                const nameParts = (updated.name || '').split(' ');
                setCurrentUser(prev => ({
                    ...prev,
                    ...updated,
                    first_name: nameParts[0] || '',
                    last_name: nameParts.slice(1).join(' ') || '',
                    company_name: updated.businessName || updated.name,
                }));
                return res.data;
            } else {
                const res = await customerAPI.updateProfile(payload);
                const updated = res.data.data;
                const nameParts = (updated.name || '').split(' ');
                setCurrentUser(prev => ({
                    ...prev,
                    ...updated,
                    first_name: nameParts[0] || '',
                    last_name: nameParts.slice(1).join(' ') || '',
                }));
                return res.data;
            }
        } catch (err) {
            console.error('Update profile error:', err);
            throw err;
        }
    };

    const value = {
        // State
        currentUser,
        loading,
        providers,
        services,
        bookings,
        discounts,
        reviews,
        serviceCategories,
        bookingStatuses,

        // Auth
        loginCustomer,
        loginProvider,
        sendOTP,
        sendOTPAfterLogin,
        loginWithOTP,
        registerCustomer,
        registerProvider,
        logout,

        // Getters
        getBookingsByCustomerId,
        getBookingsByProviderId,
        getVehiclesByCustomerId,
        getServicesByProviderId,
        getIssuesByBookingId,
        getCommunicationsByBookingId,
        getStatusHistoryByBookingId,
        getStatusInfo,
        getDiscountsByProviderId,
        getReviewsByProviderId,
        getBusinessHoursByProviderId,
        getAddressesByCustomerId,

        // Actions
        updateBookingStatus,
        approveIssue,
        declineIssue,
        cancelBooking,
        sendMessage,
        addVehicle,
        deleteVehicle,
        addReview,
        addIssue,
        addService,
        deleteService,
        updateService,
        createBooking,
        createDiscount,
        deleteDiscount,
        fetchCustomerDiscounts,
        updateProfile,
        getNearbyProviders,
    };

    return (
        <MockDataContext.Provider value={value}>
            {children}
        </MockDataContext.Provider>
    );
};

export default MockDataContext;
