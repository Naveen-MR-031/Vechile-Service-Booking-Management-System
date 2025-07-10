import React from 'react';
import ServiceCard from './ServiceCard';
import styles from './ServiceList.module.css';

const ServiceList = ({ companies, searchTerm, selectedFilter }) => {
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(company.services.serviceTypes).some(service => 
        company.services.serviceTypes[service] && 
        service.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = selectedFilter === 'all' || 
      (company.services.serviceTypes[selectedFilter] === true);

    return matchesSearch && matchesFilter;
  });

  if (filteredCompanies.length === 0) {
    return (
      <div className={styles.noResults}>
        <h3>No service providers found</h3>
        <p>Try adjusting your search criteria or filters.</p>
      </div>
    );
  }

  return (
    <div className={styles.serviceGrid}>
      {filteredCompanies.map(company => (
        <ServiceCard key={company.id} company={company} />
      ))}
    </div>
  );
};

export default ServiceList;