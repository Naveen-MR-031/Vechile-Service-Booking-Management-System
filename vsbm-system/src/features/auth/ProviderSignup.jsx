import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, User, Phone, MapPin, ArrowRight, ArrowLeft,
    Wrench, CheckCircle, Sparkles, Building, FileText, Hash, ShieldCheck, ImagePlus, KeyRound, Loader2
} from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import styles from './Signup.module.css';

const STEPS = [
    { id: 1, title: 'Account', icon: Mail },
    { id: 2, title: 'Business', icon: Building },
    { id: 3, title: 'Profile', icon: User },
    { id: 4, title: 'Verify', icon: ShieldCheck },
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
        businessLogo: '',
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { registerProvider, sendOTP } = useMockData();
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (step === 4 && otpRefs.current[0]) {
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
        }
    }, [step]);

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
            else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/.test(formData.password))
                newErrors.password = 'Must be 10+ chars with uppercase, lowercase & special character';
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        if (stepNum === 2) {
            if (!formData.businessName) newErrors.businessName = 'Business name is required';
            if (!formData.licenseNumber) newErrors.licenseNumber = 'License number is required';
            if (!formData.businessLogo) newErrors.businessLogo = 'Business image is required';
        }

        if (stepNum === 3) {
            if (!formData.name) newErrors.name = 'Name is required';
            if (!formData.phone) newErrors.phone = 'Phone number is required';
        }

        if (stepNum === 4) {
            const otpString = otp.join('');
            if (!otpString) newErrors.otp = 'OTP is required';
            else if (otpString.length !== 6) newErrors.otp = 'OTP must be 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
        if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
    };

    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOTPPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    const handleSendOTP = async () => {
        if (!validateStep(3)) return;
        
        setIsLoading(true);
        try {
            const res = await sendOTP(formData.email, true, formData.businessName);
            if (res.success) {
                toast.success('Verification code sent to your email!');
                setStep(4);
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            const res = await sendOTP(formData.email, true, formData.businessName);
            if (res.success) {
                toast.success('New code sent to your email!');
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
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
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setErrors({ otp: 'Please enter the complete 6-digit OTP' });
            return;
        }

        setIsLoading(true);
        try {
            const result = await registerProvider({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                address: formData.address,
                userType: 'serviceProvider',
                businessName: formData.businessName,
                licenseNumber: formData.licenseNumber,
                gstNumber: formData.gstNumber,
                otp: otpString,
                businessLogo: formData.businessLogo,
            });

            if (result.success) {
                toast.success('Account created successfully! Welcome aboard!');
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
                        <img src="/fos-icon.png" alt="FastOnService" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
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
                            {step === 4 && 'Verify Email'}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {step === 1 && 'Set up your login credentials'}
                            {step === 2 && 'Tell us about your business'}
                            {step === 3 && 'Complete your profile'}
                            {step === 4 && 'Enter the code sent to your email'}
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

                                    {/* Business Image Upload */}
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.5rem' }}>Business Image *</label>
                                        <div
                                            onClick={() => document.getElementById('businessLogoInput').click()}
                                            style={{
                                                border: `2px dashed ${errors.businessLogo ? 'var(--destructive)' : formData.businessLogo ? 'var(--success)' : 'var(--border)'}`,
                                                borderRadius: 'var(--radius-lg)',
                                                padding: formData.businessLogo ? '0' : '2rem',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                overflow: 'hidden',
                                                background: 'var(--input)',
                                                position: 'relative',
                                                minHeight: '120px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {formData.businessLogo ? (
                                                <img src={formData.businessLogo} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                                            ) : (
                                                <div>
                                                    <ImagePlus size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Click to upload your service center photo</p>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0.25rem 0 0' }}>JPG, PNG (max 2MB)</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            id="businessLogoInput"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error('Image must be under 2MB');
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onload = (ev) => {
                                                    setFormData(prev => ({ ...prev, businessLogo: ev.target.result }));
                                                    if (errors.businessLogo) setErrors(prev => ({ ...prev, businessLogo: '' }));
                                                };
                                                reader.readAsDataURL(file);
                                            }}
                                        />
                                        {errors.businessLogo && <p style={{ color: 'var(--destructive)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.businessLogo}</p>}
                                    </div>
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

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    custom={4}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3 }}
                                    className={styles.stepContent}
                                >
                                    <div className={styles.stepHeader}>
                                        <h2><KeyRound size={22} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />Verify Your Email</h2>
                                        <p>We've sent a 6-digit code to <strong style={{ color: 'var(--text)' }}>{formData.email}</strong></p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '10px 0 20px' }}>
                                        {otp.map((digit, i) => (
                                            <input key={i} ref={el => otpRefs.current[i] = el}
                                                type="text" inputMode="numeric" maxLength={1} value={digit}
                                                onChange={(e) => handleOTPChange(i, e.target.value)}
                                                onKeyDown={(e) => handleOTPKeyDown(i, e)}
                                                onPaste={i === 0 ? handleOTPPaste : undefined}
                                                style={{
                                                    width: '48px', height: '56px', textAlign: 'center',
                                                    fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${errors.otp ? 'var(--destructive, #ef4444)' : digit ? 'var(--primary, #3b82f6)' : 'var(--border, #334155)'}`,
                                                    background: 'var(--bg-input, #0f172a)',
                                                    color: 'var(--text-primary, #f1f5f9)',
                                                    outline: 'none', transition: 'border-color 0.2s'
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {errors.otp && (
                                        <p style={{ color: 'var(--destructive, #ef4444)', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 12px' }}>{errors.otp}</p>
                                    )}

                                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                        {countdown > 0 ? (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resend in {countdown}s</span>
                                        ) : (
                                            <button type="button" onClick={handleResendOTP} disabled={isLoading}
                                                style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
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
                                    disabled={isLoading}
                                >
                                    Back
                                </Button>
                            )}

                            {step < 3 && (
                                <Button
                                    type="button"
                                    fullWidth={step === 1}
                                    onClick={nextStep}
                                    icon={<ArrowRight size={18} />}
                                    iconPosition="right"
                                >
                                    Continue
                                </Button>
                            )}

                            {step === 3 && (
                                <Button
                                    type="button"
                                    onClick={handleSendOTP}
                                    loading={isLoading}
                                    icon={<ShieldCheck size={18} />}
                                    iconPosition="right"
                                >
                                    Send OTP
                                </Button>
                            )}

                            {step === 4 && (
                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    icon={<CheckCircle size={18} />}
                                    iconPosition="right"
                                >
                                    Verify & Register
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
