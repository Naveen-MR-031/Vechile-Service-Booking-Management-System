import React from "react";
import styles from "./FrontPage.module.css";
import { Car, Wrench, Shield, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const navigate = useNavigate(); 

  const handleBookServiceClick = () => {
    navigate("/consumer-login"); 
  };

  return (
    <div className={styles.container} >
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navWrapper}>
          <div className={styles.logoSection}>
            <Car className={styles.carIcon} />
            <h1 className={styles.logoText}>Vehicle Service Hub</h1>
          </div>
          <button
            className={styles.providerButton}
            onClick={() => navigate("/service-login")}
          >
            Service Provider Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className={styles.main}>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>
            Keep Your Vehicle
            <span className={styles.heroHighlight}>Running Smoothly</span>
          </h2>
          <p className={styles.heroSubtitle}>
            Book trusted car & bike services online with certified professionals
          </p>
          <button
            onClick={handleBookServiceClick}
            className={styles.bookButton}
          >
            <Wrench className={styles.iconInline} />
            Book a Service
          </button>
        </div>

        {/* Features Section */}
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
              <Shield className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>Trusted Professionals</h3>
            <p className={styles.featureDesc}>
              Certified mechanics with years of experience
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
              <Clock className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>Quick Service</h3>
            <p className={styles.featureDesc}>
              Fast and efficient service at your convenience
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
              <Car className={styles.iconFeature} />
            </div>
            <h3 className={styles.featureTitle}>All Vehicles</h3>
            <p className={styles.featureDesc}>
              Support for cars, bikes, and motorcycles
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            © 2025 Vehicle Service Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FrontPage;

