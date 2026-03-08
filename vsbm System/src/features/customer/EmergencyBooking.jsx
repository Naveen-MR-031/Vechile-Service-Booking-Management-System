import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle, MapPin, Navigation, Phone, Star, Clock,
    Zap, ArrowLeft, CheckCircle, Loader2, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useMockData } from '../../context/MockDataContext';

const EmergencyBooking = () => {
    const navigate = useNavigate();
    const { currentUser, getNearbyProviders, createBooking, services } = useMockData();

    const [step, setStep] = useState('locate'); // locate | providers | confirm
    const [location, setLocation] = useState(null);
    const [locationAddress, setLocationAddress] = useState('Detecting your location...');
    const [nearbyProviders, setNearbyProviders] = useState([]);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(20);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Get user location
    const detectLocation = useCallback(() => {
        setLoading(true);
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setLocation(loc);
                setLocationAddress(`${loc.lat.toFixed(4)}°N, ${loc.lng.toFixed(4)}°E`);
                setLoading(false);
                toast.success('Location detected!');
            },
            (error) => {
                console.error('Geolocation error:', error);
                // Fallback to a default location (Chennai)
                const fallback = { lat: 13.0827, lng: 80.2707 };
                setLocation(fallback);
                setLocationAddress('Chennai, Tamil Nadu (default)');
                setLoading(false);
                toast('Using default location. Enable GPS for accuracy.', { icon: '📍' });
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        detectLocation();
    }, [detectLocation]);

    // Search for nearby providers
    const searchProviders = async () => {
        if (!location) {
            toast.error('Location not available yet');
            return;
        }
        setLoading(true);
        try {
            const providers = await getNearbyProviders(location.lat, location.lng, radius);
            setNearbyProviders(providers);
            setStep('providers');
            if (providers.length === 0) {
                toast('No providers found nearby. Try increasing the search radius.', { icon: '🔍' });
            }
        } catch (err) {
            console.error('Search error:', err);
            toast.error('Failed to search for providers');
        }
        setLoading(false);
    };

    // Create emergency booking
    const handleEmergencyBook = async () => {
        if (!selectedProvider || !currentUser) return;
        setSubmitting(true);
        try {
            await createBooking({
                provider_id: selectedProvider._id,
                services: [{
                    service_name: 'Emergency Service',
                    unit_price: 0,
                    quantity: 1,
                    line_total: 0
                }],
                preferred_date: new Date().toISOString(),
                booking_type: 'Emergency',
                special_instructions: description || 'EMERGENCY: Immediate assistance required',
                total_amount: 0,
                isEmergency: true,
                customerLocation: {
                    lat: location.lat,
                    lng: location.lng,
                    address: locationAddress
                }
            });
            toast.success('🚨 Emergency booking created! Provider has been notified.');
            navigate('/customer/dashboard');
        } catch (err) {
            console.error('Booking error:', err);
            toast.error('Failed to create emergency booking');
        }
        setSubmitting(false);
    };

    if (!currentUser) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary, #0f172a)' }}>
            <Navbar variant="dashboard" />

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <button onClick={() => navigate('/customer/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ margin: 0, color: 'var(--text-primary, #f1f5f9)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Zap size={24} style={{ color: '#ef4444' }} /> Emergency Booking
                        </h1>
                        <p style={{ margin: '4px 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
                            Find the nearest service provider for immediate assistance
                        </p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                    {['locate', 'providers', 'confirm'].map((s, i) => (
                        <div key={s} style={{
                            flex: 1, height: '4px', borderRadius: '2px',
                            background: ['locate', 'providers', 'confirm'].indexOf(step) >= i
                                ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'var(--border, #334155)'
                        }} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Location */}
                    {step === 'locate' && (
                        <motion.div key="locate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.1))',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '24px'
                            }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    {loading ? <Loader2 size={28} style={{ color: '#ef4444', animation: 'spin 1s linear infinite' }} />
                                        : <MapPin size={28} style={{ color: '#ef4444' }} />}
                                </div>
                                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 8px' }}>
                                    {loading ? 'Detecting Location...' : 'Location Detected'}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 16px' }}>
                                    <Navigation size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    {locationAddress}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
                                    <label style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search Radius:</label>
                                    <select
                                        value={radius}
                                        onChange={e => setRadius(Number(e.target.value))}
                                        style={{
                                            padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                                            background: 'var(--bg-input, #1e293b)', color: 'var(--text-primary)', fontSize: '0.9rem'
                                        }}
                                    >
                                        <option value={5}>5 km</option>
                                        <option value={10}>10 km</option>
                                        <option value={20}>20 km</option>
                                        <option value={50}>50 km</option>
                                        <option value={100}>100 km</option>
                                    </select>
                                </div>

                                <Button onClick={searchProviders} disabled={loading || !location} style={{
                                    background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                    border: 'none', fontSize: '1rem', padding: '12px 32px'
                                }}>
                                    <Search size={18} /> Find Nearby Providers
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Provider List */}
                    {step === 'providers' && (
                        <motion.div key="providers" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                                    Nearby Providers ({nearbyProviders.length})
                                </h3>
                                <Button size="sm" variant="outline" onClick={() => setStep('locate')}>
                                    <MapPin size={14} /> Change Location
                                </Button>
                            </div>

                            {nearbyProviders.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '40px', background: 'var(--bg-card, #1e293b)',
                                    borderRadius: '12px', border: '1px solid var(--border)'
                                }}>
                                    <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                                    <h4 style={{ color: 'var(--text-primary)', margin: '0 0 8px' }}>No providers found</h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Try increasing the search radius or try again later.
                                    </p>
                                    <Button onClick={() => setStep('locate')} variant="outline" style={{ marginTop: '12px' }}>
                                        Try Again
                                    </Button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {nearbyProviders.map(provider => (
                                        <motion.div
                                            key={provider._id}
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => { setSelectedProvider(provider); setStep('confirm'); }}
                                            style={{
                                                background: 'var(--bg-card, #1e293b)',
                                                borderRadius: '12px', padding: '20px',
                                                border: `2px solid ${selectedProvider?._id === provider._id ? '#ef4444' : 'var(--border, #334155)'}`,
                                                cursor: 'pointer', transition: 'border-color 0.2s'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                                                        {provider.businessName || provider.name}
                                                    </h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#EAB308' }}>
                                                            <Star size={14} fill="#EAB308" /> {provider.rating?.toFixed(1) || '0.0'}
                                                        </span>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            ({provider.totalReviews || 0} reviews)
                                                        </span>
                                                    </div>
                                                    {provider.address && (
                                                        <p style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <MapPin size={12} /> {provider.address.street}, {provider.address.city}
                                                        </p>
                                                    )}
                                                    {provider.servicesOffered?.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                            {provider.servicesOffered.slice(0, 3).map((s, i) => (
                                                                <span key={i} style={{
                                                                    background: 'rgba(59,130,246,0.15)', color: '#3B82F6',
                                                                    padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem'
                                                                }}>
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #ef4444, #f97316)',
                                                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                                        fontSize: '1.2rem', fontWeight: 700
                                                    }}>
                                                        {provider.distanceKm} km
                                                    </span>
                                                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>away</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 'confirm' && selectedProvider && (
                        <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div style={{
                                background: 'var(--bg-card, #1e293b)', borderRadius: '16px',
                                padding: '28px', border: '1px solid var(--border)'
                            }}>
                                <h3 style={{ margin: '0 0 20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={20} style={{ color: '#ef4444' }} /> Confirm Emergency Booking
                                </h3>

                                {/* Selected Provider Info */}
                                <div style={{
                                    background: 'var(--bg-surface, #0f172a)', borderRadius: '12px',
                                    padding: '16px', marginBottom: '20px', borderLeft: '3px solid #ef4444'
                                }}>
                                    <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)' }}>
                                        {selectedProvider.businessName || selectedProvider.name}
                                    </h4>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <span><MapPin size={12} /> {selectedProvider.distanceKm} km away</span>
                                        <span><Star size={12} fill="#EAB308" stroke="#EAB308" /> {selectedProvider.rating?.toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        Describe your emergency (optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="e.g., Car broke down on highway, flat tire, engine overheating..."
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '8px',
                                            border: '1px solid var(--border)', background: 'var(--bg-input, #0f172a)',
                                            color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Warning */}
                                <div style={{
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '0.85rem', color: '#fca5a5'
                                }}>
                                    ⚠️ Emergency bookings are high-priority and the provider will be notified immediately. Pricing may vary.
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Button
                                        onClick={handleEmergencyBook}
                                        disabled={submitting}
                                        style={{
                                            flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                            border: 'none', fontSize: '1rem', padding: '14px'
                                        }}
                                    >
                                        {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking...</>
                                            : <><Zap size={16} /> Book Emergency Service</>}
                                    </Button>
                                    <Button variant="outline" onClick={() => setStep('providers')}>
                                        Back
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default EmergencyBooking;
