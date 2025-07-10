import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Star, Calendar } from 'lucide-react';
import styles from './ServiceCard.module.css';

const ServiceCard = ({ company }) => {
  const navigate = useNavigate();

  const handleBookService = () => {
    navigate('/booking-page', { state: { company } });
  };

  return (
    <div className={styles.serviceCard}>
      <div className={styles.cardHeader}>
        <div className={styles.companyPhoto}>
          <img 
            src={company.photo || 'https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=400'} 
            alt={company.companyName}
            className={styles.companyImage}
          />
        </div>
        <div className={styles.ratingBadge}>
          <Star className={styles.starIcon} />
          <span>{company.rating || '4.5'}</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.companyName}>{company.companyName}</h3>
        
        <div className={styles.companyDetails}>
          <div className={styles.detailItem}>
            <MapPin className={styles.detailIcon} />
            <span className={styles.detailText}>{company.address}</span>
          </div>
          
          <div className={styles.detailItem}>
            <Phone className={styles.detailIcon} />
            <span className={styles.detailText}>{company.phone}</span>
          </div>
        </div>

        <div className={styles.servicesOffered}>
          <h4 className={styles.servicesTitle}>Services Offered:</h4>
          <div className={styles.servicesList}>
            {company.services && company.services.serviceTypes && 
              Object.entries(company.services.serviceTypes)
                .filter(([key, value]) => value)
                .slice(0, 3)
                .map(([service, _]) => (
                  <span key={service} className={styles.serviceTag}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </span>
                ))
            }
            {company.services && company.services.serviceTypes && 
              Object.values(company.services.serviceTypes).filter(Boolean).length > 3 && (
                <span className={styles.moreServices}>
                  +{Object.values(company.services.serviceTypes).filter(Boolean).length - 3} more
                </span>
              )
            }
          </div>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <button 
          onClick={handleBookService}
          className={styles.bookButton}
        >
          <Calendar className={styles.bookIcon} />
          Book Service
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;