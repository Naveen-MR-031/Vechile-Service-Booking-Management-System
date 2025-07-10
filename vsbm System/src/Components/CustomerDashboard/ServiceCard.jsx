import React from 'react';
import { Settings, MapPin, Phone } from 'lucide-react';
import styles from './ServiceCard.module.css';

const ServiceCard = ({ company }) => {
  const getAvailableServices = () => {
    const services = [];
    Object.entries(company.services.serviceTypes).forEach(([key, value]) => {
      if (value) {
        services.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    });
    return services;
  };

  const getVehicleTypes = () => {
    const vehicles = [];
    Object.entries(company.services.vehicleTypes).forEach(([key, value]) => {
      if (value) {
        vehicles.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    });
    return vehicles;
  };

  return (
    <div className={styles.serviceCard}>
      <div className={styles.cardImage}>
        {company.photos && company.photos.length > 0 ? (
          <img 
            src={`http://localhost:5000/images/${company.photos[0]}`} 
            alt={company.companyName}
            className={styles.companyImage}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={styles.placeholderImage}>
          <Settings className={styles.placeholderIcon} />
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.companyName}>{company.companyName}</h3>
        
        <div className={styles.companyInfo}>
          <div className={styles.infoItem}>
            <MapPin className={styles.infoIcon} />
            <span className={styles.infoText}>{company.address}</span>
          </div>
          <div className={styles.infoItem}>
            <Phone className={styles.infoIcon} />
            <span className={styles.infoText}>{company.phone}</span>
          </div>
        </div>

        <div className={styles.servicesSection}>
          <h4 className={styles.sectionTitle}>Vehicle Types:</h4>
          <div className={styles.tagContainer}>
            {getVehicleTypes().map((vehicle, index) => (
              <span key={index} className={styles.vehicleTag}>
                {vehicle}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.servicesSection}>
          <h4 className={styles.sectionTitle}>Services:</h4>
          <div className={styles.tagContainer}>
            {getAvailableServices().slice(0, 4).map((service, index) => (
              <span key={index} className={styles.serviceTag}>
                {service}
              </span>
            ))}
            {getAvailableServices().length > 4 && (
              <span className={styles.moreTag}>
                +{getAvailableServices().length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className={styles.cardActions}>
          <button className={styles.viewButton}>
            View Details
          </button>
          <button className={styles.bookButton}>
            Book Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;