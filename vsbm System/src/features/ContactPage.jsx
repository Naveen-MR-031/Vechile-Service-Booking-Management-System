import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Phone, MapPin, Send, MessageSquare,
    Clock, ArrowRight, Sparkles, Car, CheckCircle
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import styles from './ContactPage.module.css';
import toast from 'react-hot-toast';

const contactInfo = [
    {
        icon: Mail,
        title: 'Email Us',
        value: 'support@fastonservice.com',
        description: "We'll respond within 24 hours"
    },
    {
        icon: Phone,
        title: 'Call Us',
        value: '+91 98765 43210',
        description: 'Mon-Sat, 9AM - 6PM IST'
    },
    {
        icon: MapPin,
        title: 'Visit Us',
        value: 'Tech Park, Bangalore',
        description: 'Karnataka, India 560001'
    }
];

const faqs = [
    { q: 'How do I book a service?', a: 'Simply sign up, select your vehicle and service type, choose a provider, and book your preferred time slot.' },
    { q: 'What payment methods are accepted?', a: 'We accept all major cards, UPI, net banking, and wallet payments. Cash on delivery is also available.' },
    { q: 'Can I reschedule my booking?', a: 'Yes, you can reschedule up to 2 hours before your appointment from your dashboard.' },
    { q: 'How are service providers verified?', a: 'All providers undergo background checks, certification verification, and quality audits.' }
];

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

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
                        Contact
                    </span>
                    <h1>
                        Get in <span className={styles.gradient}>Touch</span>
                    </h1>
                    <p>
                        Have questions? We're here to help. Reach out to us and
                        we'll respond as soon as possible.
                    </p>
                </motion.div>
            </section>

            {/* Contact Info Cards */}
            <section className={styles.infoSection}>
                <div className={styles.container}>
                    <div className={styles.infoGrid}>
                        {contactInfo.map((info, index) => (
                            <motion.div
                                key={info.title}
                                className={styles.infoCard}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className={styles.infoIcon}>
                                    <info.icon size={24} />
                                </div>
                                <h3>{info.title}</h3>
                                <p className={styles.infoValue}>{info.value}</p>
                                <p className={styles.infoDesc}>{info.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form + FAQ */}
            <section className={styles.mainSection}>
                <div className={styles.container}>
                    <div className={styles.mainGrid}>
                        {/* Contact Form */}
                        <motion.div
                            className={styles.formCard}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2>
                                <MessageSquare size={24} />
                                Send us a Message
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className={styles.formRow}>
                                    <Input
                                        label="Your Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formRow}>
                                    <Input
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="How can we help you?"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    loading={isSubmitting}
                                >
                                    <Send size={18} />
                                    Send Message
                                </Button>
                            </form>
                        </motion.div>

                        {/* FAQ */}
                        <motion.div
                            className={styles.faqCard}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2>Frequently Asked Questions</h2>
                            <div className={styles.faqList}>
                                {faqs.map((faq, index) => (
                                    <div key={index} className={styles.faqItem}>
                                        <h4>
                                            <CheckCircle size={18} />
                                            {faq.q}
                                        </h4>
                                        <p>{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerBrand}>
                    <img src="/fos-logo.png" alt="FastOnService" style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
                    <span>FastOnService</span>
                </div>
                <p>© 2025 FastOnService. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default ContactPage;
