import React from 'react';
import ServiceCard from './ServiceCard';
import { Search } from 'lucide-react';
import styles from './ServiceList.module.css';

const ServiceList = ({ companies, searchTerm, selectedFilter }) => {
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (company.services && company.services.serviceTypes && company.services.serviceTypes[selectedFilter]);
    
    return matchesSearch && matchesFilter;
  });

  if (filteredCompanies.length === 0) {
    return (
      <div className={styles.noResults}>
        <div className={styles.noResultsIcon}>
          <Search className={styles.searchIcon} />
        </div>
        <h3 className={styles.noResultsTitle}>No Service Providers Found</h3>
        <p className={styles.noResultsText}>
          Try adjusting your search criteria or browse all available services.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.serviceListContainer}>
      <div className={styles.resultsHeader}>
        <h3 className={styles.resultsCount}>
          {filteredCompanies.length} Service Provider{filteredCompanies.length !== 1 ? 's' : ''} Found
        </h3>
      </div>
      
      <div className={styles.serviceList}>
        {filteredCompanies.map((company) => (
          <ServiceCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default ServiceList;