import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, Wrench } from 'lucide-react';
import axios from 'axios';
import styles from './BookingStatus.module.css';

const BookingStatus = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('http://localhost:3333/bookings');
        setBookings(response.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className={styles.statusIcon} />;
      case 'confirmed':
        return <CheckCircle className={styles.statusIcon} />;
      case 'completed':
        return <CheckCircle className={styles.statusIcon} />;
      case 'cancelled':
        return <XCircle className={styles.statusIcon} />;
      default:
        return <Clock className={styles.statusIcon} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  return (
    <div className={styles.bookingStatusPage}>
      <div className={styles.statusHeader}>
        <h2 className={styles.headerTitle}>Booking Status</h2>
        <p className={styles.headerSubtitle}>Track your service appointments</p>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.noBookings}>
          <Wrench className={styles.noBookingsIcon} />
          <h3>No Bookings Yet</h3>
          <p>You haven't made any service bookings yet.</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div className={styles.bookingInfo}>
                  <h3 className={styles.companyName}>{booking.companyName}</h3>
                  <p className={styles.serviceType}>{booking.serviceType}</p>
                </div>
                <div className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                  {getStatusIcon(booking.status)}
                  <span className={styles.statusText}>{booking.status}</span>
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <div className={styles.detailItem}>
                  <Calendar className={styles.detailIcon} />
                  <span>Preferred Date: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailItem}>
                  <Wrench className={styles.detailIcon} />
                  <span>Vehicle: {booking.vehicleType} - {booking.vehicleModel}</span>
                </div>
                {booking.confirmedDate && (
                  <div className={styles.detailItem}>
                    <CheckCircle className={styles.detailIcon} />
                    <span>Confirmed Date: {new Date(booking.confirmedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {booking.estimatedCost && (
                  <div className={styles.detailItem}>
                    <span className={styles.costLabel}>Estimated Cost: ₹{booking.estimatedCost}</span>
                  </div>
                )}
              </div>

              {booking.description && (
                <div className={styles.bookingDescription}>
                  <p>{booking.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingStatus;