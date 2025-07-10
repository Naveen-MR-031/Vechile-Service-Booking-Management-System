import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import styles from './Settings.module.css';

const Settings = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3000/consumers');
        const user = response.data[0];
        setUserInfo(user);
        setEditForm(user);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/consumers/${userInfo.id}`, editForm);
      setUserInfo(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  };

  const handleCancel = () => {
    setEditForm(userInfo);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  if (!userInfo) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.settingsHeader}>
        <h2 className={styles.headerTitle}>Account Settings</h2>
        <p className={styles.headerSubtitle}>Manage your profile information</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            <User className={styles.avatarIcon} />
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{userInfo.username}</h3>
            <p className={styles.profileEmail}>{userInfo.email}</p>
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
              <User className={styles.labelIcon} />
              Username
            </label>
            {isEditing ? (
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleChange}
                className={styles.formInput}
              />
            ) : (
              <div className={styles.formValue}>{userInfo.username}</div>
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
              <div className={styles.formValue}>{userInfo.email}</div>
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

export default Settings;