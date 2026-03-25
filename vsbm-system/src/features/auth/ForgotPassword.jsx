import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, KeyRound, Lock, CheckCircle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import styles from './Login.module.css';

const ForgotPassword = () => {
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
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

    const handleSendOTP = async (e) => {
        e?.preventDefault();
        if (!email) { setErrors({ email: 'Email is required' }); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: 'Invalid email' }); return; }

        setIsLoading(true);
        setErrors({});
        try {
            await authAPI.forgotPassword({ email });
            toast.success('Reset code sent to your email!');
            setStep('otp');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            const status = err.response?.status;
            const msg = err.response?.data?.message || 'Failed to send reset code';
            // 429 = rate limit, code was already sent — move to OTP step
            if (status === 429) {
                toast.success('Code was already sent. Check your email!');
                setStep('otp');
                setCountdown(60);
                setOtp(['', '', '', '', '', '']);
            } else if (status === 404) {
                toast.error('No account found with this email');
                setErrors({ email: msg });
            } else {
                toast.error(msg);
                setErrors({ email: msg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            await authAPI.forgotPassword({ email });
            toast.success('New reset code sent!');
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend');
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

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setErrors({ otp: 'Please enter the complete 6-digit code' });
            return;
        }

        setIsLoading(true);
        setErrors({});
        try {
            await authAPI.verifyResetOTP({ email, otp: otpString });
            toast.success('Code verified!');
            setStep('reset');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid or expired code';
            toast.error(msg);
            setErrors({ otp: msg });
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!newPassword) newErrors.newPassword = 'Password is required';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{10,}$/.test(newPassword))
            newErrors.newPassword = 'Must be 10+ chars with uppercase, lowercase & special character';
        if (newPassword !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        setIsLoading(true);
        setErrors({});
        try {
            await authAPI.resetPassword({ email, otp: otp.join(''), newPassword });
            toast.success('Password reset successful!');
            setStep('done');
        } catch (err) {
            const msg = err.response?.data?.message || 'Reset failed';
            toast.error(msg);
            if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('expired')) {
                setStep('otp');
                setOtp(['', '', '', '', '', '']);
                setErrors({ otp: msg });
            } else {
                setErrors({ newPassword: msg });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Visual Side */}
            <motion.div className={styles.visualSide} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <div className={styles.visualContent}>
                    <div className={styles.logoLarge}>
                        <img src="/fos-icon.png" alt="FastOnService" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                    </div>
                    <h1 className={styles.visualTitle}>
                        Reset Your<br /><span className="gradient-text">Password</span>
                    </h1>
                    <p className={styles.visualDescription}>
                        Don't worry, we'll send you a verification code to reset your password securely.
                    </p>
                </div>
                <div className={styles.decoration}>
                    <div className={styles.blob1} /><div className={styles.blob2} /><div className={styles.blob3} />
                </div>
            </motion.div>

            {/* Form Side */}
            <motion.div className={styles.formSide} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className={styles.formContainer}>
                    <AnimatePresence mode="wait">

                        {/* Step 1: Enter Email */}
                        {step === 'email' && (
                            <motion.div key="email-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <h2 className={styles.formTitle}>Forgot Password</h2>
                                    <p className={styles.formSubtitle}>Enter your email to receive a reset code</p>
                                </div>
                                <form onSubmit={handleSendOTP} className={styles.form}>
                                    <Input
                                        label="Email Address" type="email" name="email"
                                        value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
                                        error={errors.email} icon={<Mail size={18} />} required
                                    />
                                    <Button type="submit" fullWidth loading={isLoading} icon={<ArrowRight size={18} />} iconPosition="right">
                                        Send Reset Code
                                    </Button>
                                </form>

                                <p className={styles.registerPrompt} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                    Remember your password?{' '}
                                    <Link to="/login" className={styles.registerLink}>Sign in</Link>
                                </p>
                            </motion.div>
                        )}

                        {/* Step 2: Enter OTP */}
                        {step === 'otp' && (
                            <motion.div key="otp-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <button onClick={() => setStep('email')}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', padding: 0, fontSize: '0.85rem' }}>
                                        <ArrowLeft size={14} /> Back
                                    </button>
                                    <h2 className={styles.formTitle}>
                                        <KeyRound size={24} style={{ display: 'inline', marginRight: '8px' }} />
                                        Enter Reset Code
                                    </h2>
                                    <p className={styles.formSubtitle}>
                                        We've sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
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
                                    <Button type="submit" fullWidth icon={<ArrowRight size={18} />} iconPosition="right">
                                        Verify Code
                                    </Button>
                                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                        {countdown > 0 ? (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resend in {countdown}s</span>
                                        ) : (
                                            <button type="button" onClick={handleResend} disabled={isLoading}
                                                style={{ color: 'var(--primary)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem' }}>
                                                Resend Code
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'reset' && (
                            <motion.div key="reset-step" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className={styles.formHeader}>
                                    <h2 className={styles.formTitle}>
                                        <Lock size={24} style={{ display: 'inline', marginRight: '8px' }} />
                                        Set New Password
                                    </h2>
                                    <p className={styles.formSubtitle}>Choose a strong password for your account</p>
                                </div>
                                <form onSubmit={handleResetPassword} className={styles.form}>
                                    <Input
                                        label="New Password" type="password" name="newPassword"
                                        value={newPassword} onChange={(e) => { setNewPassword(e.target.value); if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' })); }}
                                        error={errors.newPassword} icon={<Lock size={18} />} required
                                    />
                                    <Input
                                        label="Confirm Password" type="password" name="confirmPassword"
                                        value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                                        error={errors.confirmPassword} icon={<Lock size={18} />} required
                                    />
                                    <Button type="submit" fullWidth loading={isLoading} icon={<CheckCircle size={18} />} iconPosition="right">
                                        Reset Password
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'done' && (
                            <motion.div key="done-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <CheckCircle size={64} style={{ color: 'var(--success, #22c55e)', marginBottom: '1.5rem' }} />
                                    <h2 className={styles.formTitle} style={{ marginBottom: '0.5rem' }}>Password Reset!</h2>
                                    <p className={styles.formSubtitle} style={{ marginBottom: '2rem' }}>
                                        Your password has been updated successfully.
                                    </p>
                                    <Button fullWidth onClick={() => navigate('/login')} icon={<ArrowRight size={18} />} iconPosition="right">
                                        Back to Login
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
