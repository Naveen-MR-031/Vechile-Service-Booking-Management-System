import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, History, MapPin, Settings } from "lucide-react";
import axios from "axios";
import SearchBar from "./SearchBar";
import ServiceList from "./ServiceList";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/serviceDB");
        setCompanies(response.data || []);
      } catch (error) {
        console.error("Error loading service providers:", error);
        try {
          const fallbackResponse = await fetch("/serviceDB.json");
          const fallbackData = await fallbackResponse.json();
          setCompanies(fallbackData.serviceProviders || []);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          setCompanies([]);
        }
      }
    };

    fetchServiceProviders();
  }, []);

  const availableServices = [
    {
      key: "general",
      name: "General Service",
      icon: "🔧",
      description: "Complete vehicle maintenance and checkup",
    },
    {
      key: "oil",
      name: "Oil Change",
      icon: "🛢️",
      description: "Engine oil replacement and filter change",
    },
    {
      key: "tire",
      name: "Tire Service",
      icon: "🛞",
      description: "Tire repair, replacement, and alignment",
    },
    {
      key: "water",
      name: "Water Service",
      icon: "💧",
      description: "Cooling system and radiator service",
    },
    {
      key: "battery",
      name: "Battery Service",
      icon: "🔋",
      description: "Battery testing, charging, and replacement",
    },
    {
      key: "detailing",
      name: "Car Detailing",
      icon: "✨",
      description: "Interior and exterior car cleaning",
    },
    {
      key: "engine",
      name: "Engine Repair",
      icon: "⚙️",
      description: "Engine diagnostics and repair services",
    },
    {
      key: "ac",
      name: "AC Service",
      icon: "❄️",
      description: "Air conditioning repair and maintenance",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <h2 className={styles.welcomeTitle}>Welcome to Vechile Service Hub</h2>
        <p className={styles.welcomeSubtitle}>
          Find and book trusted vehicle service providers in your area
        </p>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <button
          className={styles.actionCard}
          onClick={() => navigate("/booking-page")}
        >
          <div className={styles.actionIcon}>
            <Plus className={styles.actionIconSvg} />
          </div>
          <div className={styles.actionContent}>
            <h3 className={styles.actionTitle}>Book Service</h3>
            <p className={styles.actionDescription}>Schedule new appointment</p>
          </div>
        </button>

        <button
          className={styles.actionCard}
          onClick={() => navigate("/booking-status")}
        >
          <div className={`${styles.actionIcon} ${styles.actionIconGreen}`}>
            <History className={styles.actionIconSvg} />
          </div>
          <div className={styles.actionContent}>
            <h3 className={styles.actionTitle}>View History</h3>
            <p className={styles.actionDescription}>Past service records</p>
          </div>
        </button>

        <button className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.actionIconOrange}`}>
            <MapPin className={styles.actionIconSvg} />
          </div>
          <div className={styles.actionContent}>
            <h3 className={styles.actionTitle}>Find Providers</h3>
            <p className={styles.actionDescription}>Locate nearby services</p>
          </div>
        </button>

        <button className={styles.actionCard}>
          <div className={`${styles.actionIcon} ${styles.actionIconPurple}`}>
            <Settings className={styles.actionIconSvg} />
          </div>
          <div className={styles.actionContent}>
            <h3 className={styles.actionTitle}>Settings</h3>
            <p className={styles.actionDescription}>Account preferences</p>
          </div>
        </button>
      </div>

      {/* Available Services */}
      <div className={styles.servicesSection}>
        <h3 className={styles.sectionTitle}>Available Services</h3>
        <div className={styles.servicesGrid}>
          {availableServices.map((service) => (
            <div key={service.key} className={styles.serviceItem}>
              <div className={styles.serviceIcon}>{service.icon}</div>
              <div className={styles.serviceContent}>
                <h4 className={styles.serviceName}>{service.name}</h4>
                <p className={styles.serviceDescription}>
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Providers */}
      <div className={styles.providersSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Service Providers</h3>
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        </div>
        <ServiceList
          companies={companies}
          searchTerm={searchTerm}
          selectedFilter={selectedFilter}
        />
      </div>
    </div>
  );
};

export default Dashboard;
