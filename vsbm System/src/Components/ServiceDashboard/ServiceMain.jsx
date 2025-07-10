import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Car, Wrench, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import styles from './ServiceMain.module.css';

const ServiceMain = () => {
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

  const handleConfirmBooking = async (bookingId) => {
    const dropOffDate = prompt('Enter drop-off date (YYYY-MM-DD):');
    const pickUpDate = prompt('Enter pick-up date (YYYY-MM-DD):');
    const estimatedCost = prompt('Enter estimated cost (₹):');
    
    if (!dropOffDate || !pickUpDate || !estimatedCost) {
      alert('Please provide all required information');
      return;
    }

    try {
      const booking = bookings.find(b => b.id === bookingId);
      const updatedBooking = {
        ...booking,
        status: 'confirmed',
        confirmedDate: new Date().toISOString(),
        dropOffDate: dropOffDate,
        pickUpDate: pickUpDate,
        estimatedCost: parseInt(estimatedCost),
        notes: `Confirmed by service provider. Drop-off: ${dropOffDate}, Pick-up: ${pickUpDate}`
      };

      await axios.put(`http://localhost:3333/bookings/${bookingId}`, updatedBooking);
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      ));
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    
    try {
      const booking = bookings.find(b => b.id === bookingId);
      const updatedBooking = {
        ...booking,
        status: 'cancelled',
        notes: reason ? `Rejected: ${reason}` : 'Rejected by service provider'
      };

      await axios.put(`http://localhost:3333/bookings/${bookingId}`, updatedBooking);
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? updatedBooking : b
      ));
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  return (
    <div className={styles.serviceMain}>
      <div className={styles.mainHeader}>
        <h2 className={styles.headerTitle}>Service Bookings</h2>
        <p className={styles.headerSubtitle}>Manage your customer service requests</p>
      </div>

      {bookings.length === 0 ? (
        <div className={styles.noBookings}>
          <Wrench className={styles.noBookingsIcon} />
          <h3>No Bookings Yet</h3>
          <p>You don't have any service bookings at the moment.</p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div className={styles.customerInfo}>
                  <h3 className={styles.customerName}>{booking.customerName}</h3>
                  <p className={styles.serviceType}>{booking.serviceType}</p>
                </div>
                <div className={`${styles.statusBadge} ${styles[`status${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`]}`}>
                  {booking.status}
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <Phone className={styles.detailIcon} />
                    <span>{booking.customerPhone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Car className={styles.detailIcon} />
                    <span>{booking.vehicleType} - {booking.vehicleModel}</span>
                  </div>
                </div>
                
                <div className={styles.detailRow}>
                  <div className={styles.detailItem}>
                    <Calendar className={styles.detailIcon} />
                    <span>Preferred: {new Date(booking.preferredDate).toLocaleDateString()}</span>
                  </div>
                  {booking.confirmedDate && (
                    <div className={styles.detailItem}>
                      <CheckCircle className={styles.detailIcon} />
                      <span>Confirmed: {new Date(booking.confirmedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {booking.dropOffDate && booking.pickUpDate && (
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <Calendar className={styles.detailIcon} />
                      <span>Drop-off: {new Date(booking.dropOffDate).toLocaleDateString()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <Calendar className={styles.detailIcon} />
                      <span>Pick-up: {new Date(booking.pickUpDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {booking.estimatedCost && (
                  <div className={styles.costInfo}>
                    <span className={styles.costLabel}>Estimated Cost: ₹{booking.estimatedCost}</span>
                  </div>
                )}
              </div>

              {(booking.description || booking.notes) && (
                <div className={styles.bookingDescription}>
                  {booking.description && <p><strong>Description:</strong> {booking.description}</p>}
                  {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                </div>
              )}

              {booking.status === 'pending' && (
                <div className={styles.bookingActions}>
                  <button 
                    onClick={() => handleConfirmBooking(booking.id)}
                    className={styles.confirmButton}
                  >
                    <CheckCircle className={styles.actionIcon} />
                    Confirm Booking
                  </button>
                  <button 
                    onClick={() => handleRejectBooking(booking.id)}
                    className={styles.rejectButton}
                  >
                    <XCircle className={styles.actionIcon} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceMain;