import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Wrench, Sparkles, Shield, Users, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import styles from './Login.module.css';

const ProviderLogin = () => {
    const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { sendOTPAfterLogin, loginWithOTP } = useMockData();
    const navigate = useNavigate();
    const otpRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (step === 'otp' && otpRefs.current[0]) {
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
        }
    }, [step]);

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!email) newErrors.email = 'Business email is required';
        if (!password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setIsLoading(true);
        setErrors({});
        try {
            await sendOTPAfterLogin(email, password);
            toast.success('Password verified! OTP sent to your email.');
            setStep('otp');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';

            if (err.response?.status === 404 || msg.includes('not found')) {
                toast.error('Account not found. Redirecting to registration...');
                setTimeout(() => navigate('/provider/signup'), 1500);
                return;
            }

            toast.error(msg);
            if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
                setErrors({ password: msg });
            } else {
                setErrors({ email: msg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);
        try {
            await sendOTPAfterLogin(email, password);
            toast.success('OTP resent to your email!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
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

    const handleVerifyOTP = async (e) => {
        e?.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setErrors({ otp: 'Please enter the complete 6-digit OTP' });
            return;
        }

        setIsLoading(true);
        setErrors({});
        try {
            const result = await loginWithOTP(email, otpString);
            toast.success(`Welcome back, ${result.company_name || result.first_name}!`);
            if (result.role === 'provider' || result.userType === 'serviceProvider') {
                navigate('/provider/dashboard');
            } else {
                navigate('/customer/dashboard');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid OTP. Please try again.';
            toast.error(msg);
            setErrors({ otp: msg });
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Visual Side */}
            <motion.div className={styles.visualSide} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className={styles.visualContent}>
                    <div className={styles.logoLarge}><Wrench size={48} /></div>
                    <h1 className={styles.visualTitle}>
                        Partner Portal<br /><span className="gradient-text">FastOnService</span>
                    </h1>
                    <p className={styles.visualDescription}>
                        Manage your service center, track jobs, and grow your business with our powerful dashboard.
                    </p>
                    <div className={styles.features}>
                        <div className={styles.feature}><Shield size={20} /><span>Secure Business Dashboard</span></div>
                        <div className={styles.feature}><Sparkles size={20} /><span>Real-time Job Tracking</span></div>
                        <div className={styles.feature}><Users size={20} /><span>Customer Management</span></div>
                    </div>
                </div>
                <div className={styles.decoration}>
                    <div className={styles.blob1} /><div className={styles.blob2} /><div className={styles.blob3} />
                </div>
            </motion.div>

            {/* Form Side */}
            <motion.div className={styles.formSide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className={styles.formContainer}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Email + Password */}
                        {step === 'credentials' && (
                            <motion.div key="cred-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <h2 className={styles.formTitle}>Partner Sign In</h2>
                                    <p className={styles.formSubtitle}>Access your service provider dashboard</p>
                                </div>

                                <form onSubmit={handleCredentialsSubmit} className={styles.form}>
                                    <Input
                                        label="Business Email" type="email" name="email"
                                        value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                                        error={errors.email} icon={<Mail size={18} />} required
                                    />
                                    <Input
                                        label="Password" type="password" name="password"
                                        value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                                        error={errors.password} icon={<Lock size={18} />} required
                                    />

                                    <div className={styles.formOptions}>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" /><span>Remember me</span>
                                        </label>
                                        <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                                    </div>

                                    <Button type="submit" fullWidth loading={isLoading} icon={<ArrowRight size={18} />} iconPosition="right">
                                        Continue
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* STEP 2: OTP */}
                        {step === 'otp' && (
                            <motion.div key="otp-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <button onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); setErrors({}); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', padding: 0, fontSize: '0.85rem' }}>
                                        <ArrowLeft size={14} /> Back to login
                                    </button>
                                    <h2 className={styles.formTitle}>
                                        <KeyRound size={24} style={{ display: 'inline', marginRight: '8px' }} />
                                        Verify Your Identity
                                    </h2>
                                    <p className={styles.formSubtitle}>
                                        We've sent a 6-digit OTP to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className={styles.form}>
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

                                    <Button type="submit" fullWidth loading={isLoading}
                                        icon={isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />} iconPosition="right">
                                        Verify & Sign In
                                    </Button>

                                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                        {countdown > 0 ? (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resend in {countdown}s</span>
                                        ) : (
                                            <button type="button" onClick={handleResendOTP}
                                                style={{ background: 'none', border: 'none', color: 'var(--primary, #3b82f6)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}>
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className={styles.signupPrompt}>
                        New partner? <Link to="/provider/signup" className={styles.signupLink}>Register your business</Link>
                    </p>
                    <p className={styles.providerPrompt}>
                        Looking for vehicle service? <Link to="/login" className={styles.signupLink}>Customer Login</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ProviderLogin;
