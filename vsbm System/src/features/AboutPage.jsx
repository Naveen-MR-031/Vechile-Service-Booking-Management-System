import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Users, Target, Award, TrendingUp, Heart,
    ArrowRight, Sparkles, CheckCircle, Car
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import styles from './AboutPage.module.css';

const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '500+', label: 'Service Partners' },
    { number: '100+', label: 'Cities Covered' },
    { number: '4.9', label: 'Average Rating' }
];

const values = [
    {
        icon: Target,
        title: 'Our Mission',
        description: 'To revolutionize vehicle maintenance by connecting owners with trusted service providers through technology.'
    },
    {
        icon: Heart,
        title: 'Customer First',
        description: 'Every decision we make is driven by our commitment to delivering exceptional customer experiences.'
    },
    {
        icon: Award,
        title: 'Quality Assurance',
        description: 'We partner only with certified and vetted service providers to ensure top-quality work.'
    },
    {
        icon: TrendingUp,
        title: 'Innovation',
        description: 'Constantly evolving our platform to bring you the latest in vehicle service technology.'
    }
];

const team = [
    { name: 'Naveen Kumar', role: 'Founder & CEO', avatar: 'N' },
    { name: 'Priya Sharma', role: 'Head of Operations', avatar: 'P' },
    { name: 'Rahul Singh', role: 'Tech Lead', avatar: 'R' },
    { name: 'Anita Desai', role: 'Customer Success', avatar: 'A' }
];

const AboutPage = () => {
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
                        About Us
                    </span>
                    <h1>
                        Building the Future of <br />
                        <span className={styles.gradient}>Vehicle Service</span>
                    </h1>
                    <p>
                        Founded in 2024, FastOnService is on a mission to revolutionize
                        how vehicle owners connect with trusted service providers.
                    </p>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className={styles.statsSection}>
                <div className={styles.container}>
                    <div className={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className={styles.statCard}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <span className={styles.statNumber}>{stat.number}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className={styles.storySection}>
                <div className={styles.container}>
                    <motion.div
                        className={styles.storyContent}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Our Story</h2>
                        <p>
                            FastOnService was born from a simple frustration: finding reliable vehicle
                            service was too hard. As car enthusiasts ourselves, we understood the anxiety
                            of handing over your vehicle to an unknown mechanic.
                        </p>
                        <p>
                            We built FastOnService to bridge this gap. Our platform connects vehicle owners
                            with verified, professional service providers. With transparent pricing, real-time
                            tracking, and customer reviews, we're making vehicle maintenance stress-free.
                        </p>
                        <p>
                            Today, we serve over 50,000 customers across 100+ cities, and we're just getting started.
                            Our vision is to become India's most trusted vehicle service platform.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Values Section */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>What Drives Us</h2>
                    <div className={styles.valuesGrid}>
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                className={styles.valueCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={styles.valueIcon}>
                                    <value.icon size={24} />
                                </div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className={styles.teamSection}>
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Meet Our Team</h2>
                    <div className={styles.teamGrid}>
                        {team.map((member, index) => (
                            <motion.div
                                key={member.name}
                                className={styles.teamCard}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={styles.avatar}>{member.avatar}</div>
                                <h3>{member.name}</h3>
                                <p>{member.role}</p>
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
                    <h2>Join the FastOnService Family</h2>
                    <p>Experience the future of vehicle service today.</p>
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
                <div className={styles.footerBrand}>
                    <Car size={24} />
                    <span>FastOnService</span>
                </div>
                <p>© 2025 FastOnService. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AboutPage;
