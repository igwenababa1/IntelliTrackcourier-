import React, { useState } from 'react';
import Icon from './Icon';

interface UserProfileProps {
  userEmail?: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    color: 'white',
    minHeight: 'calc(100vh - 80px)',
  },
  header: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  section: {
    backgroundColor: 'var(--card-bg-color)',
    borderRadius: '1rem',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid var(--border-color)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  fieldGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: 'var(--text-secondary-color)',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    backgroundColor: '#1f2937',
    color: 'white',
    outline: 'none',
  },
  disabledInput: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--border-color)',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    color: 'var(--text-secondary-color)',
    outline: 'none',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    color: 'white',
    userSelect: 'none',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  }
};

const UserProfile: React.FC<UserProfileProps> = ({ userEmail = 'info@lawrenceconsultantsorg.org' }) => {
  const [name, setName] = useState('Alex Carter');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => {
        setSavedMessage(false);
    }, 3000);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}><Icon name="user" style={{width: '32px', height: '32px'}}/> User Profile</h1>
      
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Icon name="file-text" style={{width: '20px', height: '20px'}}/> Account Details</h2>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Full Name</label>
          <input type="text" style={styles.input} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Email Address</label>
          <input type="email" style={styles.disabledInput} value={userEmail} readOnly />
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Phone Number</label>
          <input type="tel" style={styles.input} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}><Icon name="bell" style={{width: '20px', height: '20px'}}/> Preferences</h2>
        <div style={styles.fieldGroup}>
          <label style={styles.toggle}>
            <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
            Email Notifications for Status updates
          </label>
        </div>
        <div style={styles.fieldGroup}>
          <label style={styles.toggle}>
            <input type="checkbox" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} />
            SMS Notifications for Out for Delivery
          </label>
        </div>
      </div>

      {savedMessage && (
        <div style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '0.5rem', textAlign: 'center' }}>
          Profile updated successfully!
        </div>
      )}
      
      <button style={styles.button} onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default UserProfile;
