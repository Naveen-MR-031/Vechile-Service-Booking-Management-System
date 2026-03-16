import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Car, Sparkles, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { toast } from 'react-hot-toast';
import styles from './Login.module.css';

const Login = () => {
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
        if (!email) newErrors.email = 'Email is required';
        if (!password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setIsLoading(true);
        setErrors({});
        try {
            const result = await sendOTPAfterLogin(email, password);
            toast.success('OTP sent to your email!');
            setStep('otp');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid email or password';

            if (err.response?.status === 404 || msg.toLowerCase().includes('not found')) {
                toast.error('Account not found. Redirecting to registration...');
                setTimeout(() => navigate('/signup'), 1500);
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
            const result = await sendOTPAfterLogin(email, password);
            toast.success('New OTP sent to your email!');
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
            const name = result.first_name || result.company_name || result.name || 'User';
            toast.success(`Welcome back, ${name}!`);

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
                        Welcome to<br />
                        <span className="gradient-text">FastOnService</span>
                    </h1>
                    <p className={styles.visualDescription}>
                        Your trusted platform for seamless vehicle maintenance and service booking.
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
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Email + Password */}
                        {step === 'credentials' && (
                            <motion.div key="cred-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <h2 className={styles.formTitle}>Sign In</h2>
                                    <p className={styles.formSubtitle}>
                                        Enter your credentials to access your account
                                    </p>
                                </div>

                                <form onSubmit={handleCredentialsSubmit} className={styles.form}>
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
                                        error={errors.email}
                                        icon={<Mail size={18} />}
                                        required
                                    />

                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                                        error={errors.password}
                                        icon={<Lock size={18} />}
                                        required
                                    />

                                    <div className={styles.formOptions}>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" defaultChecked />
                                            <span>Remember me</span>
                                        </label>
                                        <Link to="/forgot-password" className={styles.forgotLink}>
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        loading={isLoading}
                                        icon={<ArrowRight size={18} />}
                                        iconPosition="right"
                                    >
                                        Continue
                                    </Button>
                                </form>

                                <div className={styles.divider}>
                                    <span>or continue with</span>
                                </div>

                                <div className={styles.socialButtons}>
                                    <button type="button" className={styles.socialButton}>
                                        <svg viewBox="0 0 24 24" width="20" height="20">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google
                                    </button>
                                </div>

                                <p className={styles.signupPrompt}>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className={styles.signupLink}>Create one</Link>
                                </p>

                                <p className={styles.providerPrompt}>
                                    Are you a service provider?{' '}
                                    <Link to="/provider/login" className={styles.signupLink}>Partner Portal</Link>
                                </p>
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
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
