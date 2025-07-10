import React from 'react';
import { Wrench, Home, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ServiceNavbar.module.css';

const ServiceNavbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <Wrench className={styles.brandIcon} />
          <span className={styles.brandText}>Service Provider Dashboard</span>
        </div>
        
        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${activeTab === 'bookings' ? styles.active : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Home className={styles.navIcon} />
            Bookings
          </button>
          
          <button
            className={`${styles.navLink} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className={styles.navIcon} />
            Settings
          </button>
        </div>
        
        <button onClick={handleLogout} className={styles.logoutButton}>
          <LogOut className={styles.logoutIcon} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default ServiceNavbar;