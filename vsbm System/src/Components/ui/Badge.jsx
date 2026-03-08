import React from 'react';
import styles from './Badge.module.css';

/**
 * Status Badge Component
 */
const Badge = ({
    children,
    variant = 'default', // 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
    size = 'md', // 'sm' | 'md' | 'lg'
    className = '',
    dot = false,
    ...props
}) => {
    const classNames = [
        styles.badge,
        styles[variant],
        styles[size],
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classNames} {...props}>
            {dot && <span className={styles.dot} />}
            {children}
        </span>
    );
};

export default Badge;
