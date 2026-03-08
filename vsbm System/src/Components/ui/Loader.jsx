import React from 'react';
import styles from './Loader.module.css';

/**
 * Premium Loader/Spinner Component
 */
const Loader = ({
    size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
    variant = 'spinner', // 'spinner' | 'dots' | 'skeleton'
    fullScreen = false,
    className = '',
}) => {
    if (variant === 'skeleton') {
        return <div className={`${styles.skeleton} ${styles[size]} ${className}`} />;
    }

    if (variant === 'dots') {
        return (
            <div className={`${styles.dotsWrapper} ${fullScreen ? styles.fullScreen : ''} ${className}`}>
                <div className={styles.dots}>
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                    <span className={styles.dot} />
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.spinnerWrapper} ${fullScreen ? styles.fullScreen : ''} ${className}`}>
            <div className={`${styles.spinner} ${styles[size]}`}>
                <svg viewBox="0 0 50 50">
                    <circle
                        className={styles.track}
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                    />
                    <circle
                        className={styles.path}
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Loader;
