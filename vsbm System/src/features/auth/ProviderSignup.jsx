import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Phone, MapPin, ArrowRight, ArrowLeft,
    Wrench, CheckCircle, Sparkles, Building, FileText, Hash
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import styles from './Signup.module.css';

const STEPS = [
    { id: 1, title: 'Account', icon: Mail },
    { id: 2, title: 'Business', icon: Building },
    { id: 3, title: 'Profile', icon: User },
];

const ProviderSignup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone: '',
        address: '',
        businessName: '',
        licenseNumber: '',
        gstNumber: '',
        userType: 'serviceProvider',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
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
            if (!formData.businessName) newErrors.businessName = 'Business name is required';
            if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
        }

        if (stepNum === 3) {
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
        if (!validateStep(3)) return;

        setIsLoading(true);
        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                userType: 'serviceProvider',
                businessName: formData.businessName,
                licenseNumber: formData.licenseNumber,
                gstNumber: formData.gstNumber,
            });

            if (result.success) {
                navigate('/provider/dashboard');
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
            {/* Visual Side */}
            <motion.div
                className={styles.visualSide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.visualContent}>
                    <div className={styles.logoLarge}>
                        <Wrench size={48} />
                    </div>
                    <h1 className={styles.visualTitle}>
                        Register your<br />
                        <span className="gradient-text">Service Center</span>
                    </h1>
                    <p className={styles.visualDescription}>
                        Join our network of trusted service providers and grow your automotive business.
                    </p>

                    {/* Progress Steps */}
                    <div className={styles.testimonial}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {STEPS.map((s) => (
                                <div
                                    key={s.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        opacity: step >= s.id ? 1 : 0.4,
                                        transition: 'opacity 0.3s',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: step >= s.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            color: step >= s.id ? '#fff' : 'rgba(255,255,255,0.5)',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {step > s.id ? <CheckCircle size={16} /> : s.id}
                                    </div>
                                    <span style={{ color: 'rgba(250,250,250,0.8)', fontSize: '0.85rem' }}>{s.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.decoration}>
                    <div className={styles.blob1} />
                    <div className={styles.blob2} />
                    <div className={styles.blob3} />
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
                    <div className={styles.formHeader}>
                        <div className={styles.stepIndicator}>
                            {STEPS.map((s) => (
                                <div
                                    key={s.id}
                                    className={`${styles.stepDot} ${step >= s.id ? styles.stepActive : ''}`}
                                />
                            ))}
                        </div>
                        <h2 className={styles.formTitle}>
                            {step === 1 && 'Create Account'}
                            {step === 2 && 'Business Details'}
                            {step === 3 && 'Owner Profile'}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {step === 1 && 'Set up your login credentials'}
                            {step === 2 && 'Tell us about your business'}
                            {step === 3 && 'Complete your profile'}
                        </p>
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
                                    <Input
                                        label="Business Email"
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
                                    custom={2}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className={styles.stepContent}
                                >
                                    <Input
                                        label="Business Name"
                                        type="text"
                                        name="businessName"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        error={errors.businessName}
                                        icon={<Building size={18} />}
                                        required
                                    />
                                    <Input
                                        label="License Number"
                                        type="text"
                                        name="licenseNumber"
                                        value={formData.licenseNumber}
                                        onChange={handleChange}
                                        error={errors.licenseNumber}
                                        icon={<FileText size={18} />}
                                        required
                                    />
                                    <Input
                                        label="GST Number (Optional)"
                                        type="text"
                                        name="gstNumber"
                                        value={formData.gstNumber}
                                        onChange={handleChange}
                                        error={errors.gstNumber}
                                        icon={<Hash size={18} />}
                                    />
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    custom={3}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className={styles.stepContent}
                                >
                                    <Input
                                        label="Owner Name"
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
                                    />
                                    <Input
                                        label="Service Center Address"
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        icon={<MapPin size={18} />}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={styles.formActions}>
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    icon={<ArrowLeft size={18} />}
                                >
                                    Back
                                </Button>
                            )}

                            {step < 3 ? (
                                <Button
                                    type="button"
                                    fullWidth={step === 1}
                                    onClick={nextStep}
                                    icon={<ArrowRight size={18} />}
                                    iconPosition="right"
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
                                    Register Business
                                </Button>
                            )}
                        </div>
                    </form>

                    <p className={styles.signupPrompt}>
                        Already a partner?{' '}
                        <Link to="/provider/login" className={styles.signupLink}>Sign in</Link>
                    </p>

                    <p className={styles.providerPrompt}>
                        Looking for vehicle service?{' '}
                        <Link to="/signup" className={styles.signupLink}>Customer Signup</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProviderSignup;
