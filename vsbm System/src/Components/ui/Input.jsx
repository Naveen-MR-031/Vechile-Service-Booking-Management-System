import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './Input.module.css';

/**
 * Premium Input Component with floating label
 */
const Input = forwardRef(({
    label,
    type = 'text',
    error,
    success,
    helperText,
    icon,
    className = '',
    disabled = false,
    required = false,
    ...props
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const handleFocus = (e) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        setHasValue(!!e.target.value);
        props.onBlur?.(e);
    };

    const handleChange = (e) => {
        setHasValue(!!e.target.value);
        props.onChange?.(e);
    };

    const containerClass = [
        styles.container,
        isFocused && styles.focused,
        hasValue && styles.hasValue,
        error && styles.error,
        success && styles.success,
        disabled && styles.disabled,
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClass}>
            <div className={styles.inputWrapper}>
                {icon && <span className={styles.icon}>{icon}</span>}

                <input
                    ref={ref}
                    type={inputType}
                    className={styles.input}
                    disabled={disabled}
                    required={required}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    {...props}
                />

                {label && (
                    <label className={styles.label}>
                        {label}
                        {required && <span className={styles.required}>*</span>}
                    </label>
                )}

                {type === 'password' && (
                    <button
                        type="button"
                        className={styles.toggle}
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}

                {error && <AlertCircle className={styles.statusIcon} size={18} />}
                {success && <CheckCircle className={styles.statusIcon} size={18} />}
            </div>

            {(helperText || error) && (
                <span className={styles.helperText}>
                    {error || helperText}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
