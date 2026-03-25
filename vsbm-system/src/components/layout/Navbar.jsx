import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car, Menu, X, Sun, Moon, User, LogOut,
    LayoutDashboard, Settings, ChevronDown, ArrowLeft
} from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import BackButton from '../ui/BackButton';
import styles from './Navbar.module.css';

const Navbar = ({ variant = 'default' }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { currentUser, logout } = useMockData();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (isProfileOpen && !e.target.closest(`.${styles.profileWrapper}`)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [isProfileOpen]);

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
    ];

    const getDashboardLink = () => {
        if (!currentUser) return '/login';
        return currentUser.role === 'provider' ? '/provider/dashboard' : '/customer/dashboard';
    };

    const getUserName = () => {
        if (!currentUser) return '';
        return currentUser.name || currentUser.first_name || currentUser.company_name || currentUser.businessName || 'User';
    };

    const getUserInitial = () => {
        const name = getUserName();
        return name ? name.charAt(0).toUpperCase() : 'U';
    };

    const getUserEmail = () => {
        return currentUser?.email || '';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    const isDashboard = variant === 'dashboard';

    return (
        <motion.nav
            className={`${styles.navbar} ${isScrolled || isDashboard ? styles.scrolled : ''} ${isDashboard ? styles.dashboard : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
            <div className={styles.container}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <img src="/fos-icon.png" alt="FastOnService" className={styles.logoImg} />
                    <span className={styles.logoText}>Fast<span className={styles.logoAccent}>On</span>Service</span>
                </Link>

                {/* Desktop Back Button */}
                <BackButton />

                {/* Desktop Navigation - only on default variant */}
                {!isDashboard && (
                    <div className={styles.navLinks}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`${styles.navLink} ${location.pathname === link.href ? styles.active : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Theme Toggle */}
                    <button className={styles.iconButton} onClick={toggleTheme} title="Toggle theme">
                        <motion.div
                            initial={false}
                            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.div>
                    </button>

                    {currentUser ? (
                        /* Profile Dropdown */
                        <div className={styles.profileWrapper}>
                            <button
                                className={styles.profileButton}
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <span className={styles.avatar}>{getUserInitial()}</span>
                                <span className={styles.userName}>{getUserName()}</span>
                                <ChevronDown size={16} className={isProfileOpen ? styles.rotated : ''} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        className={styles.dropdown}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    >
                                        <div className={styles.dropdownHeader}>
                                            <p className={styles.dropdownName}>{getUserName()}</p>
                                            <p className={styles.dropdownEmail}>{getUserEmail()}</p>
                                            <span className={styles.roleBadge}>
                                                {currentUser.role === 'provider' ? 'Service Provider' : 'Customer'}
                                            </span>
                                        </div>
                                        <div className={styles.dropdownDivider} />
                                        <Link to={getDashboardLink()} className={styles.dropdownItem} onClick={() => setIsProfileOpen(false)}>
                                            <LayoutDashboard size={18} />
                                            Dashboard
                                        </Link>
                                        <div className={styles.dropdownDivider} />
                                        <button className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        /* Auth Buttons */
                        <div className={styles.authButtons}>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                                Sign In
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => navigate('/provider/login')}>
                                Partner Login
                            </Button>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className={styles.menuToggle}
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        className={styles.mobileMenu}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {!isDashboard && navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={styles.mobileLink}
                                onClick={() => setIsMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {!currentUser && (
                            <div className={styles.mobileAuthButtons}>
                                <Button fullWidth variant="secondary" onClick={() => { navigate('/login'); setIsMobileOpen(false); }}>
                                    Sign In
                                </Button>
                                <Button fullWidth variant="primary" onClick={() => { navigate('/provider/login'); setIsMobileOpen(false); }}>
                                    Partner Login
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
