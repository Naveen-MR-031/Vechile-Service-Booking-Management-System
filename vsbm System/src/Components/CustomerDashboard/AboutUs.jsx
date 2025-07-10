import React from 'react';
import { CheckCircle, Users, Award, Calendar, MapPin, Star, Settings, AlertCircle } from 'lucide-react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
  return (
    <div className={styles.aboutPage}>
      {/* About Header */}
      <div className={styles.aboutHeader}>
        <h2 className={styles.headerTitle}>About Vechile Service Hub Platform</h2>
        <p className={styles.headerSubtitle}>Your trusted partner for comprehensive vehicle service and maintenance</p>
      </div>

      {/* Mission Statement */}
      <div className={styles.missionSection}>
        <h3 className={styles.sectionTitle}>Our Mission</h3>
        <p className={styles.missionText}>
          At Service Provider Platform, we're committed to providing exceptional vehicle service experiences that keep you safe on the road. 
          Our platform connects you with trusted, certified service providers who deliver quality workmanship and honest pricing.
        </p>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={`${styles.valueIcon} ${styles.valueIconBlue}`}>
              <CheckCircle className={styles.valueIconSvg} />
            </div>
            <h4 className={styles.valueTitle}>Quality Assurance</h4>
            <p className={styles.valueDescription}>All service providers are certified and regularly audited</p>
          </div>
          <div className={styles.valueCard}>
            <div className={`${styles.valueIcon} ${styles.valueIconGreen}`}>
              <Users className={styles.valueIconSvg} />
            </div>
            <h4 className={styles.valueTitle}>Customer First</h4>
            <p className={styles.valueDescription}>Your satisfaction is our top priority</p>
          </div>
          <div className={styles.valueCard}>
            <div className={`${styles.valueIcon} ${styles.valueIconPurple}`}>
              <Award className={styles.valueIconSvg} />
            </div>
            <h4 className={styles.valueTitle}>Excellence</h4>
            <p className={styles.valueDescription}>Striving for the highest standards in everything we do</p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className={styles.featuresSection}>
        <h3 className={styles.sectionTitle}>Why Choose Our Platform?</h3>
        <div className={styles.featuresGrid}>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>
                <Calendar className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Easy Booking</h4>
                <p className={styles.featureDescription}>Schedule appointments online with just a few clicks</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>
                <MapPin className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Convenient Locations</h4>
                <p className={styles.featureDescription}>Find service providers near you with our location finder</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconYellow}`}>
                <Star className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Trusted Reviews</h4>
                <p className={styles.featureDescription}>Read authentic customer reviews and ratings</p>
              </div>
            </div>
          </div>
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>
                <Settings className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Service Tracking</h4>
                <p className={styles.featureDescription}>Monitor your service status in real-time</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconRed}`}>
                <AlertCircle className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>24/7 Support</h4>
                <p className={styles.featureDescription}>Get help whenever you need it</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={`${styles.featureIcon} ${styles.featureIconTeal}`}>
                <CheckCircle className={styles.featureIconSvg} />
              </div>
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Warranty Protection</h4>
                <p className={styles.featureDescription}>All services come with quality guarantees</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.teamSection}>
        <h3 className={styles.sectionTitle}>Meet Our Team</h3>
        <div className={styles.teamGrid}>
          {[
            { name: 'NAVEEN', role: 'CEO & Founder', bio: 'Fresher' }
          ].map((member, index) => (
            <div key={index} className={styles.teamCard}>
              <div className={styles.teamAvatar}>
                <span className={styles.teamInitials}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <h4 className={styles.teamName}>{member.name}</h4>
              <p className={styles.teamRole}>{member.role}</p>
              <p className={styles.teamBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Recognition */}
      <div className={styles.awardsSection}>
        <h3 className={styles.sectionTitle}>Awards & Recognition</h3>
        <div className={styles.awardsGrid}>
          {[
            { award: 'Best Customer Service', year: '2024', organization: 'Auto Industry Association' },
            { award: 'Innovation Award', year: '2023', organization: 'Tech Excellence Council' },
            { award: 'Top Startup', year: '2022', organization: 'Business Weekly' },
            { award: 'Customer Choice', year: '2021', organization: 'Service Excellence Awards' }
          ].map((award, index) => (
            <div key={index} className={styles.awardCard}>
              <div className={styles.awardIcon}>
                <Award className={styles.awardIconSvg} />
              </div>
              <h4 className={styles.awardTitle}>{award.award}</h4>
              <p className={styles.awardYear}>{award.year}</p>
              <p className={styles.awardOrganization}>{award.organization}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;