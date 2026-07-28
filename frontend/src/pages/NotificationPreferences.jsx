import { useState, useEffect } from 'react';
import { getPreferences, updatePreferences } from '../services/preferencesService';
import './NotificationPreferences.css';

const NotificationPreferences = () => {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const data = await getPreferences();
        setPrefs(data.preferences);
      } catch (error) {
        console.error('Failed to fetch preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrefs();
  }, []);

  const handleToggle = async (field) => {
    const newValue = !prefs[field];
    const updated = { ...prefs, [field]: newValue };
    setPrefs(updated);

    setSaving(true);
    try {
      await updatePreferences({ [field]: newValue });
      setSuccessMsg('Preferences saved!');
      setTimeout(() => setSuccessMsg(''), 2000);
    } catch (error) {
      // Revert on error
      setPrefs((prev) => ({ ...prev, [field]: !newValue }));
      console.error('Failed to update preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="prefs-container">
        <div className="prefs-loading">Loading preferences...</div>
      </div>
    );
  }

  if (!prefs) {
    return (
      <div className="prefs-container">
        <div className="prefs-loading">Failed to load preferences.</div>
      </div>
    );
  }

  return (
    <div className="prefs-container">
      <h2 className="prefs-title">Notification Preferences</h2>
      <p className="prefs-subtitle">Choose how you want to receive notifications</p>

      {successMsg && <div className="prefs-success">{successMsg}</div>}

      <div className="prefs-card">
        <h3 className="prefs-section-title">📧 Email Notifications</h3>

        <div className="pref-item">
          <div className="pref-info">
            <span className="pref-label">Status Change Updates</span>
            <span className="pref-desc">Receive email when your request status changes</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={prefs.emailOnStatusChange}
              onChange={() => handleToggle('emailOnStatusChange')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="pref-item">
          <div className="pref-info">
            <span className="pref-label">New Message Alerts</span>
            <span className="pref-desc">Receive email when you get a new message</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={prefs.emailOnNewMessage}
              onChange={() => handleToggle('emailOnNewMessage')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="pref-item">
          <div className="pref-info">
            <span className="pref-label">New Request Notifications</span>
            <span className="pref-desc">Receive email when a new request is submitted (officials)</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={prefs.emailOnNewRequest}
              onChange={() => handleToggle('emailOnNewRequest')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="prefs-card">
        <h3 className="prefs-section-title">🔔 In-App Notifications</h3>

        <div className="pref-item">
          <div className="pref-info">
            <span className="pref-label">In-App Notifications</span>
            <span className="pref-desc">Show notifications in the notification bell</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={prefs.inAppNotifications}
              onChange={() => handleToggle('inAppNotifications')}
              disabled={saving}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;