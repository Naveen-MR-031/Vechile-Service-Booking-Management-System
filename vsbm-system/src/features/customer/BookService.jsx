import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Calendar, Car, MapPin, ChevronLeft, ChevronRight, DollarSign, Clock,
    Star, Shield, Check, Wrench, Truck, Zap, AlertTriangle, FileText,
    User, Hash, Fuel, Gauge
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/ui/Button';
import { useMockData } from '../../context/MockDataContext';
import styles from './BookService.module.css';

const BookService = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const {
        providers,
        services: allServices,
        createBooking,
        currentUser,
        loading
    } = useMockData();

    const initialProviderId = searchParams.get('provider') || '';
    const [step, setStep] = useState(initialProviderId ? 2 : 1);

    const [formData, setFormData] = useState({
        serviceProviderId: initialProviderId,
        serviceId: '',
        serviceType: '',
        vehicleDetails: {
            make: '',
            model: '',
            registrationNumber: '',
            year: new Date().getFullYear(),
            vehicleType: 'Sedan',
            fuelType: 'Petrol',
            mileage: ''
        },
        preferredDate: '',
        preferredTime: '',
        bookingType: 'Drop-off',
        urgency: 'normal',
        description: ''
    });

    const [availableServices, setAvailableServices] = useState([]);
    const [estimatedCost, setEstimatedCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Slideshow state for each provider
    const [slideIndices, setSlideIndices] = useState({});
    useEffect(() => {
        const interval = setInterval(() => {
            setSlideIndices(prev => {
                const next = { ...prev };
                providers.forEach(p => {
                    const galleryLen = p.gallery?.length || 1;
                    next[p.provider_id] = ((prev[p.provider_id] || 0) + 1) % galleryLen;
                });
                return next;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [providers]);

    // Filter services for selected provider
    useEffect(() => {
        if (formData.serviceProviderId) {
            const providerServices = allServices.filter(s => String(s.provider_id) === String(formData.serviceProviderId));
            setAvailableServices(providerServices);
        } else {
            setAvailableServices([]);
        }
    }, [formData.serviceProviderId, allServices]);

    // Update cost with urgency multiplier
    useEffect(() => {
        if (formData.serviceId) {
            const selectedService = availableServices.find(s => String(s.service_id) === String(formData.serviceId));
            if (selectedService) {
                let baseCost = selectedService.base_price || 0;
                if (formData.urgency === 'express') baseCost = Math.round(baseCost * 1.2);
                else if (formData.urgency === 'emergency') baseCost = Math.round(baseCost * 1.5);
                setEstimatedCost(baseCost);
                setFormData(prev => ({ ...prev, serviceType: selectedService.service_name }));
            }
        } else {
            setEstimatedCost(0);
        }
    }, [formData.serviceId, formData.urgency, availableServices]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error('Please login to book a service');
            navigate('/login');
            return;
        }
        try {
            setIsSubmitting(true);
            const urgencyMultiplier = formData.urgency === 'express' ? 1.2 : formData.urgency === 'emergency' ? 1.5 : 1;
            const newBooking = {
                customer_id: currentUser.customer_id,
                provider_id: formData.serviceProviderId,
                vehicle_id: null,
                booking_type: formData.bookingType,
                current_status: "PENDING",
                booking_date: new Date().toISOString(),
                preferred_date: formData.preferredDate,
                preferred_time: formData.preferredTime,
                urgency: formData.urgency,
                estimated_completion_time: formData.urgency === 'emergency' ? 120 : 240,
                total_amount: estimatedCost,
                payment_status: "Pending",
                special_instructions: formData.description,
                services: [{
                    service_id: formData.serviceId,
                    service_name: formData.serviceType,
                    quantity: 1,
                    unit_price: Math.round(estimatedCost / urgencyMultiplier),
                    line_total: estimatedCost
                }],
                vehicleDetails: formData.vehicleDetails
            };
            await createBooking(newBooking);
            toast.success('Booking created successfully! 🎉');
            navigate('/customer/dashboard?tab=bookings');
        } catch (error) {
            toast.error('Booking failed: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedProvider = providers.find(p => String(p.provider_id) === String(formData.serviceProviderId));

    const canProceedStep2 = !!formData.serviceProviderId;
    const canProceedStep3 = !!formData.serviceId && !!formData.vehicleDetails.make && !!formData.vehicleDetails.model && !!formData.vehicleDetails.registrationNumber;

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    const steps = [
        { num: 1, label: 'Select Provider' },
        { num: 2, label: 'Service & Vehicle' },
        { num: 3, label: 'Confirm Booking' }
    ];

    return (
        <div className={styles.bookServicePage}>
            <Navbar />
            <div className={styles.container}>
                <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} style={{ marginBottom: '16px' }}>
                    <ChevronLeft size={20} /> {step > 1 ? 'Previous Step' : 'Back'}
                </Button>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                    {steps.map((s, i) => (
                        <React.Fragment key={s.num}>
                            <div className={`${styles.progressStep} ${step === s.num ? styles.active : ''} ${step > s.num ? styles.completed : ''}`}>
                                {step > s.num ? <Check size={16} /> : <span>{s.num}</span>}
                                <span>{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`${styles.progressConnector} ${step > s.num ? styles.done : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ====== STEP 1: SELECT PROVIDER ====== */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                            <div className={styles.stepHeader}>
                                <h2>Choose a Service Center</h2>
                                <p>Select a trusted, verified provider near you</p>
                            </div>

                            <div className={styles.providersList}>
                                {providers.map(provider => {
                                    const currentSlide = slideIndices[provider.provider_id] || 0;
                                    const isSelected = formData.serviceProviderId === String(provider.provider_id);
                                    const isVerified = provider.verification_status === 'Verified';
                                    return (
                                        <div
                                            key={provider.provider_id}
                                            className={`${styles.providerSelectCard} ${isSelected ? styles.selected : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, serviceProviderId: String(provider.provider_id), serviceId: '' }))}
                                        >
                                            {isSelected && (
                                                <div className={styles.selectedCheck}><Check size={16} /></div>
                                            )}
                                            {/* Slideshow */}
                                            <div className={styles.slideshow}>
                                                {(provider.gallery || [provider.cover_image]).map((img, idx) => (
                                                    <img key={idx} src={img} alt={`${provider.company_name} ${idx + 1}`} className={currentSlide === idx ? styles.activeSlide : ''} />
                                                ))}
                                                <div className={styles.slideDots}>
                                                    {(provider.gallery || [provider.cover_image]).map((_, idx) => (
                                                        <div key={idx} className={`${styles.slideDot} ${currentSlide === idx ? styles.activeDot : ''}`} />
                                                    ))}
                                                </div>
                                                {isVerified && (
                                                    <span className={styles.verifiedBadge}><Shield size={10} /> Verified</span>
                                                )}
                                            </div>
                                            {/* Body */}
                                            <div className={styles.providerCardBody}>
                                                <div className={styles.providerNameRow}>
                                                    {provider.business_logo ? (
                                                        <img src={provider.business_logo} alt={provider.company_name} onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                                                            {(provider.company_name || 'S')[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4>{provider.company_name}</h4>
                                                        <span><MapPin size={10} /> {provider.address.split(',')[0]}</span>
                                                    </div>
                                                </div>
                                                <div className={styles.providerMetaRow}>
                                                    <span className={styles.ratingBadge}><Star size={13} fill="currentColor" /> {provider.rating}</span>
                                                    <span className={styles.reviewCount}>({provider.review_count} reviews)</span>
                                                    <span className={styles.yearBadge}>Est. {provider.year_established}</span>
                                                </div>
                                                <p className={styles.providerDesc}>{provider.description}</p>
                                                {provider.amenities && (
                                                    <div className={styles.amenityChips}>
                                                        {provider.amenities.slice(0, 5).map((a, i) => (
                                                            <span key={i} className={styles.amenityChip}>{a}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.navButtons}>
                                <div />
                                <Button disabled={!canProceedStep2} onClick={() => setStep(2)}>
                                    Next: Service Details <ChevronRight size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ====== STEP 2: SERVICE + VEHICLE ====== */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                            <div className={styles.stepHeader}>
                                <h2>Service & Vehicle Details</h2>
                                <p>Select a service and tell us about your vehicle{selectedProvider ? ` at ${selectedProvider.company_name}` : ''}</p>
                            </div>

                            {/* Service Selection */}
                            <div className={styles.formSection}>
                                <h3><Wrench size={18} /> Select Service</h3>
                                <div className={styles.servicesGrid}>
                                    {availableServices.map(service => (
                                        <div
                                            key={service.service_id}
                                            className={`${styles.serviceCard} ${formData.serviceId === String(service.service_id) ? styles.selectedService : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, serviceId: String(service.service_id) }))}
                                        >
                                            <div className={styles.serviceCardIcon}><Wrench size={20} /></div>
                                            <h5>{service.service_name.split('(')[0].trim()}</h5>
                                            <span className={styles.servicePrice}>₹{service.base_price?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div className={styles.formSection}>
                                <h3><Car size={18} /> Vehicle Information</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Make *</label>
                                        <input className={styles.formInput} name="vehicleDetails.make" placeholder="e.g. Honda" value={formData.vehicleDetails.make} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Model *</label>
                                        <input className={styles.formInput} name="vehicleDetails.model" placeholder="e.g. City" value={formData.vehicleDetails.model} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Registration *</label>
                                        <input className={styles.formInput} name="vehicleDetails.registrationNumber" placeholder="e.g. KA-01-AB-1234" value={formData.vehicleDetails.registrationNumber} onChange={handleChange} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Year</label>
                                        <input className={styles.formInput} type="number" name="vehicleDetails.year" min="1990" max={new Date().getFullYear() + 1} value={formData.vehicleDetails.year} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Vehicle Type</label>
                                        <select className={styles.formInput} name="vehicleDetails.vehicleType" value={formData.vehicleDetails.vehicleType} onChange={handleChange}>
                                            <option value="Sedan">Sedan</option>
                                            <option value="SUV">SUV</option>
                                            <option value="Hatchback">Hatchback</option>
                                            <option value="Bike">Bike</option>
                                            <option value="Scooter">Scooter</option>
                                            <option value="Truck">Truck</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Fuel Type</label>
                                        <select className={styles.formInput} name="vehicleDetails.fuelType" value={formData.vehicleDetails.fuelType} onChange={handleChange}>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric (EV)</option>
                                            <option value="CNG">CNG</option>
                                            <option value="Hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Mileage (km)</label>
                                        <input className={styles.formInput} type="number" name="vehicleDetails.mileage" placeholder="e.g. 45000" value={formData.vehicleDetails.mileage} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Booking Type */}
                            <div className={styles.formSection}>
                                <h3><Truck size={18} /> Booking Type</h3>
                                <div className={styles.optionPills}>
                                    {['Drop-off', 'Pickup', 'On-site'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            className={`${styles.optionPill} ${formData.bookingType === type ? styles.activePill : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, bookingType: type }))}
                                        >
                                            {type === 'Drop-off' && <Car size={14} />}
                                            {type === 'Pickup' && <Truck size={14} />}
                                            {type === 'On-site' && <MapPin size={14} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Urgency */}
                            <div className={styles.formSection}>
                                <h3><Zap size={18} /> Urgency Level</h3>
                                <div className={styles.optionPills}>
                                    <button type="button" className={`${styles.optionPill} ${formData.urgency === 'normal' ? styles.activePill : ''}`} onClick={() => setFormData(prev => ({ ...prev, urgency: 'normal' }))}>
                                        <Clock size={14} /> Normal
                                    </button>
                                    <button type="button" className={`${styles.optionPill} ${formData.urgency === 'express' ? styles.activePill : ''}`} onClick={() => setFormData(prev => ({ ...prev, urgency: 'express' }))}>
                                        <Zap size={14} /> Express <span className={styles.pillSublabel}>(+20%)</span>
                                    </button>
                                    <button type="button" className={`${styles.optionPill} ${formData.urgency === 'emergency' ? styles.activePill : ''}`} onClick={() => setFormData(prev => ({ ...prev, urgency: 'emergency' }))}>
                                        <AlertTriangle size={14} /> Emergency <span className={styles.pillSublabel}>(+50%)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Estimated Cost */}
                            {estimatedCost > 0 && (
                                <div style={{ padding: '16px 20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <DollarSign size={20} color="var(--success)" />
                                        <span style={{ fontWeight: '600', color: 'var(--success)' }}>Estimated Cost</span>
                                        {formData.urgency !== 'normal' && <span className={styles.urgencySurcharge}>{formData.urgency === 'express' ? '+20% Express' : '+50% Emergency'}</span>}
                                    </div>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{estimatedCost.toLocaleString()}</span>
                                </div>
                            )}

                            <div className={styles.navButtons}>
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    <ChevronLeft size={16} /> Back
                                </Button>
                                <Button disabled={!canProceedStep3} onClick={() => setStep(3)}>
                                    Next: Review & Confirm <ChevronRight size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ====== STEP 3: REVIEW + CONFIRM ====== */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                            <div className={styles.stepHeader}>
                                <h2>Review & Confirm</h2>
                                <p>Double-check your booking details before confirming</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className={styles.summaryLayout}>
                                    {/* Left — Schedule + Notes */}
                                    <div>
                                        <div className={styles.formSection}>
                                            <h3><Calendar size={18} /> Schedule</h3>
                                            <div className={styles.formGrid}>
                                                <div className={styles.formGroup}>
                                                    <label>Preferred Date *</label>
                                                    <input className={styles.formInput} type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Preferred Time</label>
                                                    <select className={styles.formInput} name="preferredTime" value={formData.preferredTime} onChange={handleChange}>
                                                        <option value="">Any time</option>
                                                        <option value="09:00">9:00 AM</option>
                                                        <option value="10:00">10:00 AM</option>
                                                        <option value="11:00">11:00 AM</option>
                                                        <option value="12:00">12:00 PM</option>
                                                        <option value="14:00">2:00 PM</option>
                                                        <option value="15:00">3:00 PM</option>
                                                        <option value="16:00">4:00 PM</option>
                                                        <option value="17:00">5:00 PM</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.formSection}>
                                            <h3><FileText size={18} /> Special Instructions</h3>
                                            <textarea className={styles.formTextarea} name="description" rows="4" placeholder="Any specific issues, requests, or instructions for the service center..." value={formData.description} onChange={handleChange} />
                                        </div>
                                    </div>

                                    {/* Right — Order Summary */}
                                    <div className={styles.orderSummary}>
                                        <h3><DollarSign size={18} /> Order Summary</h3>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Service Center</span>
                                            <span className={styles.summaryValue}>{selectedProvider?.company_name}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Service</span>
                                            <span className={styles.summaryValue}>{formData.serviceType?.split('(')[0]?.trim()}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Vehicle</span>
                                            <span className={styles.summaryValue}>{formData.vehicleDetails.make} {formData.vehicleDetails.model}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Registration</span>
                                            <span className={styles.summaryValue}>{formData.vehicleDetails.registrationNumber}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Type / Fuel</span>
                                            <span className={styles.summaryValue}>{formData.vehicleDetails.vehicleType} · {formData.vehicleDetails.fuelType}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Booking Type</span>
                                            <span className={styles.summaryValue}>{formData.bookingType}</span>
                                        </div>
                                        <div className={styles.summaryItem}>
                                            <span className={styles.summaryLabel}>Urgency</span>
                                            <span className={styles.summaryValue} style={{ textTransform: 'capitalize' }}>
                                                {formData.urgency}
                                                {formData.urgency !== 'normal' && <span className={styles.urgencySurcharge}> ({formData.urgency === 'express' ? '+20%' : '+50%'})</span>}
                                            </span>
                                        </div>
                                        <div className={styles.summaryTotal}>
                                            <span>Total</span>
                                            <span className={styles.totalAmount}>₹{estimatedCost.toLocaleString()}</span>
                                        </div>

                                        <Button type="submit" size="lg" disabled={isSubmitting} style={{ width: '100%', marginTop: '20px' }}>
                                            {isSubmitting ? 'Booking...' : '✨ Confirm Booking'}
                                        </Button>
                                    </div>
                                </div>

                                <div className={styles.navButtons}>
                                    <Button variant="outline" type="button" onClick={() => setStep(2)}>
                                        <ChevronLeft size={16} /> Back
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BookService;
