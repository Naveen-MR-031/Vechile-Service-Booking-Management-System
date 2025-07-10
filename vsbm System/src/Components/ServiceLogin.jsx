import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Wrench, User, Mail, Lock, ArrowRight } from "lucide-react";
import styles from "./ServiceLogin.module.css";

const ServiceLogin = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get("http://localhost:5000/serviceDB");
      const users = response.data;

      const user = users.find(
        (u) =>
          u.username === username &&
          u.email === email &&
          u.password === password
      );

      if (user) {
        alert("Login successful!");
        navigate('/');        
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Error while logging in");
    }
  };

  const handleSignupRedirect = () => {
    navigate("/service-signup");
  };

  return (
    <div className={styles.pageWrapper}>
    
      <div className={styles.blobTopLeft}></div>
      <div className={styles.blobBottomRight}></div>

      <div className={styles.imageWrapper}>
        <img
          src="https://media.architecturaldigest.com/photos/66a914f1a958d12e0cc94a8e/16:9/w_2992,h_1683,c_limit/DSC_5903.jpg"
          alt="Vehicle Tool"
          className={styles.bgImage}
        />
      </div>

      <div className={styles.loginBox}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <Wrench className={styles.icon} />
          </div>
          <h2 className={styles.title}>Service Provider Login</h2>
          <p className={styles.subtitle}>
            Access your vehicle service dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" className={styles.loginButton}>
            Login to Dashboard
            <ArrowRight className={styles.arrowIcon} />
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}></div>
          <span className={styles.dividerText}>or</span>
          <div className={styles.dividerLine}></div>
        </div>

        <button onClick={handleSignupRedirect} className={styles.signupButton}>
          New Service Provider? Sign Up
        </button>

        <p className={styles.footerText}>
          Secure login for authorized service providers only
        </p>
      </div>
    </div>
  );
};

export default ServiceLogin;
