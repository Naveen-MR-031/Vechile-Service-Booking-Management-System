import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react'; 
import Navbar from './Navbar';
import Dashboard from './Dashboard';
import ContactUs from './ContactUs';
import AboutUs from './AboutUs';
import Settings from './Settings';
import BookingStatus from './BookingStatus';
import styles from './CustomerDashboard.module.css';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('service');

  const renderContent = () => {
    switch (activeTab) {
      case 'service':
        return <Dashboard />;
      case 'contact':
        return <ContactUs />;
      case 'about':
        return <AboutUs />;
      case 'settings':
        return <Settings />;
      case 'bookings':
        return <BookingStatus />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={styles.customerDashboard}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={styles.mainContent}>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <div className={styles.footerBrand}>
                <div className={styles.footerBrandIcon}>
                  <SettingsIcon className={styles.footerBrandIconSvg} /> {/* ✅ renamed usage */}
                </div>
                <span className={styles.footerBrandText}>Vechile Service Hub</span>
              </div>
              <p className={styles.footerDescription}>
                Your trusted partner for comprehensive vehicle service and maintenance.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Services</h4>
              <ul className={styles.footerList}>
                <li><a href="#" className={styles.footerLink}>Oil Change</a></li>
                <li><a href="#" className={styles.footerLink}>Brake Service</a></li>
                <li><a href="#" className={styles.footerLink}>Tire Service</a></li>
                <li><a href="#" className={styles.footerLink}>Engine Diagnostics</a></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Support</h4>
              <ul className={styles.footerList}>
                <li><a href="#" className={styles.footerLink}>Help Center</a></li>
                <li><a href="#" className={styles.footerLink}>Contact Us</a></li>
                <li><a href="#" className={styles.footerLink}>FAQ</a></li>
                <li><a href="#" className={styles.footerLink}>Live Chat</a></li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h4 className={styles.footerTitle}>Company</h4>
              <ul className={styles.footerList}>
                <li><a href="#" className={styles.footerLink}>About Us</a></li>
                <li><a href="#" className={styles.footerLink}>Careers</a></li>
                <li><a href="#" className={styles.footerLink}>Privacy Policy</a></li>
                <li><a href="#" className={styles.footerLink}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p className={styles.footerCopyright}>
              &copy; 2025 Vechile Service Hub Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;
