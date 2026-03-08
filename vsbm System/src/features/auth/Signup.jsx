import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Phone, MapPin, ArrowRight, ArrowLeft,
    Car, CheckCircle, Sparkles
} from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import styles from './Signup.module.css';

const STEPS = [
    { id: 1, title: 'Account', icon: Mail },
    { id: 2, title: 'Profile', icon: User },
];

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        address: '',
        userType: 'customer',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { registerCustomer } = useMockData();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep = (stepNum) => {
        const newErrors = {};

        if (stepNum === 1) {
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        if (stepNum === 2) {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.phone) newErrors.phone = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (!validateStep(step)) return;
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(2)) return;

        setIsLoading(true);
        try {
            const result = await registerCustomer({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
            });

            if (result.success) {
                navigate('/customer/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction) => ({ x: direction < 0 ? 100 : -100, opacity: 0 }),
    };

    return (
        <div className={styles.container}>
            {/* Visual Side - Same style as Login */}
            <motion.div
                className={styles.visualSide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.visualContent}>
                    <div className={styles.logoLarge}>
                        <Car size={48} />
                    </div>
                    <h1 className={styles.visualTitle}>
                        Join thousands of<br />
                        <span className="gradient-text">happy customers</span>
                    </h1>
                    <p className={styles.visualDescription}>
                        Create your account and start booking premium vehicle services today.
                    </p>

                    <div className={styles.features}>
                        <div className={styles.feature}>
                            <Sparkles size={20} />
                            <span>Quick & Easy Booking</span>
                        </div>
                        <div className={styles.feature}>
                            <Sparkles size={20} />
                            <span>Real-time Tracking</span>
                        </div>
                        <div className={styles.feature}>
                            <Sparkles size={20} />
                            <span>Trusted Partners</span>
                        </div>
                    </div>

                    <div className={styles.testimonial}>
                        <p>"The best platform for vehicle service. Quick, reliable, and transparent!"</p>
                        <div className={styles.testimonialAuthor}>
                            <div className={styles.authorAvatar}>R</div>
                            <div>
                                <strong>Rahul Kumar</strong>
                                <span>Vehicle Owner</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.decoration}>
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                </div>
            </motion.div>

            {/* Form Side */}
            <motion.div
                className={styles.formSide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className={styles.formContainer}>
                    {/* Progress Steps */}
                    <div className={styles.progress}>
                        {STEPS.map((s, index) => {
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.id}
                                    className={`${styles.progressStep} ${step >= s.id ? styles.active : ''} ${step > s.id ? styles.completed : ''}`}
                                >
                                    <div className={styles.stepIcon}>
                                        {step > s.id ? <CheckCircle size={20} /> : <Icon size={20} />}
                                    </div>
                                    <span className={styles.stepLabel}>{s.title}</span>
                                    {index < STEPS.length - 1 && <div className={styles.stepLine} />}
                                </div>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <AnimatePresence mode="wait" custom={step}>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    custom={1}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className={styles.stepContent}
                                >
                                    <div className={styles.stepHeader}>
                                        <h2>Create your account</h2>
                                        <p>Enter your email and create a secure password</p>
                                    </div>

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={errors.email}
                                        icon={<Mail size={18} />}
                                        required
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        icon={<Lock size={18} />}
                                        required
                                    />

                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        error={errors.confirmPassword}
                                        icon={<Lock size={18} />}
                                        required
                                    />
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={1}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className={styles.stepContent}
                                >
                                    <div className={styles.stepHeader}>
                                        <h2>Personal Details</h2>
                                        <p>Tell us a bit about yourself</p>
                                    </div>

                                    <Input
                                        label="Full Name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                        icon={<User size={18} />}
                                        required
                                    />

                                    <Input
                                        label="Phone Number"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        error={errors.phone}
                                        icon={<Phone size={18} />}
                                        required
                                        placeholder="e.g. 9876543210"
                                    />

                                    <Input
                                        label="Address (Optional)"
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        icon={<MapPin size={18} />}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className={styles.formActions}>
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={prevStep}
                                    icon={<ArrowLeft size={18} />}
                                >
                                    Back
                                </Button>
                            )}

                            {step < 2 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    loading={isLoading}
                                    icon={<ArrowRight size={18} />}
                                    iconPosition="right"
                                    fullWidth={step === 1}
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    icon={<CheckCircle size={18} />}
                                    iconPosition="right"
                                >
                                    Create Account
                                </Button>
                            )}
                        </div>
                    </form>

                    <p className={styles.loginPrompt}>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.loginLink}>Sign in</Link>
                    </p>

                    <p className={styles.providerPrompt}>
                        Want to become a partner?{' '}
                        <Link to="/provider/signup" className={styles.loginLink}>Join as Provider</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
