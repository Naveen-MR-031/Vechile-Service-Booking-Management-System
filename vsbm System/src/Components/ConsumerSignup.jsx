import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './ConsumerSignup.module.css';

const ConsumerSignup = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers
    };
  };

  const passwordValidation = validatePassword(form.password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/consumers', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      
      if (res.status === 201) {
        setTimeout(() => {
          navigate('/consumer-login');
        }, 1000);
      }
    } catch (err) {
      setError('Error creating account. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className="text-center">
          <div className={styles.iconWrapper}>
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600">Join us and start your journey today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            
            <div>
              <label htmlFor="username" className={styles.label}>Username</label>
              <div className={styles.inputWrapper}>
                <User className={styles.icon} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className={styles.iconToggle} /> : <Eye className={styles.iconToggle} />}
                </button>
              </div>

              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className={styles.validationItem}>
                    {passwordValidation.minLength ? <CheckCircle className={styles.valid} /> : <AlertCircle className={styles.invalid} />}
                    <span className={passwordValidation.minLength ? styles.validText : styles.invalidText}>At least 8 characters</span>
                  </div>
                  <div className={styles.validationItem}>
                    {passwordValidation.hasUpperCase ? <CheckCircle className={styles.valid} /> : <AlertCircle className={styles.invalid} />}
                    <span className={passwordValidation.hasUpperCase ? styles.validText : styles.invalidText}>One uppercase letter</span>
                  </div>
                  <div className={styles.validationItem}>
                    {passwordValidation.hasLowerCase ? <CheckCircle className={styles.valid} /> : <AlertCircle className={styles.invalid} />}
                    <span className={passwordValidation.hasLowerCase ? styles.validText : styles.invalidText}>One lowercase letter</span>
                  </div>
                  <div className={styles.validationItem}>
                    {passwordValidation.hasNumbers ? <CheckCircle className={styles.valid} /> : <AlertCircle className={styles.invalid} />}
                    <span className={passwordValidation.hasNumbers ? styles.validText : styles.invalidText}>One number</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className={styles.iconToggle} /> : <Eye className={styles.iconToggle} />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center">
            <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-green-600 border-gray-300 rounded" />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
              I agree to the{' '}
              <Link to="/terms" className="text-green-600 hover:text-green-500">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="text-green-600 hover:text-green-500">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn + ' ' + (isLoading ? styles.loading : styles.active)}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/consumer-login" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConsumerSignup;
