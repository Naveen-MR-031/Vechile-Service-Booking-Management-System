import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Home, CalendarCheck, Tag, Car, Settings, Search,
    Plus, Star, MapPin, Clock, ChevronRight, AlertTriangle,
    CheckCircle, XCircle, MessageSquare, Eye, Filter, Phone,
    Mail, Edit2, Trash2, CreditCard, Bell, Moon, Sun,
    Shield, Wrench, Droplets, Battery, Snowflake, Sparkles, Zap, CircleDot,
    Gauge, Fuel, Cog, Palette, ArrowRight, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import StatusTimeline from '../../components/booking/StatusTimeline';
import InvoiceView from '../../components/booking/InvoiceView';
import { useMockData } from '../../context/MockDataContext';
import styles from './CustomerDashboard.module.css';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'home';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingFilter, setBookingFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);
    const [vehicleForm, setVehicleForm] = useState({ make: '', model: '', year: new Date().getFullYear(), registration_number: '', vehicle_type: 'Sedan', fuel_type: 'Petrol', color: '' });

    const {
        currentUser, providers, services, loading, serviceCategories,
        getBookingsByCustomerId, getVehiclesByCustomerId, getAddressesByCustomerId,
        getStatusHistoryByBookingId, getIssuesByBookingId, getCommunicationsByBookingId,
        getStatusInfo, discounts, reviews, bookingStatuses,
        approveIssue, declineIssue, cancelBooking, sendMessage,
        addVehicle, deleteVehicle, addReview
    } = useMockData();

    // Get user-specific data
    const customerId = currentUser?.customer_id;
    const userBookings = useMemo(() => customerId ? getBookingsByCustomerId(customerId) : [], [customerId, getBookingsByCustomerId]);
    const userVehicles = useMemo(() => customerId ? getVehiclesByCustomerId(customerId) : [], [customerId, getVehiclesByCustomerId]);

    // Booking stats
    const activeBookings = userBookings.filter(b => !['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.current_status));
    const completedBookings = userBookings.filter(b => b.current_status === 'COMPLETED');
    const cancelledBookings = userBookings.filter(b => ['CANCELLED', 'DECLINED'].includes(b.current_status));
    const totalSpent = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const activeDiscounts = useMemo(() => discounts.filter(d => {
        if (!d.is_active) return false;
        if (d.valid_until && new Date(d.valid_until) < new Date()) return false;
        return true;
    }), [discounts]);

    // Category icon mapping
    const categoryIcons = {
        'Wrench': <Wrench size={22} />,
        'Droplets': <Droplets size={22} />,
        'Circle': <CircleDot size={22} />,
        'Battery': <Battery size={22} />,
        'AlertTriangle': <AlertTriangle size={22} />,
        'Settings': <Settings size={22} />,
        'Snowflake': <Snowflake size={22} />,
        'Sparkles': <Sparkles size={22} />
    };
    const categoryColors = [
        'rgba(59, 130, 246, 0.15)',
        'rgba(34, 197, 94, 0.15)',
        'rgba(234, 179, 8, 0.15)',
        'rgba(239, 68, 68, 0.15)',
        'rgba(168, 85, 247, 0.15)',
        'rgba(14, 165, 233, 0.15)',
        'rgba(99, 102, 241, 0.15)',
        'rgba(236, 72, 153, 0.15)'
    ];
    const categoryTextColors = [
        '#3B82F6', '#22C55E', '#EAB308', '#EF4444',
        '#A855F7', '#0EA5E3', '#6366F1', '#EC4899'
    ];

    // Filter bookings
    const filteredBookings = useMemo(() => {
        let filtered = userBookings;
        if (bookingFilter === 'active') filtered = activeBookings;
        else if (bookingFilter === 'completed') filtered = completedBookings;
        else if (bookingFilter === 'cancelled') filtered = cancelledBookings;
        return filtered;
    }, [bookingFilter, userBookings, activeBookings, completedBookings, cancelledBookings]);

    // Filtered providers by search
    const filteredProviders = useMemo(() => {
        if (!searchQuery) return providers;
        const q = searchQuery.toLowerCase();
        return providers.filter(p => p.company_name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
    }, [providers, searchQuery]);

    // Search suggestions (services + providers)
    const searchSuggestions = useMemo(() => {
        if (!searchQuery || searchQuery.length < 2) return { services: [], providers: [] };
        const q = searchQuery.toLowerCase();
        const matchedServices = services
            .filter(s => s.is_active && (s.service_name.toLowerCase().includes(q) || s.service_description?.toLowerCase().includes(q)))
            .slice(0, 5);
        const matchedProviders = providers
            .filter(p => p.company_name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
            .slice(0, 5);
        return { services: matchedServices, providers: matchedProviders };
    }, [searchQuery, services, providers]);

    const hasSuggestions = searchSuggestions.services.length > 0 || searchSuggestions.providers.length > 0;


    const handleApproveIssue = async (issueId) => {
        await approveIssue(issueId);
        toast.success('Issue approved! Cost will be added to your booking.');
    };

    const handleDeclineIssue = async (issueId) => {
        await declineIssue(issueId);
        toast.success('Issue declined.');
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            await cancelBooking(bookingId);
            toast.success('Booking cancelled.');
            setSelectedBooking(null);
        }
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.registration_number) {
            toast.error('Please fill in all required fields');
            return;
        }
        await addVehicle(vehicleForm);
        toast.success('Vehicle added successfully!');
        setShowAddVehicle(false);
        setVehicleForm({ make: '', model: '', year: new Date().getFullYear(), registration_number: '', vehicle_type: 'Sedan', fuel_type: 'Petrol', color: '' });
    };

    const handleDeleteVehicle = async (vehicleId) => {
        if (window.confirm('Remove this vehicle?')) {
            await deleteVehicle(vehicleId);
            toast.success('Vehicle removed.');
        }
    };

    if (loading) return <Loader />;

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    const tabs = [
        { id: 'home', label: 'Home', icon: <Home size={18} /> },
        { id: 'bookings', label: 'My Bookings', icon: <CalendarCheck size={18} /> },
        { id: 'discounts', label: 'Discounts', icon: <Tag size={18} /> },
        { id: 'vehicles', label: 'My Vehicles', icon: <Car size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> }
    ];

    return (
        <div className={styles.dashboard}>
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
                            {tab.id === 'bookings' && activeBookings.length > 0 && (
                                <span className={styles.tabBadge}>{activeBookings.length}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content - Full Width */}
            <main className={styles.main}>
                <AnimatePresence mode="wait">
                    {/* ====== HOME TAB ====== */}
                    {activeTab === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>

                            {/* Hero Search Section with floating icons */}
                            <div className={styles.heroSection}>
                                {/* Floating decorative icons */}
                                <Car size={60} className={styles.floatingIcon} />
                                <Wrench size={45} className={styles.floatingIcon} />
                                <Settings size={50} className={styles.floatingIcon} />
                                <Star size={35} className={styles.floatingIcon} />
                                <Shield size={40} className={styles.floatingIcon} />

                                <div className={styles.heroContent}>
                                    <h1 className={styles.heroTitle}>Find the perfect service for your vehicle</h1>
                                    <p className={styles.heroSubtitle}>Book trusted service centers near you — fast, transparent, and hassle-free</p>
                                    <div className={styles.heroSearch}>
                                        <Search size={20} className={styles.heroSearchIcon} />
                                        <input
                                            className={styles.heroSearchInput}
                                            placeholder="Search by service center, service type, or location..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                        />
                                        <button className={styles.heroSearchBtn} onClick={() => searchQuery && setActiveTab('home')}>
                                            Search
                                        </button>

                                        {/* Search Suggestions Dropdown */}
                                        {searchFocused && hasSuggestions && (
                                            <div className={styles.searchSuggestionsDropdown}>
                                                {searchSuggestions.services.length > 0 && (
                                                    <div className={styles.suggestionGroup}>
                                                        <span className={styles.suggestionLabel}><Wrench size={14} /> Services</span>
                                                        {searchSuggestions.services.map(s => (
                                                            <button
                                                                key={s.service_id}
                                                                className={styles.suggestionItem}
                                                                onClick={() => {
                                                                    navigate(`/book-service?category=${s.service_category_id}`);
                                                                    setSearchQuery('');
                                                                }}
                                                            >
                                                                <span className={styles.suggestionName}>{s.service_name}</span>
                                                                <span className={styles.suggestionPrice}>₹{s.base_price?.toLocaleString()}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {searchSuggestions.providers.length > 0 && (
                                                    <div className={styles.suggestionGroup}>
                                                        <span className={styles.suggestionLabel}><MapPin size={14} /> Service Centers</span>
                                                        {searchSuggestions.providers.map(p => (
                                                            <button
                                                                key={p.provider_id}
                                                                className={styles.suggestionItem}
                                                                onClick={() => {
                                                                    navigate(`/book-service?provider=${p.provider_id}`);
                                                                    setSearchQuery('');
                                                                }}
                                                            >
                                                                <span className={styles.suggestionName}>{p.company_name}</span>
                                                                <span className={styles.suggestionMeta}>{p.address.split(',')[0]}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Stats Cards with 3D tilt */}
                            <div className={styles.statsGrid}>
                                {[
                                    { icon: <CalendarCheck size={20} />, value: activeBookings.length, label: 'Active Bookings', bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--secondary)' },
                                    { icon: <CheckCircle size={20} />, value: completedBookings.length, label: 'Completed', bg: 'rgba(34, 197, 94, 0.15)', color: 'var(--success)' },
                                    { icon: <Car size={20} />, value: userVehicles.length, label: 'Vehicles', bg: 'rgba(234, 179, 8, 0.15)', color: 'var(--warning)' },
                                    { icon: <CreditCard size={20} />, value: `₹${totalSpent.toLocaleString()}`, label: 'Total Spent', bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--primary)' }
                                ].map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        className={styles.statCard}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1, duration: 0.4 }}
                                    >
                                        <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
                                        <div><strong>{stat.value}</strong><span>{stat.label}</span></div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Emergency Booking CTA */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.12))',
                                border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px',
                                padding: '20px 24px', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', marginBottom: '20px'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Zap size={18} style={{ color: '#ef4444' }} /> Need Emergency Service?
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        Find the nearest provider for immediate assistance
                                    </p>
                                </div>
                                <Button onClick={() => navigate('/emergency-booking')} style={{
                                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                    border: 'none', whiteSpace: 'nowrap'
                                }}>
                                    <Zap size={14} /> Emergency Book
                                </Button>
                            </div>

                            {/* Active Bookings Alert */}
                            {activeBookings.length > 0 && (
                                <div className={styles.sectionBlock}>
                                    <div className={styles.sectionHeaderRow}>
                                        <h3>🔔 Active Bookings</h3>
                                        <Button size="sm" variant="outline" onClick={() => setActiveTab('bookings')}>View All</Button>
                                    </div>
                                    <div className={styles.bookingsListCompact}>
                                        {activeBookings.map(booking => {
                                            const provider = providers.find(p => p.provider_id === booking.provider_id);
                                            const statusInfo = getStatusInfo(booking.current_status);
                                            return (
                                                <div key={booking.booking_id} className={styles.bookingCardCompact} onClick={() => { setActiveTab('bookings'); setSelectedBooking(booking); }}>
                                                    <div className={styles.bookingCompactLeft}>
                                                        <span className={styles.bookingNumber}>{booking.booking_number}</span>
                                                        <span className={styles.bookingProvider}>{provider?.company_name}</span>
                                                    </div>
                                                    <Badge variant={statusInfo?.color === '#28A745' ? 'success' : statusInfo?.color === '#FFA500' ? 'warning' : 'info'}>
                                                        {statusInfo?.name || booking.current_status}
                                                    </Badge>
                                                    <ChevronRight size={16} className={styles.chevron} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Service Categories with stagger animation */}
                            <div className={styles.sectionBlock}>
                                <h3>Browse Services</h3>
                                <div className={styles.categoriesGrid}>
                                    {serviceCategories.map((cat, idx) => (
                                        <motion.div
                                            key={cat.category_id}
                                            className={styles.categoryCard}
                                            onClick={() => navigate(`/book-service?category=${cat.category_id}`)}
                                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200, damping: 18 }}
                                            whileHover={{ rotateY: 8, rotateX: -5 }}
                                        >
                                            <div className={styles.categoryIcon} style={{ background: categoryColors[idx % categoryColors.length], color: categoryTextColors[idx % categoryTextColors.length] }}>
                                                {categoryIcons[cat.icon] || <Wrench size={22} />}
                                            </div>
                                            <span className={styles.categoryName}>{cat.category_name}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Featured Service Providers with stagger */}
                            <div className={styles.sectionBlock}>
                                <div className={styles.sectionHeaderRow}>
                                    <h3>⭐ Featured Service Centers</h3>
                                    <div className={styles.searchBox}>
                                        <Search size={16} />
                                        <input placeholder="Search by name or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </div>
                                </div>
                                <div className={styles.providersGrid}>
                                    {filteredProviders.map((provider, idx) => {
                                        const providerServices = services.filter(s => s.provider_id === provider.provider_id && s.is_active);
                                        const isVerified = provider.verification_status === 'Verified';
                                        return (
                                            <motion.div
                                                key={provider.provider_id}
                                                className={styles.providerCard}
                                                initial={{ opacity: 0, y: 40 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.12, duration: 0.5 }}
                                            >
                                                {/* Cover Image */}
                                                <div className={styles.providerCover}>
                                                    <img src={provider.cover_image} alt={provider.company_name} />
                                                    {isVerified && (
                                                        <span className={styles.verifiedBadge}>
                                                            <Shield size={12} /> Verified
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Card Body */}
                                                <div className={styles.providerBody}>
                                                    <div className={styles.providerCardHeader}>
                                                        <img src={provider.business_logo} alt={provider.company_name} className={styles.providerLogo} />
                                                        <div className={styles.providerInfo}>
                                                            <h4>{provider.company_name}</h4>
                                                            <span className={styles.providerLocation}><MapPin size={12} /> {provider.address.split(',')[0]}</span>
                                                        </div>
                                                    </div>
                                                    {/* Rating and reviews */}
                                                    <div className={styles.providerMeta}>
                                                        <span className={styles.providerRating}>
                                                            <Star size={14} fill="var(--warning)" stroke="var(--warning)" /> {provider.rating}
                                                        </span>
                                                        <span className={styles.providerReviewCount}>({provider.review_count} reviews)</span>
                                                        <span className={styles.providerYear}>Est. {provider.year_established}</span>
                                                    </div>
                                                    {/* Description */}
                                                    <p className={styles.providerDesc}>{provider.description}</p>
                                                    {/* Services */}
                                                    <div className={styles.providerTags}>
                                                        {providerServices.slice(0, 3).map(s => (
                                                            <span key={s.service_id} className={styles.tag}>{s.service_name.split('(')[0].trim()}</span>
                                                        ))}
                                                        {providerServices.length > 3 && <span className={styles.tagMore}>+{providerServices.length - 3} more</span>}
                                                    </div>
                                                    {/* Amenities */}
                                                    {provider.amenities && (
                                                        <div className={styles.amenitiesList}>
                                                            {provider.amenities.slice(0, 4).map((a, i) => (
                                                                <span key={i} className={styles.amenityTag}>{a}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* CTA */}
                                                    <Button size="sm" onClick={() => navigate(`/book-service?provider=${provider.provider_id}`)} style={{ width: '100%', marginTop: '12px' }}>
                                                        Book Now <ChevronRight size={14} />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ====== BOOKINGS TAB ====== */}
                    {activeTab === 'bookings' && (
                        <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            {!selectedBooking ? (
                                <>
                                    <div className={styles.pageHeader}>
                                        <h2>My Bookings</h2>
                                        <Button onClick={() => navigate('/book-service')}>
                                            <Plus size={16} /> New Booking
                                        </Button>
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className={styles.filterTabs}>
                                        {[
                                            { id: 'all', label: 'All', count: userBookings.length },
                                            { id: 'active', label: 'Active', count: activeBookings.length },
                                            { id: 'completed', label: 'Completed', count: completedBookings.length },
                                            { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length }
                                        ].map(f => (
                                            <button key={f.id} className={`${styles.filterTab} ${bookingFilter === f.id ? styles.activeFilter : ''}`} onClick={() => setBookingFilter(f.id)}>
                                                {f.label} <span className={styles.filterCount}>{f.count}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Booking Cards */}
                                    <div className={styles.bookingsList}>
                                        {filteredBookings.length === 0 ? (
                                            <div className={styles.emptyState}>
                                                <CalendarCheck size={48} />
                                                <h3>No bookings found</h3>
                                                <p>Book your first vehicle service today!</p>
                                                <Button onClick={() => navigate('/book-service')}>Book Now</Button>
                                            </div>
                                        ) : (
                                            filteredBookings.map(booking => {
                                                const provider = providers.find(p => p.provider_id === booking.provider_id);
                                                const statusInfo = getStatusInfo(booking.current_status);
                                                const bookingIssues = getIssuesByBookingId(booking.booking_id);
                                                const pendingIssues = bookingIssues.filter(i => i.issue_status === 'Pending Approval');
                                                return (
                                                    <div key={booking.booking_id} className={styles.bookingCard} onClick={() => setSelectedBooking(booking)}>
                                                        <div className={styles.bookingCardTop}>
                                                            <div className={styles.bookingMain}>
                                                                <span className={styles.bookingNumber}>{booking.booking_number}</span>
                                                                <h4>{provider?.company_name}</h4>
                                                                <span className={styles.bookingDate}>
                                                                    <Clock size={14} /> {new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <div className={styles.bookingRight}>
                                                                <Badge style={{ background: `${statusInfo?.color}20`, color: statusInfo?.color }}>
                                                                    {statusInfo?.name || booking.current_status}
                                                                </Badge>
                                                                <span className={styles.bookingAmount}>₹{booking.total_amount?.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.bookingServices}>
                                                            {booking.services?.map((s, i) => (
                                                                <span key={i} className={styles.serviceChip}>{s.service_name}</span>
                                                            ))}
                                                        </div>
                                                        {pendingIssues.length > 0 && (
                                                            <div className={styles.issueAlert}>
                                                                <AlertTriangle size={14} /> {pendingIssues.length} issue(s) need your approval
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Booking Detail View */
                                <BookingDetail
                                    booking={selectedBooking}
                                    onBack={() => setSelectedBooking(null)}
                                    providers={providers}
                                    getStatusInfo={getStatusInfo}
                                    getIssuesByBookingId={getIssuesByBookingId}
                                    getCommunicationsByBookingId={getCommunicationsByBookingId}
                                    onApproveIssue={handleApproveIssue}
                                    onDeclineIssue={handleDeclineIssue}
                                    onCancelBooking={handleCancelBooking}
                                    sendMessage={sendMessage}
                                    currentUser={currentUser}
                                />
                            )}
                        </motion.div>
                    )}

                    {/* ====== DISCOUNTS TAB ====== */}
                    {activeTab === 'discounts' && (
                        <motion.div key="discounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>Active Discounts & Offers</h2>
                            </div>
                            <div className={styles.discountsGrid}>
                                {activeDiscounts.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Tag size={48} />
                                        <h3>No active offers</h3>
                                        <p>Check back later for exciting deals!</p>
                                    </div>
                                ) : (
                                    activeDiscounts.map(discount => {
                                        const provider = discount.provider_id ? providers.find(p => p.provider_id === discount.provider_id) : null;
                                        return (
                                            <div key={discount.discount_id} className={styles.discountCard}>
                                                <div className={styles.discountTop}>
                                                    <span className={styles.discountValue}>
                                                        {discount.type === 'Percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                                                    </span>
                                                    {discount.auto_apply && <span className={styles.autoTag}>✨ Auto-applied</span>}
                                                </div>
                                                <p className={styles.discountDesc}>{discount.description}</p>
                                                {discount.code && (
                                                    <div className={styles.codeBox}>
                                                        <span>{discount.code}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(discount.code); toast.success('Code copied!'); }}>Copy</button>
                                                    </div>
                                                )}
                                                <div className={styles.discountMeta}>
                                                    {discount.min_order > 0 && <span>Min. ₹{discount.min_order}</span>}
                                                    {discount.max_discount && <span>Max ₹{discount.max_discount} off</span>}
                                                    {provider && <span><MapPin size={12} /> {provider.company_name}</span>}
                                                </div>
                                                <span className={styles.discountValidity}>Valid until {new Date(discount.valid_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                {provider && (
                                                    <button className={styles.discountBookBtn} onClick={() => navigate(`/book-service?provider=${provider.provider_id}`)}>
                                                        Book Now <ArrowRight size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ====== VEHICLES TAB ====== */}
                    {activeTab === 'vehicles' && (
                        <motion.div key="vehicles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>My Vehicles</h2>
                                <Button onClick={() => setShowAddVehicle(true)}>
                                    <Plus size={16} /> Add Vehicle
                                </Button>
                            </div>

                            {/* Add Vehicle Form */}
                            {showAddVehicle && (
                                <div className={styles.formCard}>
                                    <h4>Add New Vehicle</h4>
                                    <form onSubmit={handleAddVehicle} className={styles.vehicleForm}>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Make *</label>
                                                <input value={vehicleForm.make} onChange={e => setVehicleForm(p => ({ ...p, make: e.target.value }))} placeholder="e.g. Toyota" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Model *</label>
                                                <input value={vehicleForm.model} onChange={e => setVehicleForm(p => ({ ...p, model: e.target.value }))} placeholder="e.g. Innova" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Year</label>
                                                <input type="number" value={vehicleForm.year} onChange={e => setVehicleForm(p => ({ ...p, year: parseInt(e.target.value) }))} />
                                            </div>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Registration Number *</label>
                                                <input value={vehicleForm.registration_number} onChange={e => setVehicleForm(p => ({ ...p, registration_number: e.target.value }))} placeholder="e.g. KA-01-AB-1234" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Type</label>
                                                <select value={vehicleForm.vehicle_type} onChange={e => setVehicleForm(p => ({ ...p, vehicle_type: e.target.value }))}>
                                                    <option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Bike</option><option>Scooter</option>
                                                </select>
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Fuel Type</label>
                                                <select value={vehicleForm.fuel_type} onChange={e => setVehicleForm(p => ({ ...p, fuel_type: e.target.value }))}>
                                                    <option>Petrol</option><option>Diesel</option><option>Electric</option><option>CNG</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className={styles.formActions}>
                                            <Button type="submit" size="sm">Save Vehicle</Button>
                                            <Button type="button" size="sm" variant="outline" onClick={() => setShowAddVehicle(false)}>Cancel</Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className={styles.vehiclesGridRich}>
                                {userVehicles.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Car size={48} />
                                        <h3>No vehicles added</h3>
                                        <p>Add your vehicle to get started with booking.</p>
                                        <Button onClick={() => setShowAddVehicle(true)}>Add Vehicle</Button>
                                    </div>
                                ) : (
                                    userVehicles.map(vehicle => {
                                        const mileage = vehicle.current_mileage || vehicle.mileage || 0;
                                        const mileagePercent = Math.min((mileage / 100000) * 100, 100);
                                        const vehicleBookings = userBookings.filter(b => b.vehicle_id === vehicle.vehicle_id);
                                        return (
                                            <motion.div
                                                key={vehicle.vehicle_id}
                                                className={styles.vehicleCardRich}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -4 }}
                                            >
                                                {/* Vehicle Image */}
                                                <div className={styles.vehicleImageSection}>
                                                    {vehicle.vehicle_image ? (
                                                        <img src={vehicle.vehicle_image} alt={`${vehicle.vehicle_make || vehicle.make} ${vehicle.vehicle_model || vehicle.model}`} className={styles.vehicleImg} />
                                                    ) : (
                                                        <div className={styles.vehicleImgFallback}><Car size={48} /></div>
                                                    )}
                                                    <div className={styles.vehicleImageOverlay}>
                                                        {vehicle.is_primary && <span className={styles.primaryBadge}>⭐ Primary</span>}
                                                        <span className={styles.vehiclePlate}>{vehicle.license_plate || vehicle.registration_number}</span>
                                                    </div>
                                                </div>

                                                {/* Vehicle Details */}
                                                <div className={styles.vehicleDetailsSection}>
                                                    <div className={styles.vehicleTitleRow}>
                                                        <h4>{vehicle.vehicle_make || vehicle.make} {vehicle.vehicle_model || vehicle.model}</h4>
                                                        <span className={styles.vehicleYear}>{vehicle.vehicle_year || vehicle.year}</span>
                                                    </div>

                                                    {/* Specs Grid */}
                                                    <div className={styles.vehicleSpecsGrid}>
                                                        <div className={styles.specItem}>
                                                            <Car size={14} />
                                                            <span>{vehicle.vehicle_type || 'N/A'}</span>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <Fuel size={14} />
                                                            <span>{vehicle.fuel_type || 'N/A'}</span>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <Cog size={14} />
                                                            <span>{vehicle.transmission || 'N/A'}</span>
                                                        </div>
                                                        <div className={styles.specItem}>
                                                            <Palette size={14} />
                                                            <span>{vehicle.vehicle_color || vehicle.color || 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Mileage Bar */}
                                                    <div className={styles.mileageSection}>
                                                        <div className={styles.mileageHeader}>
                                                            <span><Gauge size={13} /> Mileage</span>
                                                            <strong>{mileage.toLocaleString()} km</strong>
                                                        </div>
                                                        <div className={styles.mileageTrack}>
                                                            <div className={styles.mileageFill} style={{ width: `${mileagePercent}%` }} />
                                                        </div>
                                                    </div>

                                                    {/* Service History Summary */}
                                                    <div className={styles.vehicleServiceSummary}>
                                                        <span>{vehicleBookings.length} service{vehicleBookings.length !== 1 ? 's' : ''} booked</span>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className={styles.vehicleActions}>
                                                        <button className={styles.vehicleBookBtn} onClick={() => navigate('/book-service')}>
                                                            <Wrench size={14} /> Book Service
                                                        </button>
                                                        <button className={styles.vehicleDeleteBtn} onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ====== SETTINGS TAB ====== */}
                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={styles.tabContent}>
                            <div className={styles.pageHeader}>
                                <h2>Settings</h2>
                            </div>

                            <div className={styles.settingsSections}>
                                {/* Profile */}
                                <div className={styles.settingsCard}>
                                    <h4>Profile Information</h4>
                                    <div className={styles.settingsFieldsGrid}>
                                        <div className={styles.settingsField}>
                                            <label>Full Name</label>
                                            <span>{currentUser.first_name} {currentUser.last_name}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Email</label>
                                            <span><Mail size={14} /> {currentUser.email}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Phone</label>
                                            <span><Phone size={14} /> {currentUser.phone || 'Not set'}</span>
                                        </div>
                                        <div className={styles.settingsField}>
                                            <label>Member Since</label>
                                            <span>{new Date(currentUser.registration_date || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div className={styles.settingsCard}>
                                    <h4>Preferences</h4>
                                    <div className={styles.settingsFields}>
                                        <div className={styles.settingsToggle}>
                                            <div>
                                                <strong>Email Notifications</strong>
                                                <span>Receive booking updates via email</span>
                                            </div>
                                            <div className={styles.toggle}>
                                                <input type="checkbox" defaultChecked id="email-notif" />
                                                <label htmlFor="email-notif"></label>
                                            </div>
                                        </div>
                                        <div className={styles.settingsToggle}>
                                            <div>
                                                <strong>SMS Notifications</strong>
                                                <span>Receive status updates via SMS</span>
                                            </div>
                                            <div className={styles.toggle}>
                                                <input type="checkbox" defaultChecked id="sms-notif" />
                                                <label htmlFor="sms-notif"></label>
                                            </div>
                                        </div>
                                        <div className={styles.settingsToggle}>
                                            <div>
                                                <strong>Marketing Emails</strong>
                                                <span>Offers, discounts, and news</span>
                                            </div>
                                            <div className={styles.toggle}>
                                                <input type="checkbox" id="marketing" />
                                                <label htmlFor="marketing"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
};

/* ====== BOOKING DETAIL SUB-COMPONENT ====== */
const BookingDetail = ({ booking, onBack, providers, getStatusInfo, getIssuesByBookingId, getCommunicationsByBookingId, onApproveIssue, onDeclineIssue, onCancelBooking, sendMessage, currentUser }) => {
    const [messageInput, setMessageInput] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);
    const provider = providers.find(p => p.provider_id === booking.provider_id);
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
                    <span className={styles.detailProvider}>{provider?.company_name}</span>
                </div>
                <Badge style={{ background: `${statusInfo?.color}20`, color: statusInfo?.color, fontSize: '0.9rem', padding: '8px 16px' }}>
                    {statusInfo?.name || booking.current_status}
                </Badge>
            </div>

            {/* Status Timeline */}
            <div className={styles.detailSection}>
                <h4>Service Progress</h4>
                <StatusTimeline bookingId={booking.booking_id} currentStatus={booking.current_status} />
            </div>

            {/* Booking Info */}
            <div className={styles.detailGrid}>
                <div className={styles.detailSection}>
                    <h4>Booking Details</h4>
                    <div className={styles.detailFields}>
                        <div><label>Booking Date</label><span>{new Date(booking.booking_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                        <div><label>Preferred Date</label><span>{booking.preferred_date || 'N/A'}</span></div>
                        <div><label>Booking Type</label><span>{booking.booking_type}</span></div>
                        <div><label>Payment Status</label><Badge variant={booking.payment_status === 'Paid' ? 'success' : 'warning'}>{booking.payment_status}</Badge></div>
                    </div>
                </div>

                <div className={styles.detailSection}>
                    <h4>Price Summary</h4>
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
                        <button
                            onClick={() => setShowInvoice(true)}
                            style={{ marginTop: '12px', width: '100%', padding: '10px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}
                        >
                            <FileText size={16} /> View Invoice
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Modal */}
            {showInvoice && (
                <InvoiceView
                    booking={booking}
                    provider={provider}
                    customer={currentUser}
                    onClose={() => setShowInvoice(false)}
                />
            )}

            {/* Issues Section */}
            {issues.length > 0 && (
                <div className={styles.detailSection}>
                    <h4><AlertTriangle size={16} /> Issues Found</h4>
                    <div className={styles.issuesList}>
                        {issues.map(issue => (
                            <div key={issue.issue_id} className={styles.issueCard}>
                                <div className={styles.issueTop}>
                                    <Badge variant={issue.severity === 'Major' ? 'danger' : 'warning'}>{issue.severity}</Badge>
                                    <Badge variant={issue.issue_status === 'Approved' ? 'success' : issue.issue_status === 'Declined' ? 'danger' : 'warning'}>
                                        {issue.issue_status}
                                    </Badge>
                                </div>
                                <p>{issue.issue_description}</p>
                                <span className={styles.issueCost}>+ ₹{issue.estimated_additional_cost?.toLocaleString()}</span>
                                {issue.issue_status === 'Pending Approval' && (
                                    <div className={styles.issueActions}>
                                        <Button size="sm" onClick={() => onApproveIssue(issue.issue_id)}>
                                            <CheckCircle size={14} /> Approve
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => onDeclineIssue(issue.issue_id)}>
                                            <XCircle size={14} /> Decline
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Communications */}
            <div className={styles.detailSection}>
                <h4><MessageSquare size={16} /> Messages</h4>
                <div className={styles.chatBox}>
                    {comms.length === 0 ? (
                        <p className={styles.noMessages}>No messages yet. Start a conversation!</p>
                    ) : (
                        comms.map(msg => (
                            <div key={msg.comm_id} className={`${styles.chatMsg} ${msg.sender_type === 'Customer' ? styles.sent : styles.received}`}>
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

            {/* Actions */}
            {!['COMPLETED', 'CANCELLED', 'DECLINED'].includes(booking.current_status) && (
                <div className={styles.detailActions}>
                    <Button variant="outline" onClick={() => onCancelBooking(booking.booking_id)} style={{ color: 'var(--danger)' }}>
                        Cancel Booking
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
