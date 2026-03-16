import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, Wrench, Tag, Settings,
    Search, Plus, Car, Clock, MapPin,
    ChevronDown, ChevronRight, CheckCircle, XCircle, DollarSign,
    AlertTriangle, TrendingUp, Star, Users, Eye,
    ArrowRight, Filter, Edit2, Trash2, BarChart3, PieChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import StatusTimeline from '../../components/booking/StatusTimeline';
import { useMockData } from '../../context/MockDataContext';
import styles from './ServiceDashboard.module.css';

const ServiceDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [showAddIssue, setShowAddIssue] = useState(null);
    const [showAddDiscount, setShowAddDiscount] = useState(false);
    const [issueForm, setIssueForm] = useState({ issue_description: '', severity: 'Moderate', issue_type: 'Mechanical', estimated_additional_cost: 0 });
    const [discountForm, setDiscountForm] = useState({ code: '', type: 'Percentage', value: 10, min_order: 0, max_discount: 0, description: '', valid_from: '', valid_until: '' });
    const [showAddService, setShowAddService] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceForm, setServiceForm] = useState({ service_name: '', service_description: '', base_price: 0, estimated_duration: 60, service_category_id: 1, price_type: 'Fixed' });

    // Accept Modal state
    const [acceptModal, setAcceptModal] = useState(null); // { bookingId, booking }
    // Emergency popup state
    const [emergencyPopup, setEmergencyPopup] = useState(null); // booking data from socket
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const [acceptForm, setAcceptForm] = useState({
        confirmedDate: tomorrow.toISOString().split('T')[0],
        pickUpDate: tomorrow.toISOString().split('T')[0],
        dropOffDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        serviceProviderNotes: ''
    });

    const {
        currentUser, providers, services, loading,
        getBookingsByProviderId, getServicesByProviderId, getIssuesByBookingId,
        getCommunicationsByBookingId, getStatusInfo, getStatusHistoryByBookingId,
        getDiscountsByProviderId, getReviewsByProviderId, getBusinessHoursByProviderId,
        bookingStatuses, serviceCategories, bookings,
        updateBookingStatus, addIssue, addService, deleteService, updateService,
        createDiscount, deleteDiscount, sendMessage
    } = useMockData();

    const providerId = currentUser?.provider_id;

    // Socket connection for real-time emergency notifications
    useEffect(() => {
        if (!providerId) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const serverUrl = apiUrl.replace(/\/api\/?$/, '');
        const socket = io(serverUrl, { withCredentials: true, reconnection: true });

        socket.emit('join', providerId);

        socket.on('newBooking', (data) => {
            const { booking, isEmergency } = data;
            if (isEmergency) {
                setEmergencyPopup(booking);
                toast('🚨 New EMERGENCY booking!', { icon: '🔴', duration: 10000 });
            } else {
                toast.success('📋 New booking request received!');
            }
        });

        socket.on('bookingStatusUpdate', () => {
            // Data will be refreshed via polling/context
        });

        return () => socket.close();
    }, [providerId]);

    const providerBookings = useMemo(() => providerId ? getBookingsByProviderId(providerId) : [], [providerId, getBookingsByProviderId, bookings]);
    const providerServices = useMemo(() => providerId ? getServicesByProviderId(providerId) : [], [providerId, getServicesByProviderId, services]);
    const providerDiscounts = useMemo(() => providerId ? getDiscountsByProviderId(providerId) : [], [providerId, getDiscountsByProviderId]);
    const providerReviews = useMemo(() => providerId ? getReviewsByProviderId(providerId) : [], [providerId, getReviewsByProviderId]);

    // Stats
    const pendingBookings = providerBookings.filter(b => b.current_status === 'PENDING');
    const activeBookings = providerBookings.filter(b => !['COMPLETED', 'CANCELLED', 'DECLINED', 'PENDING'].includes(b.current_status));
    const completedBookings = providerBookings.filter(b => b.current_status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const avgRating = providerReviews.length > 0 ? (providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length).toFixed(1) : '0.0';

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        if (bookingFilter === 'pending') return pendingBookings;
        if (bookingFilter === 'active') return activeBookings;
        if (bookingFilter === 'completed') return completedBookings;
        return providerBookings;
    }, [bookingFilter, providerBookings, pendingBookings, activeBookings, completedBookings]);

    // Status flow for next-status
    const statusFlow = ['PENDING', 'ACCEPTED', 'PICKUP_SCHEDULED', 'OUT_FOR_PICKUP', 'PICKED_UP', 'INSPECTION', 'ISSUES_IDENTIFIED', 'ESTIMATE_APPROVED', 'PARTS_ORDERED', 'PARTS_RECEIVED', 'WORK_IN_PROGRESS', 'QUALITY_CHECK', 'TESTING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];

    const getNextStatuses = (currentStatus) => {
        const idx = statusFlow.indexOf(currentStatus);
        if (idx === -1) return [];
        return statusFlow.slice(idx + 1, idx + 4);
    };


    const handleStatusUpdate = async (bookingId, newStatus) => {
        await updateBookingStatus(bookingId, newStatus);
        toast.success(`Status updated to ${getStatusInfo(newStatus)?.name || newStatus}`);
    };

    const openAcceptModal = (booking) => {
        setAcceptModal({ bookingId: booking.booking_id, booking });
    };

    const handleAcceptSubmit = async (e) => {
        e.preventDefault();
        if (!acceptForm.confirmedDate || !acceptForm.pickUpDate || !acceptForm.dropOffDate) {
            toast.error('Please fill all date fields'); return;
        }
        await updateBookingStatus(acceptModal.bookingId, 'ACCEPTED', {
            confirmedDate: acceptForm.confirmedDate,
            pickUpDate: acceptForm.pickUpDate,
            dropOffDate: acceptForm.dropOffDate,
            serviceProviderNotes: acceptForm.serviceProviderNotes
        });
        toast.success('Booking accepted! Customer has been notified.');
        setAcceptModal(null);
    };

    const handleDeclineBooking = (bookingId) => handleStatusUpdate(bookingId, 'DECLINED');

    const handleAddIssue = async (e) => {
        e.preventDefault();
        if (!issueForm.issue_description) { toast.error('Description is required'); return; }
        await addIssue(showAddIssue, issueForm);
        toast.success('Issue reported to customer');
        setShowAddIssue(null);
        setIssueForm({ issue_description: '', severity: 'Moderate', issue_type: 'Mechanical', estimated_additional_cost: 0 });
    };

    const handleSaveService = async (e) => {
        e.preventDefault();
        if (!serviceForm.service_name || !serviceForm.base_price) { toast.error('Name and price are required'); return; }
        
        if (editingServiceId) {
            await updateService(editingServiceId, serviceForm);
            toast.success('Service updated!');
        } else {
            await addService(serviceForm);
            toast.success('Service added!');
        }
        
        setShowAddService(false);
        setEditingServiceId(null);
        setServiceForm({ service_name: '', service_description: '', base_price: 0, estimated_duration: 60, service_category_id: 1, price_type: 'Fixed' });
    };

    const handleEditServiceClick = (service) => {
        setServiceForm({
            service_name: service.service_name,
            service_description: service.service_description,
            base_price: service.base_price,
            estimated_duration: service.estimated_duration,
            service_category_id: serviceCategories.find(c => c.category_name === service.category_name)?.category_id || 1,
            price_type: service.price_type || 'Fixed'
        });
        setEditingServiceId(service.service_id);
        setShowAddService(true);
    };

    const handleAddDiscount = async (e) => {
        e.preventDefault();
        if (!discountForm.description) { toast.error('Description is required'); return; }
        await createDiscount(discountForm);
        toast.success('Discount created!');
        setShowAddDiscount(false);
        setDiscountForm({ code: '', type: 'Percentage', value: 10, min_order: 0, max_discount: 0, description: '', valid_from: '', valid_until: '' });
    };

    if (loading) return <Loader />;
    if (!currentUser) { navigate('/provider/login'); return null; }

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: <LayoutDashboard size={18} /> },
        { id: 'bookings', label: 'Bookings', icon: <Briefcase size={18} />, badge: pendingBookings.length },
        { id: 'services', label: 'Services', icon: <Wrench size={18} /> },
        { id: 'discounts', label: 'Discounts', icon: <Tag size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
    ];

    return (
        <div className={styles.dashboard}>
            {/* Emergency Booking Popup */}
            <AnimatePresence>
                {emergencyPopup && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(0,0,0,0.7)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: '20px',
                        }}
                        onClick={() => {}}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
                            style={{
                                background: 'linear-gradient(145deg, #1a1a2e, #16213e)',
                                borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%',
                                border: '2px solid #ef4444', boxShadow: '0 0 60px rgba(239,68,68,0.3)',
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px',
                                    animation: 'pulse 1.5s infinite',
                                }}>
                                    <AlertTriangle size={32} style={{ color: '#ef4444' }} />
                                </div>
                                <h2 style={{ color: '#ef4444', margin: '0 0 8px', fontSize: '1.5rem' }}>
                                    🚨 Emergency Booking!
                                </h2>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                    A customer needs immediate assistance
                                </p>
                            </div>

                            <div style={{
                                background: 'rgba(239,68,68,0.08)', borderRadius: '12px',
                                padding: '16px', marginBottom: '20px', border: '1px solid rgba(239,68,68,0.2)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Booking ID</span>
                                    <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{emergencyPopup.bookingId || 'New'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Service</span>
                                    <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{emergencyPopup.serviceType || 'Emergency Service'}</span>
                                </div>
                                {emergencyPopup.vehicleDetails && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Vehicle</span>
                                        <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                                            {emergencyPopup.vehicleDetails.make} {emergencyPopup.vehicleDetails.model}
                                        </span>
                                    </div>
                                )}
                                {emergencyPopup.customerLocation?.address && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                            <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />Location
                                        </span>
                                        <span style={{ color: '#f1f5f9', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>
                                            {emergencyPopup.customerLocation.address}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button
                                    style={{
                                        flex: 1, background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        border: 'none', padding: '14px', fontSize: '1rem', fontWeight: 700,
                                    }}
                                    onClick={() => {
                                        setActiveTab('bookings');
                                        setBookingFilter('pending');
                                        setEmergencyPopup(null);
                                        toast.success('Redirected to bookings. Please accept or decline.');
                                    }}
                                >
                                    <CheckCircle size={18} /> View & Accept
                                </Button>
                                <Button
                                    variant="outline"
                                    style={{ flex: 1, padding: '14px', fontSize: '1rem', borderColor: '#475569' }}
                                    onClick={() => setEmergencyPopup(null)}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Top Navbar */}
            <Navbar variant="dashboard" />

            {/* Horizontal Tab Bar */}
            <div className={styles.tabBar}>
                <div className={styles.tabBarInner}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`${styles.tabItem} ${activeTab === tab.id ? styles.activeTab : ''}`}
                            onClick={() => { setActiveTab(tab.id); setSelectedBooking(null); }}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.badge > 0 && <span className={styles.tabBadge}>{tab.badge}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content - Full Width */}
            <main className={styles.main}>
                <AnimatePresence mode="wait">

                    {/* ====== ANALYTICS TAB ====== */}
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>Dashboard</h2>
                                <span className={styles.headerDate}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}><Briefcase size={22} /></div>
                                    <div><strong>{providerBookings.length}</strong><span>Total Bookings</span></div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(255, 165, 0, 0.15)', color: '#FFA500' }}><Clock size={22} /></div>
                                    <div><strong>{activeBookings.length}</strong><span>Active</span></div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}><DollarSign size={22} /></div>
                                    <div><strong>₹{totalRevenue.toLocaleString()}</strong><span>Revenue</span></div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statIcon} style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308' }}><Star size={22} /></div>
                                    <div><strong>{avgRating}</strong><span>Rating ({providerReviews.length})</span></div>
                                </div>
                            </div>

                            {/* Quick Pending */}
                            {pendingBookings.length > 0 && (
                                <div className={styles.sectionBlock}>
                                    <div className={styles.sectionHeaderRow}>
                                        <h3>⏳ Pending Requests ({pendingBookings.length})</h3>
                                        <Button size="sm" variant="outline" onClick={() => { setActiveTab('bookings'); setBookingFilter('pending'); }}>View All</Button>
                                    </div>
                                    <div className={styles.pendingList}>
                                        {pendingBookings.slice(0, 3).map(booking => (
                                            <div key={booking.booking_id} className={styles.pendingCard}>
                                                <div className={styles.pendingInfo}>
                                                    <span className={styles.bookingNumber}>{booking.booking_number}</span>
                                                    {booking.isEmergency && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>🚨 EMERGENCY</span>}
                                                    <div className={styles.pendingServices}>
                                                        {booking.services?.map((s, i) => <span key={i}>{s.service_name}</span>).reduce((a, b) => [a, ', ', b])}
                                                    </div>
                                                    <span className={styles.pendingAmount}>₹{booking.total_amount?.toLocaleString()}</span>
                                                </div>
                                                <div className={styles.pendingActions}>
                                                    <Button size="sm" onClick={() => openAcceptModal(booking)}>
                                                        <CheckCircle size={14} /> Accept
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDeclineBooking(booking.booking_id)}>
                                                        <XCircle size={14} /> Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Status Distribution */}
                            <div className={styles.chartsGrid}>
                                <div className={styles.chartCard}>
                                    <h4><PieChart size={16} /> Booking Status Distribution</h4>
                                    <div className={styles.statusDistribution}>
                                        {['PENDING', 'ACCEPTED', 'WORK_IN_PROGRESS', 'COMPLETED'].map(status => {
                                            const count = providerBookings.filter(b => b.current_status === status).length;
                                            const info = getStatusInfo(status);
                                            if (count === 0) return null;
                                            return (
                                                <div key={status} className={styles.statusBar}>
                                                    <div className={styles.statusBarLabel}>
                                                        <span className={styles.statusDot} style={{ background: info?.color }}></span>
                                                        <span>{info?.name}</span>
                                                    </div>
                                                    <div className={styles.statusBarTrack}>
                                                        <div className={styles.statusBarFill} style={{ width: `${(count / providerBookings.length) * 100}%`, background: info?.color }}></div>
                                                    </div>
                                                    <span className={styles.statusBarCount}>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.chartCard}>
                                    <h4><BarChart3 size={16} /> Revenue by Service</h4>
                                    <div className={styles.revenueList}>
                                        {providerServices.map(service => {
                                            const serviceRevenue = completedBookings.reduce((sum, b) => {
                                                const match = b.services?.find(s => s.service_id === service.service_id);
                                                return sum + (match ? match.line_total : 0);
                                            }, 0);
                                            return (
                                                <div key={service.service_id} className={styles.revenueRow}>
                                                    <span>{service.service_name.split('(')[0].trim()}</span>
                                                    <strong>₹{serviceRevenue.toLocaleString()}</strong>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Reviews */}
                            {providerReviews.length > 0 && (
                                <div className={styles.sectionBlock}>
                                    <h3>Recent Reviews</h3>
                                    <div className={styles.reviewsList}>
                                        {providerReviews.slice(0, 3).map(review => (
                                            <div key={review.review_id} className={styles.reviewCard}>
                                                <div className={styles.reviewStars}>
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? 'var(--warning)' : 'transparent'} stroke={i < review.rating ? 'var(--warning)' : 'var(--text-muted)'} />
                                                    ))}
                                                </div>
                                                <p>{review.comment}</p>
                                                <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ====== BOOKINGS TAB ====== */}
                    {activeTab === 'bookings' && (
                        <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            {!selectedBooking ? (
                                <>
                                    <div className={styles.pageHeader}>
                                        <h2>Booking Management</h2>
                                    </div>

                                    <div className={styles.filterTabs}>
                                        {[
                                            { id: 'all', label: 'All', count: providerBookings.length },
                                            { id: 'pending', label: 'Pending', count: pendingBookings.length },
                                            { id: 'active', label: 'In Progress', count: activeBookings.length },
                                            { id: 'completed', label: 'Completed', count: completedBookings.length }
                                        ].map(f => (
                                            <button key={f.id} className={`${styles.filterTab} ${bookingFilter === f.id ? styles.activeFilter : ''}`} onClick={() => setBookingFilter(f.id)}>
                                                {f.label} <span className={styles.filterCount}>{f.count}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className={styles.bookingsList}>
                                        {filteredBookings.length === 0 ? (
                                            <div className={styles.emptyState}>
                                                <Briefcase size={48} />
                                                <h3>No bookings found</h3>
                                            </div>
                                        ) : (
                                            filteredBookings.map(booking => {
                                                const statusInfo = getStatusInfo(booking.current_status);
                                                const bookingIssues = getIssuesByBookingId(booking.booking_id);
                                                return (
                                                    <div key={booking.booking_id} className={styles.bookingCard}>
                                                        <div className={styles.bookingCardTop}>
                                                            <div className={styles.bookingMain}>
                                                                <span className={styles.bookingNumber}>{booking.booking_number}</span>
                                                                <div className={styles.bookingServicesList}>
                                                                    {booking.services?.map((s, i) => <span key={i} className={styles.serviceChip}>{s.service_name}</span>)}
                                                                </div>
                                                                <span className={styles.bookingDate}>
                                                                    <Clock size={12} /> {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    {' • '}{booking.booking_type}
                                                                </span>
                                                            </div>
                                                            <div className={styles.bookingRight}>
                                                                <Badge style={{ background: `${statusInfo?.color}20`, color: statusInfo?.color }}>
                                                                    {statusInfo?.name || booking.current_status}
                                                                </Badge>
                                                                <span className={styles.bookingAmount}>₹{booking.total_amount?.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        <div className={styles.bookingActions}>
                                                            {/* Accept/Decline for pending */}
                                                            {booking.current_status === 'PENDING' && (
                                                                <>
                                                                    {booking.isEmergency && (
                                                                        <span style={{ background: '#ef4444', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>🚨 EMERGENCY — High Priority</span>
                                                                    )}
                                                                    <Button size="sm" onClick={() => openAcceptModal(booking)}>
                                                                        <CheckCircle size={14} /> Accept
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" onClick={() => handleDeclineBooking(booking.booking_id)}>
                                                                        <XCircle size={14} /> Decline
                                                                    </Button>
                                                                </>
                                                            )}

                                                            {/* Status update dropdown */}
                                                            {!['PENDING', 'COMPLETED', 'CANCELLED', 'DECLINED'].includes(booking.current_status) && (
                                                                <div className={styles.statusActions}>
                                                                    {getNextStatuses(booking.current_status).slice(0, 2).map(nextStatus => {
                                                                        const nextInfo = getStatusInfo(nextStatus);
                                                                        return (
                                                                            <Button key={nextStatus} size="sm" variant="outline" onClick={() => handleStatusUpdate(booking.booking_id, nextStatus)}>
                                                                                <ArrowRight size={12} /> {nextInfo?.name}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                    <Button size="sm" variant="outline" onClick={() => setShowAddIssue(booking.booking_id)}>
                                                                        <AlertTriangle size={12} /> Report Issue
                                                                    </Button>
                                                                </div>
                                                            )}

                                                            <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                                                <Eye size={12} /> Details
                                                            </Button>
                                                        </div>

                                                        {/* Add Issue Form (inline) */}
                                                        {showAddIssue === booking.booking_id && (
                                                            <form onSubmit={handleAddIssue} className={styles.inlineForm}>
                                                                <h5>Report Issue</h5>
                                                                <div className={styles.formRow}>
                                                                    <div className={styles.formGroup}>
                                                                        <label>Description</label>
                                                                        <input value={issueForm.issue_description} onChange={e => setIssueForm(p => ({ ...p, issue_description: e.target.value }))} placeholder="Describe the issue..." />
                                                                    </div>
                                                                    <div className={styles.formGroup}>
                                                                        <label>Severity</label>
                                                                        <select value={issueForm.severity} onChange={e => setIssueForm(p => ({ ...p, severity: e.target.value }))}>
                                                                            <option>Minor</option><option>Moderate</option><option>Major</option><option>Critical</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className={styles.formGroup}>
                                                                        <label>Est. Cost (₹)</label>
                                                                        <input type="number" value={issueForm.estimated_additional_cost} onChange={e => setIssueForm(p => ({ ...p, estimated_additional_cost: parseFloat(e.target.value) || 0 }))} />
                                                                    </div>
                                                                </div>
                                                                <div className={styles.formActions}>
                                                                    <Button type="submit" size="sm">Submit Issue</Button>
                                                                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAddIssue(null)}>Cancel</Button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Booking Detail */
                                <ProviderBookingDetail
                                    booking={selectedBooking}
                                    onBack={() => setSelectedBooking(null)}
                                    getStatusInfo={getStatusInfo}
                                    getIssuesByBookingId={getIssuesByBookingId}
                                    getCommunicationsByBookingId={getCommunicationsByBookingId}
                                    sendMessage={sendMessage}
                                    currentUser={currentUser}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* ====== SERVICES TAB ====== */}
                    {activeTab === 'services' && (
                        <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>My Services</h2>
                                <Button onClick={() => { setEditingServiceId(null); setServiceForm({ service_name: '', service_description: '', base_price: 0, estimated_duration: 60, service_category_id: 1, price_type: 'Fixed' }); setShowAddService(true); }}>
                                    <Plus size={16} /> Add Service
                                </Button>
                            </div>

                            {showAddService && (
                                <form onSubmit={handleSaveService} className={styles.formCard}>
                                    <h4>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Service Name *</label>
                                            <input value={serviceForm.service_name} onChange={e => setServiceForm(p => ({ ...p, service_name: e.target.value }))} placeholder="e.g. Brake Pad Replacement" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Category</label>
                                            <select value={serviceForm.service_category_id} onChange={e => setServiceForm(p => ({ ...p, service_category_id: parseInt(e.target.value) }))}>
                                                {serviceCategories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Base Price (₹) *</label>
                                            <input type="number" value={serviceForm.base_price} onChange={e => setServiceForm(p => ({ ...p, base_price: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Description</label>
                                            <input value={serviceForm.service_description} onChange={e => setServiceForm(p => ({ ...p, service_description: e.target.value }))} placeholder="Description..." />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Duration (min)</label>
                                            <input type="number" value={serviceForm.estimated_duration} onChange={e => setServiceForm(p => ({ ...p, estimated_duration: parseInt(e.target.value) || 60 }))} />
                                        </div>
                                    </div>
                                    <div className={styles.formActions}>
                                        <Button type="submit" size="sm">{editingServiceId ? 'Update Service' : 'Save Service'}</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setShowAddService(false); setEditingServiceId(null); }}>Cancel</Button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.servicesList}>
                                {providerServices.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Wrench size={48} />
                                        <h3>No services yet</h3>
                                        <p>Add your first service to start receiving bookings.</p>
                                        <Button onClick={() => setShowAddService(true)}>Add Service</Button>
                                    </div>
                                ) : (
                                    providerServices.map(service => {
                                        const cat = serviceCategories.find(c => c.category_id === service.service_category_id);
                                        return (
                                            <div key={service.service_id} className={styles.serviceCard}>
                                                <div className={styles.serviceIcon}><Wrench size={20} /></div>
                                                <div className={styles.serviceInfo}>
                                                    <div className={styles.serviceHeader}>
                                                        <h4>{service.service_name}</h4>
                                                        {service.popular_service && <Badge variant="destructive">Popular</Badge>}
                                                    </div>
                                                    <p>{service.service_description}</p>
                                                    <div className={styles.serviceMeta}>
                                                        <span className={styles.servicePrice}>₹{service.base_price.toLocaleString()}</span>
                                                        <span><Clock size={12} /> {Math.round(service.estimated_duration / 60)}h</span>
                                                        {cat && <span>{cat.category_name}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', zIndex: 2 }}>
                                                    <button className={styles.editBtn} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }} onClick={() => handleEditServiceClick(service)}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className={styles.deleteBtn} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }} onClick={() => { deleteService(service.service_id); toast.success('Service removed'); }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ====== DISCOUNTS TAB ====== */}
                    {activeTab === 'discounts' && (
                        <motion.div key="discounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>Discount Management</h2>
                                <Button onClick={() => setShowAddDiscount(true)}>
                                    <Plus size={16} /> Create Discount
                                </Button>
                            </div>

                            {showAddDiscount && (
                                <form onSubmit={handleAddDiscount} className={styles.formCard}>
                                    <h4>Create Discount</h4>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Code (optional)</label>
                                            <input value={discountForm.code} onChange={e => setDiscountForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SUMMER20" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Type</label>
                                            <select value={discountForm.type} onChange={e => setDiscountForm(p => ({ ...p, type: e.target.value }))}>
                                                <option>Percentage</option><option>Fixed Amount</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Value</label>
                                            <input type="number" value={discountForm.value} onChange={e => setDiscountForm(p => ({ ...p, value: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Description *</label>
                                            <input value={discountForm.description} onChange={e => setDiscountForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. 20% off all services" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Min Order (₹)</label>
                                            <input type="number" value={discountForm.min_order} onChange={e => setDiscountForm(p => ({ ...p, min_order: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Max Discount (₹)</label>
                                            <input type="number" value={discountForm.max_discount} onChange={e => setDiscountForm(p => ({ ...p, max_discount: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Valid From</label>
                                            <input type="date" value={discountForm.valid_from} onChange={e => setDiscountForm(p => ({ ...p, valid_from: e.target.value }))} />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Valid Until</label>
                                            <input type="date" value={discountForm.valid_until} onChange={e => setDiscountForm(p => ({ ...p, valid_until: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className={styles.formActions}>
                                        <Button type="submit" size="sm">Create Discount</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setShowAddDiscount(false)}>Cancel</Button>
                                    </div>
                                </form>
                            )}

                            <div className={styles.discountsList}>
                                {providerDiscounts.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Tag size={48} />
                                        <h3>No discounts created</h3>
                                        <p>Create your first discount to attract more customers.</p>
                                        <Button onClick={() => setShowAddDiscount(true)}>Create Discount</Button>
                                    </div>
                                ) : (
                                    providerDiscounts.map(d => (
                                        <div key={d.discount_id} className={styles.discountCard}>
                                            <div className={styles.discountTop}>
                                                <span className={styles.discountValue}>
                                                    {d.type === 'Percentage' ? `${d.value}% OFF` : `₹${d.value} OFF`}
                                                </span>
                                                <Badge variant={d.is_active ? 'success' : 'danger'}>{d.is_active ? 'Active' : 'Inactive'}</Badge>
                                            </div>
                                            <p>{d.description}</p>
                                            {d.code && <div className={styles.codeBox}>{d.code}</div>}
                                            <div className={styles.discountMeta}>
                                                {d.min_order > 0 && <span>Min ₹{d.min_order}</span>}
                                                {d.max_discount > 0 && <span>Max ₹{d.max_discount} off</span>}
                                                {d.valid_until && <span>Until {d.valid_until}</span>}
                                            </div>
                                            <button className={styles.deleteBtn} onClick={() => { deleteDiscount(d.discount_id); toast.success('Discount deleted'); }}>
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ====== SETTINGS TAB ====== */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>Business Settings</h2>
                            </div>

                            <div className={styles.settingsSections}>
                                <div className={styles.settingsCard}>
                                    <h4>Business Profile</h4>
                                    <div className={styles.settingsFields}>
                                        <div className={styles.settingsField}>
                                            <label>Company Name</label>
                                            <span>{currentUser.company_name}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Email</label>
                                            <span>{currentUser.email}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Phone</label>
                                            <span>{currentUser.phone}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Address</label>
                                            <span>{currentUser.address}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Year Established</label>
                                            <span>{currentUser.year_established}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Employees</label>
                                            <span>{currentUser.total_employees}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.settingsCard}>
                                    <h4>Amenities</h4>
                                    <div className={styles.amenitiesList}>
                                        {currentUser.amenities?.map((a, i) => (
                                            <span key={i} className={styles.amenityTag}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* ===== ACCEPT BOOKING MODAL ===== */}
            <AnimatePresence>
                {acceptModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setAcceptModal(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{ background: 'var(--bg-card, #1e293b)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border, #334155)' }}
                        >
                            <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary, #f1f5f9)', fontSize: '1.2rem' }}>✅ Accept Booking</h3>
                            <p style={{ margin: '0 0 20px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                                Booking #{acceptModal.booking?.booking_number} — {acceptModal.booking?.services?.map(s => s.service_name).join(', ')}
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Left: Form */}
                                <form onSubmit={handleAcceptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', marginBottom: '6px', display: 'block' }}>📅 Confirmed Service Date *</label>
                                        <input type="date" required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={acceptForm.confirmedDate}
                                            onChange={e => setAcceptForm(p => ({ ...p, confirmedDate: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #334155)', background: 'var(--bg-input, #0f172a)', color: 'var(--text-primary, #f1f5f9)', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', marginBottom: '6px', display: 'block' }}>🚗 Vehicle Pickup Date *</label>
                                        <input type="date" required
                                            min={new Date().toISOString().split('T')[0]}
                                            value={acceptForm.pickUpDate}
                                            onChange={e => setAcceptForm(p => ({ ...p, pickUpDate: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #334155)', background: 'var(--bg-input, #0f172a)', color: 'var(--text-primary, #f1f5f9)', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', marginBottom: '6px', display: 'block' }}>📦 Estimated Delivery Date *</label>
                                        <input type="date" required
                                            min={acceptForm.pickUpDate || new Date().toISOString().split('T')[0]}
                                            value={acceptForm.dropOffDate}
                                            onChange={e => setAcceptForm(p => ({ ...p, dropOffDate: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #334155)', background: 'var(--bg-input, #0f172a)', color: 'var(--text-primary, #f1f5f9)', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', marginBottom: '6px', display: 'block' }}>📝 Notes (optional)</label>
                                        <textarea rows={3} placeholder="Notes for the customer or your team..."
                                            value={acceptForm.serviceProviderNotes}
                                            onChange={e => setAcceptForm(p => ({ ...p, serviceProviderNotes: e.target.value }))}
                                            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border, #334155)', background: 'var(--bg-input, #0f172a)', color: 'var(--text-primary, #f1f5f9)', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                        <Button type="submit" style={{ flex: 1 }}><CheckCircle size={14} /> Confirm Accept</Button>
                                        <Button type="button" variant="outline" onClick={() => setAcceptModal(null)}>Cancel</Button>
                                    </div>
                                </form>
                                {/* Right: Schedule Sidebar */}
                                <div>
                                    <h4 style={{ margin: '0 0 12px', color: 'var(--text-primary, #f1f5f9)', fontSize: '0.95rem' }}>📆 Your Current Schedule</h4>
                                    {(() => {
                                        const scheduledBookings = providerBookings.filter(b =>
                                            !['CANCELLED', 'DECLINED', 'COMPLETED', 'PENDING'].includes(b.current_status)
                                        ).slice(0, 6);
                                        if (scheduledBookings.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active bookings — you're wide open!</p>;
                                        return scheduledBookings.map(b => {
                                            const si = getStatusInfo(b.current_status);
                                            return (
                                                <div key={b.booking_id} style={{ background: 'var(--bg-surface, #0f172a)', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', borderLeft: `3px solid ${si?.color || '#3B82F6'}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>#{b.booking_number}</span>
                                                        <span style={{ fontSize: '0.75rem', color: si?.color, fontWeight: 600 }}>{si?.name}</span>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{b.services?.map(s => s.service_name).join(', ')}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        📅 {b.confirmed_date ? new Date(b.confirmed_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : new Date(b.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        {b.dropoff_date && ` → ${new Date(b.dropoff_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ====== PROVIDER BOOKING DETAIL ====== */
const ProviderBookingDetail = ({ booking, onBack, getStatusInfo, getIssuesByBookingId, getCommunicationsByBookingId, sendMessage, currentUser }) => {
    const [messageInput, setMessageInput] = useState('');
    const statusInfo = getStatusInfo(booking.current_status);
    const issues = getIssuesByBookingId(booking.booking_id);
    const comms = getCommunicationsByBookingId(booking.booking_id);

    const handleSend = async () => {
        if (!messageInput.trim()) return;
        await sendMessage(booking.booking_id, messageInput);
        setMessageInput('');
        toast.success('Message sent!');
    };

    return (
        <div className={styles.bookingDetail}>
            <button className={styles.backBtn} onClick={onBack}>← Back to Bookings</button>

            <div className={styles.detailHeader}>
                <div>
                    <h2>{booking.booking_number}</h2>
                    <span className={styles.bookingDate}>
                        <Clock size={14} /> {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' • '}{booking.booking_type}
                    </span>
                </div>
                <Badge style={{ background: `${statusInfo?.color}20`, color: statusInfo?.color, fontSize: '0.9rem', padding: '8px 16px' }}>
                    {statusInfo?.name}
                </Badge>
            </div>

            <div className={styles.detailSection}>
                <h4>Service Progress</h4>
                <StatusTimeline bookingId={booking.booking_id} currentStatus={booking.current_status} />
            </div>

            <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                    <h4>Services</h4>
                    <div className={styles.priceList}>
                        {booking.services?.map((s, i) => (
                            <div key={i} className={styles.priceRow}>
                                <span>{s.service_name}</span>
                                <span>₹{s.unit_price?.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className={styles.priceTotal}>
                            <strong>Total</strong>
                            <strong>₹{booking.total_amount?.toLocaleString()}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.detailSection}>
                    <h4>Details</h4>
                    <div className={styles.detailFields}>
                        <div><label>Payment</label><Badge variant={booking.payment_status === 'Paid' ? 'success' : 'warning'}>{booking.payment_status}</Badge></div>
                        <div><label>Preferred Date</label><span>{booking.preferred_date || 'N/A'}</span></div>
                        {booking.special_instructions && <div><label>Notes</label><span>{booking.special_instructions}</span></div>}
                    </div>
                </div>
            </div>

            {issues.length > 0 && (
                <div className={styles.detailSection}>
                    <h4><AlertTriangle size={16} /> Reported Issues</h4>
                    <div className={styles.issuesList}>
                        {issues.map(issue => (
                            <div key={issue.issue_id} className={styles.issueCard}>
                                <div className={styles.issueTop}>
                                    <Badge variant={issue.severity === 'Major' ? 'danger' : 'warning'}>{issue.severity}</Badge>
                                    <Badge variant={issue.issue_status === 'Approved' ? 'success' : issue.issue_status === 'Declined' ? 'danger' : 'warning'}>{issue.issue_status}</Badge>
                                </div>
                                <p>{issue.issue_description}</p>
                                <span className={styles.issueCost}>+ ₹{issue.estimated_additional_cost?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.detailSection}>
                <h4>Messages</h4>
                <div className={styles.chatBox}>
                    {comms.length === 0 ? (
                        <p className={styles.noMessages}>No messages yet.</p>
                    ) : (
                        comms.map(msg => (
                            <div key={msg.comm_id} className={`${styles.chatMsg} ${msg.sender_type === 'Provider' ? styles.sent : styles.received}`}>
                                <span className={styles.chatSender}>{msg.sender_type}</span>
                                <p>{msg.message}</p>
                                <span className={styles.chatTime}>{new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className={styles.chatInput}>
                    <input placeholder="Type a message..." value={messageInput} onChange={e => setMessageInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} />
                    <Button size="sm" onClick={handleSend}>Send</Button>
                </div>
            </div>
        </div>
    );
};

export default ServiceDashboard;

