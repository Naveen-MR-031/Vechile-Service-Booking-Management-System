import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
    Car, ArrowRight, Wrench, Shield, Clock, Star,
    CheckCircle, MapPin, Phone, Mail, ChevronRight,
    Zap, Users, Award, Sparkles, Tag, Percent,
    TrendingUp, Eye, Truck
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import { useMockData } from '../context/MockDataContext';
import styles from './HomePage.module.css';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }
    })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const HomePage = () => {
    const navigate = useNavigate();
    const { providers, services, reviews, discounts, loading, currentUser } = useMockData();

    // Smart redirect: dashboard if logged in, login if not
    const goToBooking = () => {
        if (currentUser) {
            navigate(currentUser.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard');
        } else {
            navigate('/login');
        }
    };

    // Compute stats from real data
    const totalBookings = 1247; // Showcase stat
    const featuredProviders = providers.filter(p => p.featured_provider);
    const activeDiscounts = discounts.filter(d => d.is_active);
    const popularServices = services.filter(s => s.popular_service);

    // Demo status stages for showcase
    const showcaseStages = [
        { label: 'Booked', done: true },
        { label: 'Picked Up', done: true },
        { label: 'Inspection', done: true },
        { label: 'Work in Progress', done: true, active: true },
        { label: 'Quality Check', done: false },
        { label: 'Delivery', done: false }
    ];

    const howItWorks = [
        { icon: <Car size={28} />, title: 'Choose Service', desc: 'Browse providers and select the services your vehicle needs' },
        { icon: <Truck size={28} />, title: 'Schedule Pickup', desc: 'Choose drop-off or we pick up your vehicle at your doorstep' },
        { icon: <Wrench size={28} />, title: 'Track Live', desc: 'Watch real-time status updates from inspection to completion' },
        { icon: <CheckCircle size={28} />, title: 'Get Delivered', desc: 'Vehicle delivered back to you, pay securely online' }
    ];

    const stats = [
        { value: '10K+', label: 'Services Done', icon: <Wrench size={20} /> },
        { value: `${providers.length}+`, label: 'Verified Centers', icon: <Shield size={20} /> },
        { value: '4.8', label: 'Avg Rating', icon: <Star size={20} /> },
        { value: '15min', label: 'Avg Response', icon: <Clock size={20} /> }
    ];

    return (
        <div className={styles.page}>
            <Navbar />

            {/* ========== HERO SECTION ========== */}
            <section className={styles.hero}>
                <div className={styles.heroGlow}></div>
                <div className={styles.heroContent}>
                    <motion.div
                        className={styles.heroText}
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                    >
                        <motion.span variants={fadeInUp} className={styles.heroBadge}>
                            <Sparkles size={14} /> Trusted by 10,000+ vehicle owners
                        </motion.span>
                        <motion.h1 variants={fadeInUp} custom={1}>
                            Book Your Vehicle Service <span className="gradient-text">in Minutes</span>
                        </motion.h1>
                        <motion.p variants={fadeInUp} custom={2}>
                            Find top-rated service centers near you, book online, and track every step — from pickup to delivery. No more waiting in queues.
                        </motion.p>
                        <motion.div variants={fadeInUp} custom={3} className={styles.heroCtas}>
                            <Button size="lg" onClick={goToBooking}>
                                Get Started <ArrowRight size={18} />
                            </Button>
                            <Button size="lg" variant="outline" onClick={() => navigate('/services')}>
                                Explore Services
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Status Tracking Showcase */}
                    <motion.div
                        className={styles.heroShowcase}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className={styles.showcaseCard}>
                            <div className={styles.showcaseHeader}>
                                <Eye size={16} />
                                <span>Live Tracking Preview</span>
                            </div>
                            <div className={styles.showcaseVehicle}>
                                <Car size={20} />
                                <div>
                                    <strong>Honda City</strong>
                                    <span>KA-03-XY-9876</span>
                                </div>
                                <span className={styles.showcaseStatus}>In Progress</span>
                            </div>
                            <div className={styles.showcaseProgress}>
                                <div className={styles.progressTrack}>
                                    <div className={styles.progressFill} style={{ width: '65%' }}></div>
                                </div>
                                <span>65% Complete</span>
                            </div>
                            <div className={styles.showcaseTimeline}>
                                {showcaseStages.map((stage, i) => (
                                    <div key={i} className={`${styles.timelineStep} ${stage.done ? styles.done : ''} ${stage.active ? styles.active : ''}`}>
                                        <div className={styles.timelineDot}></div>
                                        <span>{stage.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Bar */}
                <motion.div
                    className={styles.statsBar}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    {stats.map((stat, i) => (
                        <div key={i} className={styles.statItem}>
                            <div className={styles.statIcon}>{stat.icon}</div>
                            <div>
                                <strong>{stat.value}</strong>
                                <span>{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className={styles.section}>
                <div className={styles.container}>
                    <motion.div
                        className={styles.sectionHeader}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <span className={styles.sectionBadge}>Simple Process</span>
                        <h2>How It Works</h2>
                        <p>Get your vehicle serviced in 4 easy steps</p>
                    </motion.div>
                    <motion.div
                        className={styles.stepsGrid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {howItWorks.map((step, i) => (
                            <motion.div key={i} variants={fadeInUp} custom={i} className={styles.stepCard}>
                                <div className={styles.stepNumber}>{i + 1}</div>
                                <div className={styles.stepIcon}>{step.icon}</div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ========== FEATURED PROVIDERS ========== */}
            <section className={`${styles.section} ${styles.sectionAlt}`}>
                <div className={styles.container}>
                    <motion.div
                        className={styles.sectionHeader}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <span className={styles.sectionBadge}>Top Rated</span>
                        <h2>Featured Service Centers</h2>
                        <p>Verified, trusted, and highly rated by customers</p>
                    </motion.div>
                    <motion.div
                        className={styles.providersGrid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {featuredProviders.map((provider, i) => {
                            const providerServices = services.filter(s => s.provider_id === provider.provider_id && s.is_active);
                            const providerReviews = reviews.filter(r => r.provider_id === provider.provider_id);
                            return (
                                <motion.div key={provider.provider_id} variants={fadeInUp} custom={i} className={styles.providerCard}>
                                    <div className={styles.providerCover} style={{ background: provider.cover_image ? `url(${provider.cover_image}) center/cover` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                                        <div className={styles.providerBadges}>
                                            {provider.verification_status === 'Verified' && (
                                                <span className={styles.verifiedBadge}><Shield size={12} /> Verified</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.providerInfo}>
                                        <div className={styles.providerLogo}>
                                            {provider.business_logo ? (
                                                <img src={provider.business_logo} alt={provider.company_name} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '1.2rem', borderRadius: '50%' }}>
                                                    {(provider.company_name || 'S')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <h4>{provider.company_name}</h4>
                                        <div className={styles.providerMeta}>
                                            <span><MapPin size={14} /> {provider.address.split(',')[0]}</span>
                                            <span><Star size={14} fill="var(--warning)" stroke="var(--warning)" /> {provider.rating} ({provider.review_count})</span>
                                        </div>
                                        <p className={styles.providerDesc}>{provider.description}</p>
                                        <div className={styles.providerServices}>
                                            {providerServices.slice(0, 3).map(s => (
                                                <span key={s.service_id} className={styles.serviceTag}>{s.service_name.split('(')[0].trim()}</span>
                                            ))}
                                            {providerServices.length > 3 && <span className={styles.serviceTag}>+{providerServices.length - 3} more</span>}
                                        </div>
                                        <div className={styles.providerFooter}>
                                            <span className={styles.startingAt}>{providerServices.length > 0 ? `Starting at ₹${Math.min(...providerServices.map(s => s.base_price)).toLocaleString()}` : 'Contact for pricing'}</span>
                                            <Button size="sm" onClick={goToBooking}>
                                                Book Now <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ========== POPULAR SERVICES ========== */}
            <section className={styles.section}>
                <div className={styles.container}>
                    <motion.div
                        className={styles.sectionHeader}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <span className={styles.sectionBadge}>Most Booked</span>
                        <h2>Popular Services</h2>
                        <p>Our most requested vehicle services</p>
                    </motion.div>
                    <motion.div
                        className={styles.servicesGrid}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >
                        {popularServices.map((service, i) => {
                            const provider = providers.find(p => p.provider_id === service.provider_id);
                            return (
                                <motion.div key={service.service_id} variants={fadeInUp} custom={i} className={styles.serviceCard}>
                                    <div className={styles.serviceIcon}>
                                        <Wrench size={24} />
                                    </div>
                                    <div className={styles.serviceInfo}>
                                        <h4>{service.service_name}</h4>
                                        <p>{service.service_description}</p>
                                        <div className={styles.serviceMeta}>
                                            <span className={styles.servicePrice}>
                                                ₹{service.base_price.toLocaleString()}
                                                {service.price_type === 'Range' && <small> onwards</small>}
                                            </span>
                                            <span className={styles.serviceDuration}>
                                                <Clock size={14} /> {Math.round(service.estimated_duration / 60)}h
                                            </span>
                                        </div>
                                        {provider && <span className={styles.serviceProvider}><MapPin size={12} /> {provider.company_name}</span>}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ========== ACTIVE DISCOUNTS ========== */}
            {activeDiscounts.length > 0 && (
                <section className={`${styles.section} ${styles.sectionAlt}`}>
                    <div className={styles.container}>
                        <motion.div
                            className={styles.sectionHeader}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                        >
                            <span className={styles.sectionBadge}><Tag size={14} /> Offers</span>
                            <h2>Active Discounts</h2>
                            <p>Save on your next service</p>
                        </motion.div>
                        <motion.div
                            className={styles.discountsGrid}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {activeDiscounts.map((discount, i) => {
                                const provider = discount.provider_id ? providers.find(p => p.provider_id === discount.provider_id) : null;
                                return (
                                    <motion.div key={discount.discount_id} variants={fadeInUp} custom={i} className={styles.discountCard}>
                                        <div className={styles.discountBadge}>
                                            {discount.type === 'Percentage' ? (
                                                <><Percent size={18} /> {discount.value}% OFF</>
                                            ) : (
                                                <>₹{discount.value} OFF</>
                                            )}
                                        </div>
                                        <p className={styles.discountDesc}>{discount.description}</p>
                                        {discount.code && <div className={styles.discountCode}>Code: <strong>{discount.code}</strong></div>}
                                        {discount.auto_apply && <div className={styles.autoApply}>✨ Auto-applied</div>}
                                        {discount.min_order > 0 && <span className={styles.discountMin}>Min. order ₹{discount.min_order}</span>}
                                        {provider && <span className={styles.discountProvider}><MapPin size={12} /> {provider.company_name}</span>}
                                        <Button size="sm" variant="outline" onClick={goToBooking}>
                                            Claim Now
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* ========== CTA SECTION ========== */}
            <section className={styles.ctaSection}>
                <motion.div
                    className={styles.ctaContent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <h2>Ready to Get Your Vehicle Serviced?</h2>
                    <p>Join thousands of happy vehicle owners. Book your service today.</p>
                    <div className={styles.ctaButtons}>
                        <Button size="lg" onClick={goToBooking}>
                            Book as Customer <ArrowRight size={18} />
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => navigate('/provider/login')}>
                            Join as Provider
                        </Button>
                    </div>
                </motion.div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div className={styles.footerGrid}>
                        <div className={styles.footerBrand}>
                            <h3><img src="/fos-logo.png" alt="FOS" style={{ height: 24, width: 'auto', objectFit: 'contain', verticalAlign: 'middle', marginRight: 8 }} />FastOnService</h3>
                            <p>Smart Vehicle Service Booking — your one-stop platform for hassle-free vehicle maintenance.</p>
                        </div>
                        <div className={styles.footerLinks}>
                            <h5>Quick Links</h5>
                            <Link to="/services">Services</Link>
                            <Link to="/about">About Us</Link>
                            <Link to="/contact">Contact</Link>
                        </div>
                        <div className={styles.footerLinks}>
                            <h5>For Users</h5>
                            <Link to="/login">Customer Login</Link>
                            <Link to="/provider/login">Provider Login</Link>
                        </div>
                        <div className={styles.footerLinks}>
                            <h5>Contact</h5>
                            <a href="mailto:support@vsbm.com"><Mail size={14} /> support@vsbm.com</a>
                            <a href="tel:+919876543210"><Phone size={14} /> +91 98765 43210</a>
                        </div>
                    </div>
                    <div className={styles.footerBottom}>
                        <p>© 2024 VSBM. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
