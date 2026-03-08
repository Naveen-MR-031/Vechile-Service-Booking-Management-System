import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Wrench, Shield, Clock, Star, Zap, Car,
    CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import styles from './ServicesPage.module.css';

const services = [
    {
        icon: Wrench,
        title: 'General Service',
        description: 'Complete vehicle checkup including oil change, filter replacement, and multi-point inspection.',
        features: ['Oil & Filter Change', 'Brake Inspection', 'Fluid Top-up', 'Battery Check'],
        price: 'Starting ₹2,499',
        color: '#FF6B35'
    },
    {
        icon: Shield,
        title: 'Premium Care',
        description: 'Comprehensive service package with extended warranty and priority support.',
        features: ['Full Inspection', 'Premium Parts', '6-Month Warranty', 'Free Pickup'],
        price: 'Starting ₹4,999',
        color: '#3B82F6'
    },
    {
        icon: Zap,
        title: 'Express Service',
        description: 'Quick turnaround service for minor repairs and maintenance.',
        features: ['Same Day Service', 'Quick Diagnostics', 'Minor Repairs', 'Instant Quote'],
        price: 'Starting ₹999',
        color: '#10B981'
    },
    {
        icon: Car,
        title: 'Body & Paint',
        description: 'Professional dent removal, scratch repair, and full body painting.',
        features: ['Dent Removal', 'Scratch Repair', 'Full Painting', 'Polishing'],
        price: 'Starting ₹1,499',
        color: '#8B5CF6'
    },
    {
        icon: Clock,
        title: 'Scheduled Maintenance',
        description: 'Regular maintenance plans to keep your vehicle in perfect condition.',
        features: ['Monthly Checkups', 'Reminder Alerts', 'Priority Booking', 'Discounts'],
        price: 'Starting ₹799/month',
        color: '#F59E0B'
    },
    {
        icon: Star,
        title: 'Detailing & Spa',
        description: 'Complete interior and exterior detailing for a showroom finish.',
        features: ['Interior Cleaning', 'Exterior Polish', 'Ceramic Coating', 'Sanitization'],
        price: 'Starting ₹1,999',
        color: '#EC4899'
    }
];

const ServicesPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <Navbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    <div className={styles.glow1} />
                    <div className={styles.glow2} />
                </div>

                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.badge}>
                        <Sparkles size={14} />
                        Our Services
                    </span>
                    <h1>
                        Premium Vehicle <br />
                        <span className={styles.gradient}>Service Solutions</span>
                    </h1>
                    <p>
                        From routine maintenance to complete overhauls, we offer comprehensive
                        services to keep your vehicle running at its best.
                    </p>
                </motion.div>
            </section>

            {/* Services Grid */}
            <section className={styles.servicesSection}>
                <div className={styles.container}>
                    <div className={styles.servicesGrid}>
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className={styles.serviceCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div
                                    className={styles.serviceIcon}
                                    style={{ '--accent': service.color }}
                                >
                                    <service.icon size={28} />
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                                <ul className={styles.features}>
                                    {service.features.map(feature => (
                                        <li key={feature}>
                                            <CheckCircle size={16} />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className={styles.cardFooter}>
                                    <span className={styles.price}>{service.price}</span>
                                    <Button variant="secondary" size="sm" onClick={() => navigate('/book-service')}>
                                        Book Now <ArrowRight size={16} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.ctaSection}>
                <motion.div
                    className={styles.ctaContent}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2>Ready to get started?</h2>
                    <p>Book your service today and experience the FastOnService difference.</p>
                    <div className={styles.ctaButtons}>
                        <Link to="/signup">
                            <Button variant="primary" size="lg">
                                Get Started <ArrowRight size={18} />
                            </Button>
                        </Link>
                        <Link to="/contact">
                            <Button variant="secondary" size="lg">
                                Contact Us
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>© 2025 FastOnService. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ServicesPage;
