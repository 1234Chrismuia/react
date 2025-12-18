import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import "../css/SettingsPage.css"; 

const DEFAULT_SETTINGS = {
  emailNotifications: true,
  newsletter: false,
  darkMode: false,
  language: 'en',
  timezone: 'UTC'
};

const STORAGE_KEY = 'user_settings_v1';

const SettingsPage = () => {
  const { auth, logout } = useContext(AuthContext || {});
  const messageTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  // initialize settings from localStorage, fallback to system preference or defaults
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
      // if no saved settings, use system dark preference if available
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      return { ...DEFAULT_SETTINGS, darkMode: prefersDark };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 

  useEffect(() => {
    // Apply or remove the dark-mode class on mount and whenever it changes
    const className = 'dark-mode';
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add(className);
    } else {
      root.classList.remove(className);
    }

    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      
    }
  }, [settings.darkMode, settings]); 

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !Boolean(prev[setting])
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    clearMessage();

    // Simulate API call
    saveTimerRef.current = setTimeout(() => {
      setLoading(false);
      setMessage('Settings saved successfully!');
      setMessageType('success');

      // persist to localStorage (already being persisted on change, but keep here too)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (e) {
        setMessage('Failed to persist settings locally.');
        setMessageType('error');
      }

      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => clearMessage(), 3000);
    }, 1000);
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({ settings, exportedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settings_export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setMessage('Export started — file should download shortly.');
      setMessageType('success');
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => clearMessage(), 3000);
    } catch (err) {
      setMessage('Failed to export data.');
      setMessageType('error');
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => clearMessage(), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account and all data? This action cannot be undone.'
    );
    if (!confirmed) return;

    setLoading(true);
    clearMessage();

    // Simulate API call for delete
    saveTimerRef.current = setTimeout(() => {
      setLoading(false);
      if (typeof logout === 'function') {
        try {
          logout();
        } catch (e) {}
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setMessage('Account deleted.');
      setMessageType('success');
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
      messageTimerRef.current = setTimeout(() => clearMessage(), 3000);
    }, 1200);
  };

  if (!auth) {
    return (
      <div className="content-container">
        <Card>
          <h2>Access Denied</h2>
          <p>Please login to access settings.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="settings-container">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account preferences</p>

        <div className="settings-grid">
          {/* Account Settings */}
          <Card className="settings-card">
            <h2 className="card-title">Account Settings</h2>

            <div className="setting-item">
              <div className="setting-info">
                <h3 id="lbl-email-notifications">Email Notifications</h3>
                <p>Receive email updates about your account</p>
              </div>
              <label className="toggle-switch" htmlFor="email-notifications">
                <input
                  id="email-notifications"
                  type="checkbox"
                  role="switch"
                  aria-checked={!!settings.emailNotifications}
                  aria-labelledby="lbl-email-notifications"
                  checked={!!settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3 id="lbl-newsletter">Newsletter</h3>
                <p>Subscribe to our weekly newsletter</p>
              </div>
              <label className="toggle-switch" htmlFor="newsletter">
                <input
                  id="newsletter"
                  type="checkbox"
                  role="switch"
                  aria-checked={!!settings.newsletter}
                  aria-labelledby="lbl-newsletter"
                  checked={!!settings.newsletter}
                  onChange={() => handleToggle('newsletter')}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3 id="lbl-dark-mode">Dark Mode</h3>
                <p>Switch to dark theme</p>
              </div>
              <label className="toggle-switch" htmlFor="dark-mode">
                <input
                  id="dark-mode"
                  type="checkbox"
                  role="switch"
                  aria-checked={!!settings.darkMode}
                  aria-labelledby="lbl-dark-mode"
                  checked={!!settings.darkMode}
                  onChange={() => handleToggle('darkMode')}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="settings-card">
            <h2 className="card-title">Preferences</h2>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={settings.language}
                onChange={handleSelectChange}
                className="form-select"
                aria-label="Language preference"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={settings.timezone}
                onChange={handleSelectChange}
                className="form-select"
                aria-label="Timezone preference"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="PST">Pacific Time (PST)</option>
              </select>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="settings-card danger-zone">
            <h2 className="card-title">Danger Zone</h2>

            <div className="danger-item">
              <div className="danger-info">
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all data</p>
              </div>
              <Button
                onClick={handleDeleteAccount}
                variant="danger"
                size="small"
                disabled={loading}
              >
                Delete Account
              </Button>
            </div>

            <div className="danger-item">
              <div className="danger-info">
                <h3>Export Data</h3>
                <p>Download all your data in JSON format</p>
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                size="small"
                disabled={loading}
              >
                Export Data
              </Button>
            </div>
          </Card>
        </div>

        {message && (
          <div className={`settings-message ${messageType === 'success' ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="settings-actions">
          <Button
            onClick={handleSave}
            variant="primary"
            size="large"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
