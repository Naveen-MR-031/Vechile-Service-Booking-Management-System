import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Calendar, Wrench, User, Phone, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import styles from './BookingPage.module.css';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { company } = location.state || {};

  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    vehicleType: '',
    vehicleModel: '',
    serviceType: '',
    description: '',
    preferredDate: ''
  });

  const vehicleTypes = ['Car', 'Bike', 'Truck', 'Bus', 'Auto'];
  const serviceTypes = ['General Service', 'Oil Change', 'Tire Service', 'Water Service', 'Battery Service', 'Engine Repair', 'AC Service'];

  const handleChange = (e) => {
    setBookingForm({
      ...bookingForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const bookingData = {
      id: Date.now().toString(),
      companyId: company.id,
      companyName: company.companyName,
      ...bookingForm,
      status: 'pending',
      bookingDate: new Date().toISOString()
    };

    try {
      // Add booking to unified database
      await axios.post('http://localhost:3333/bookings', bookingData);
      alert('Booking submitted successfully!');
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Error submitting booking. Please try again.');
    }
  };

  if (!company) {
    return (
      <div className={styles.errorPage}>
        <h3>No Service Provider Selected</h3>
        <p>Please go back to the dashboard and select a service provider to book an appointment.</p>
        <button onClick={() => navigate('/customer-dashboard')} className={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bookingPage}>
      <div className={styles.bookingHeader}>
        <button onClick={() => navigate('/customer-dashboard')} className={styles.backBtn}>
          <ArrowLeft className={styles.backIcon} />
          Back
        </button>
        <h2 className={styles.headerTitle}>Book Service</h2>
        <p className={styles.headerSubtitle}>Schedule your vehicle service with {company.companyName}</p>
      </div>

      <div className={styles.bookingContainer}>
        <div className={styles.companyInfo}>
          <h3 className={styles.companyName}>{company.companyName}</h3>
          <p className={styles.companyAddress}>{company.address}</p>
          <p className={styles.companyPhone}>{company.phone}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.bookingForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <User className={styles.labelIcon} />
                Your Name
              </label>
              <input
                type="text"
                name="customerName"
                value={bookingForm.customerName}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Phone className={styles.labelIcon} />
                Phone Number
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={bookingForm.customerPhone}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Car className={styles.labelIcon} />
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={bookingForm.vehicleType}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Car className={styles.labelIcon} />
                Vehicle Model
              </label>
              <input
                type="text"
                name="vehicleModel"
                value={bookingForm.vehicleModel}
                onChange={handleChange}
                className={styles.formInput}
                placeholder="e.g., Honda City, Royal Enfield"
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Wrench className={styles.labelIcon} />
                Service Type
              </label>
              <select
                name="serviceType"
                value={bookingForm.serviceType}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                <option value="">Select service type</option>
                {serviceTypes.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Calendar className={styles.labelIcon} />
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                value={bookingForm.preferredDate}
                onChange={handleChange}
                className={styles.formInput}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={bookingForm.description}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="Describe any specific issues or requirements..."
              rows={4}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            <Wrench className={styles.submitIcon} />
            Book Service
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;