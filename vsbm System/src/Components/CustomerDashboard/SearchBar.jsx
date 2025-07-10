import React from 'react';
import { Search, Filter } from 'lucide-react';
import styles from './SearchBar.module.css';

const SearchBar = ({ searchTerm, setSearchTerm, selectedFilter, setSelectedFilter }) => {
  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputWrapper}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search companies or services..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select 
        className={styles.filterSelect}
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
      >
        <option value="all">All Services</option>
        <option value="general">General Service</option>
        <option value="oil">Oil Change</option>
        <option value="tire">Tire Service</option>
        <option value="water">Water Service</option>
        <option value="battery">Battery Service</option>
        <option value="detailing">Car Detailing</option>
        <option value="engine">Engine Repair</option>
        <option value="paint">Paint Service</option>
        <option value="ac">AC Service</option>
        <option value="polishing">Polishing</option>
        <option value="denting">Denting</option>
        <option value="towing">Towing Service</option>
      </select>
    </div>
  );
};

export default SearchBar;