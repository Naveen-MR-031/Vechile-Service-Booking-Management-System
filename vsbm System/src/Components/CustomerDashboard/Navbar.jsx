import React from 'react';
import { Settings, Home, Phone, Info, LogOut, Calendar } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Settings className={styles.brandIcon} />
          <span className={styles.brandText}>Vehicle Service Hub</span>
        </div>
        
        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${activeTab === 'service' ? styles.active : ''}`}
            onClick={() => setActiveTab('service')}
          >
            <Home className={styles.navIcon} />
            Services
          </button>
          
          <button
            className={`${styles.navLink} ${activeTab === 'contact' ? styles.active : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <Phone className={styles.navIcon} />
            Contact
          </button>
          
          <button
            className={`${styles.navLink} ${activeTab === 'about' ? styles.active : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info className={styles.navIcon} />
            About
          </button>
          
          <button
            className={`${styles.navLink} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar className={styles.navIcon} />
            Booking Status
          </button>
          
          <button
            className={`${styles.navLink} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className={styles.navIcon} />
            Settings
          </button>
        </div>
        
        <button className={styles.logoutButton}>
          <LogOut className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;