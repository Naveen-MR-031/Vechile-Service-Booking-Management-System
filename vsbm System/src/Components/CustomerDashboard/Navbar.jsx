import React from 'react';
import { Settings } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navBrand}>
          <div className={styles.brandIcon}>
            <Settings className={styles.brandIconSvg} />
          </div>
          <h1 className={styles.brandTitle}>Vechile Service Hub Dashboard</h1>
        </div>
        <div className={styles.navTabs}>
          <button
            onClick={() => setActiveTab('service')}
            className={`${styles.navTab} ${activeTab === 'service' ? styles.navTabActive : ''}`}
          >
            Service
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`${styles.navTab} ${activeTab === 'contact' ? styles.navTabActive : ''}`}
          >
            Contact Us
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`${styles.navTab} ${activeTab === 'about' ? styles.navTabActive : ''}`}
          >
            About Us
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;