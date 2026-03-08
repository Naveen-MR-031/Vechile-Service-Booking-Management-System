import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Car, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import styles from './Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email or Phone is required';
        // Removed strict email regex to allow phone numbers
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                const dashboard = result.user.userType === 'serviceProvider'
                    ? '/provider/dashboard'
                    : '/customer/dashboard';
                navigate(dashboard);
            }
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
                        <Car size={48} />
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

                {/* Decorative Elements */}
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
                        <h2 className={styles.formTitle}>Sign In</h2>
                        <p className={styles.formSubtitle}>
                            Enter your credentials to access your account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Email or Phone Number"
                            type="text"
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

                        <div className={styles.formOptions}>
                            <label className={styles.checkbox}>
                                <input type="checkbox" />
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
                            Sign In
                        </Button>
                    </form>

                    <div className={styles.divider}>
                        <span>or continue with</span>
                    </div>

                    <div className={styles.socialButtons}>
                        <button className={styles.socialButton}>
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
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
