// File: ConsumerLogin.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import styles from './ConsumerLogin.module.css';

const ConsumerLogin = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await axios.get('http://localhost:3000/consumers');
      const user = res.data.find(
        (u) =>
          (u.username === form.username || u.email === form.username) &&
          u.password === form.password
      );

      if (user) {
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Error connecting to server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Lock className={styles.lockIcon} />
          </div>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account to continue</p>
        </div>

        <div className={styles.divider}>Please enter your login credentials</div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username or Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} />
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username or email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
              >
                {showPassword ? <EyeOff className={styles.icon} /> : <Eye className={styles.icon} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.optionsRow}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="remember-me" className={styles.checkbox} />
              Remember me
            </label>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot your password?</Link>
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? (
              <div className={styles.loadingWrapper}>
                <div className={styles.spinner}></div>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>

          <div className={styles.signupLink}>
            <p>
              Don't have an account?{' '}
              <Link to="/consumer-signup">Create one now</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumerLogin;
