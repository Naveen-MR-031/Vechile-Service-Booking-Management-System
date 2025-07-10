import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import ServiceNavbar from './ServiceNavbar';
import ServiceMain from './ServiceMain';
import ServiceSettings from './ServiceSettings';
import styles from './ServiceDashboard.module.css';

const ServiceDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <ServiceMain />;
      case 'settings':
        return <ServiceSettings />;
      default:
        return <ServiceMain />;
    }
  };

  return (
    <div className={styles.serviceDashboard}>
      <ServiceNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={styles.mainContent}>
        {renderContent()}
      </main>
      
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerBrand}>
            <div className={styles.footerBrandIcon}>
              <Wrench className={styles.footerBrandIconSvg} />
            </div>
            <span className={styles.footerBrandText}>Service Provider Dashboard</span>
          </div>
          <p className={styles.footerCopyright}>&copy; 2025 Vehicle Service Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ServiceDashboard;