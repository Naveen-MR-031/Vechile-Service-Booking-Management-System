import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Edit, Save, X, Camera, Clock, Wrench } from 'lucide-react';
import axios from 'axios';
import styles from './ServiceSettings.module.css';

const ServiceSettings = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3333/serviceProviders');
        // For demo, get first company - in real app, use logged in company ID
        const company = response.data[0];
        setCompanyInfo(company);
        setEditForm(company);
      } catch (error) {
        console.error('Error fetching company info:', error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3333/serviceProviders/${companyInfo.id}`, editForm);
      setCompanyInfo(editForm);
      setIsEditing(false);
      alert('Company information updated successfully!');
    } catch (error) {
      console.error('Error updating company info:', error);
      alert('Error updating company information. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm(companyInfo);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('services.serviceTypes.')) {
      const serviceType = name.split('.')[2];
      setEditForm({
        ...editForm,
        services: {
          ...editForm.services,
          serviceTypes: {
            ...editForm.services.serviceTypes,
            [serviceType]: checked
          }
        }
      });
    } else if (name.startsWith('businessHours.')) {
      const day = name.split('.')[1];
      setEditForm({
        ...editForm,
        businessHours: {
          ...editForm.businessHours,
          [day]: value
        }
      });
    } else {
      setEditForm({
        ...editForm,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload to a server and get a URL
      // For demo, we'll use a placeholder URL
      const photoUrl = URL.createObjectURL(file);
      setEditForm({
        ...editForm,
        photo: photoUrl
      });
    }
  };

  const serviceTypeLabels = {
    general: 'General Service',
    oil: 'Oil Change',
    tire: 'Tire Service',
    water: 'Water Service',
    battery: 'Battery Service',
    detailing: 'Car Detailing',
    engine: 'Engine Repair',
    paint: 'Paint Service',
    ac: 'AC Service',
    polishing: 'Polishing',
    denting: 'Denting',
    towing: 'Towing Service'
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (!companyInfo) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsHeader}>
        <h2 className={styles.headerTitle}>Company Settings</h2>
        <p className={styles.headerSubtitle}>Manage your service provider profile</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar} onClick={() => isEditing && document.getElementById('photoUpload').click()}>
            {editForm.photo ? (
              <img src={editForm.photo} alt="Company" className={styles.avatarImage} />
            ) : (
              <Building2 className={styles.avatarIcon} />
            )}
            {isEditing && (
              <div className={styles.photoOverlay}>
                <Camera className={styles.cameraIcon} />
                <span>Change Photo</span>
              </div>
            )}
          </div>
          {isEditing && (
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              className={styles.hiddenInput}
            />
          )}
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{editForm.companyName}</h3>
            <p className={styles.profileEmail}>{editForm.email}</p>
            <div className={styles.profileRating}>
              <span className={styles.ratingText}>Rating: {editForm.rating} ⭐</span>
            </div>
          </div>
          {!isEditing && (
            <button onClick={handleEdit} className={styles.editButton}>
              <Edit className={styles.editIcon} />
              Edit Profile
            </button>
          )}
        </div>

        <div className={styles.profileForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Building2 className={styles.labelIcon} />
              Company Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="companyName"
                value={editForm.companyName}
                onChange={handleChange}
                className={styles.formInput}
              />
            ) : (
              <div className={styles.formValue}>{companyInfo.companyName}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Mail className={styles.labelIcon} />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className={styles.formInput}
              />
            ) : (
              <div className={styles.formValue}>{companyInfo.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Phone className={styles.labelIcon} />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={editForm.phone}
                onChange={handleChange}
                className={styles.formInput}
              />
            ) : (
              <div className={styles.formValue}>{companyInfo.phone}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <MapPin className={styles.labelIcon} />
              Address
            </label>
            {isEditing ? (
              <textarea
                name="address"
                value={editForm.address}
                onChange={handleChange}
                className={styles.formTextarea}
                rows={3}
              />
            ) : (
              <div className={styles.formValue}>{companyInfo.address}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Wrench className={styles.labelIcon} />
              Services Offered
            </label>
            {isEditing ? (
              <div className={styles.servicesGrid}>
                {Object.entries(serviceTypeLabels).map(([key, label]) => (
                  <label key={key} className={styles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      name={`services.serviceTypes.${key}`}
                      checked={editForm.services?.serviceTypes?.[key] || false}
                      onChange={handleChange}
                      className={styles.checkboxInput}
                    />
                    <span className={styles.checkboxLabel}>{label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className={styles.servicesList}>
                {Object.entries(companyInfo.services?.serviceTypes || {})
                  .filter(([key, value]) => value)
                  .map(([key, value]) => (
                    <span key={key} className={styles.serviceTag}>
                      {serviceTypeLabels[key]}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Clock className={styles.labelIcon} />
              Business Hours
            </label>
            {isEditing ? (
              <div className={styles.businessHoursGrid}>
                {daysOfWeek.map((day) => (
                  <div key={day} className={styles.businessHourRow}>
                    <label className={styles.dayLabel}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </label>
                    <input
                      type="text"
                      name={`businessHours.${day}`}
                      value={editForm.businessHours?.[day] || ''}
                      onChange={handleChange}
                      className={styles.timeInput}
                      placeholder="e.g., 9:00 AM - 6:00 PM"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.businessHoursList}>
                {daysOfWeek.map((day) => (
                  <div key={day} className={styles.businessHourItem}>
                    <span className={styles.dayName}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}:
                    </span>
                    <span className={styles.dayTime}>
                      {companyInfo.businessHours?.[day] || 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isEditing && (
            <div className={styles.formActions}>
              <button onClick={handleSave} className={styles.saveButton}>
                <Save className={styles.buttonIcon} />
                Save Changes
              </button>
              <button onClick={handleCancel} className={styles.cancelButton}>
                <X className={styles.buttonIcon} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSettings;