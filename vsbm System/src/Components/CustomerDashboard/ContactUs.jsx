import React from 'react';
import { Phone, Mail, MessageCircle, MapPin, Star } from 'lucide-react';
import styles from './ContactUs.module.css';

const ContactUs = () => {
  return (
    <div className={styles.contactPage}>

      <div className={styles.contactHeader}>
        <h2 className={styles.headerTitle}>Get In Touch</h2>
        <p className={styles.headerSubtitle}>We're here to help with all your vehicle service needs</p>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.contactCard}>
          <div className={`${styles.contactIcon} ${styles.contactIconBlue}`}>
            <Phone className={styles.contactIconSvg} />
          </div>
          <h3 className={styles.contactTitle}>Call Us</h3>
          <p className={styles.contactDescription}>Available 24/7 for emergencies</p>
          <p className={styles.contactValue}>1-800-SERVICE</p>
          <p className={styles.contactSubValue}>(1-800-737-8423)</p>
        </div>
        
        <div className={styles.contactCard}>
          <div className={`${styles.contactIcon} ${styles.contactIconGreen}`}>
            <Mail className={styles.contactIconSvg} />
          </div>
          <h3 className={styles.contactTitle}>Email Support</h3>
          <p className={styles.contactDescription}>Response within 24 hours</p>
          <p className={styles.contactValue}>support@serviceapp.com</p>
          <p className={styles.contactSubValue}>General inquiries</p>
        </div>
        
        <div className={styles.contactCard}>
          <div className={`${styles.contactIcon} ${styles.contactIconPurple}`}>
            <MessageCircle className={styles.contactIconSvg} />
          </div>
          <h3 className={styles.contactTitle}>Live Chat</h3>
          <p className={styles.contactDescription}>Instant support available</p>
          <button className={styles.chatButton}>
            Start Chat
          </button>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.formTitle}>Send us a Message</h3>
        <form className={styles.contactForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Your full name"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Phone Number</label>
              <input
                type="tel"
                className={styles.formInput}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Subject</label>
              <select className={styles.formSelect}>
                <option>General Inquiry</option>
                <option>Service Question</option>
                <option>Booking Support</option>
                <option>Technical Issue</option>
                <option>Feedback</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Message</label>
            <textarea
              rows={6}
              className={styles.formTextarea}
              placeholder="Tell us how we can help you..."
            ></textarea>
          </div>
          
          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </form>
      </div>

      {/* Service Locations */}
      <div className={styles.locationsSection}>
        <h3 className={styles.sectionTitle}>Service Locations</h3>
        <div className={styles.locationsGrid}>
          {[
            { name: 'Downtown Center', address: '123 Main St, City, ST 12345', phone: '(555) 123-4567' },
            { name: 'North Side Branch', address: '456 Oak Ave, City, ST 12346', phone: '(555) 234-5678' },
            { name: 'West End Location', address: '789 Pine Rd, City, ST 12347', phone: '(555) 345-6789' }
          ].map((location, index) => (
            <div key={index} className={styles.locationCard}>
              <div className={styles.locationInfo}>
                <div className={styles.locationIcon}>
                  <MapPin className={styles.locationIconSvg} />
                </div>
                <div className={styles.locationDetails}>
                  <h4 className={styles.locationName}>{location.name}</h4>
                  <p className={styles.locationAddress}>{location.address}</p>
                  <p className={styles.locationPhone}>{location.phone}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Testimonials */}
      <div className={styles.testimonialsSection}>
        <h3 className={styles.sectionTitle}>What Our Customers Say</h3>
        <div className={styles.testimonialsGrid}>
          {[
            {
              name: 'Sarah Johnson',
              rating: 5,
              comment: 'Excellent service! The booking process was smooth and the technicians were very professional.',
              service: 'Oil Change'
            },
            {
              name: 'Mike Chen',
              rating: 5,
              comment: 'Great experience from start to finish. Highly recommend their brake service.',
              service: 'Brake Inspection'
            }
          ].map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className={styles.starIcon} />
                ))}
              </div>
              <p className={styles.testimonialComment}>"{testimonial.comment}"</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  <span className={styles.authorInitials}>
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className={styles.authorInfo}>
                  <p className={styles.authorName}>{testimonial.name}</p>
                  <p className={styles.authorService}>{testimonial.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;