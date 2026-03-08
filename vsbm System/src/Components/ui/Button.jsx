import React from 'react';
import { motion } from 'framer-motion';
import styles from './Button.module.css';

/**
 * Premium Button Component
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} fullWidth - Take full width
 * @param {ReactNode} icon - Icon to display
 * @param {string} iconPosition - 'left' | 'right'
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon = null,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.loading,
        className,
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            type={type}
            className={classNames}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            {...props}
        >
            {loading ? (
                <span className={styles.spinner} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
                    <span className={styles.text}>{children}</span>
                    {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
                </>
            )}
        </motion.button>
    );
};

export default Button;
