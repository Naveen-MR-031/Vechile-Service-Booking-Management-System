import React from 'react';
import { motion } from 'framer-motion';
import styles from './Card.module.css';

/**
 * Premium Card Component with glassmorphism option
 */
const Card = ({
    children,
    variant = 'default', // 'default' | 'glass' | 'elevated' | 'outlined'
    interactive = false,
    className = '',
    onClick,
    ...props
}) => {
    const cardClasses = [
        styles.card,
        styles[variant],
        interactive && styles.interactive,
        className,
    ].filter(Boolean).join(' ');

    const Component = interactive ? motion.div : 'div';
    const motionProps = interactive ? {
        whileHover: { scale: 1.02, y: -4 },
        whileTap: { scale: 0.98 },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
    } : {};

    return (
        <Component
            className={cardClasses}
            onClick={onClick}
            {...motionProps}
            {...props}
        >
            {children}
        </Component>
    );
};

// Sub-components
Card.Header = ({ children, className = '' }) => (
    <div className={`${styles.header} ${className}`}>{children}</div>
);

Card.Title = ({ children, className = '' }) => (
    <h3 className={`${styles.title} ${className}`}>{children}</h3>
);

Card.Description = ({ children, className = '' }) => (
    <p className={`${styles.description} ${className}`}>{children}</p>
);

Card.Content = ({ children, className = '' }) => (
    <div className={`${styles.content} ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
    <div className={`${styles.footer} ${className}`}>{children}</div>
);

export default Card;
