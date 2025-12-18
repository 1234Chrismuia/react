import { useContext, useState, useEffect, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import "../css/ProfilePage.css";

const ProfilePage = () => {
  const { auth } = useContext(AuthContext);
  const [userData, setUserData] = useState(auth?.user || {});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  
  const [formData, setFormData] = useState({
    display_name: '',
    user_email: '',
    description: ''
  });

  useEffect(() => {
    if (auth?.user) {
      setUserData(auth.user);
      setFormData({
        display_name: auth.user.displayName || auth.user.name || '',
        user_email: auth.user.email || auth.user.user_email || '',
        description: auth.user.description || ''
      });
    }
  }, [auth]);

  const initials = useMemo(() => {
    const name = userData?.displayName || userData?.name || userData?.username || '';
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n?.[0] || '')
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Normalize payload to likely WP fields
      const payload = {
        name: formData.display_name,
        email: formData.user_email,
        description: formData.description
      };

      const response = await fetch(`https://tiptipparty.co.ke/wp-json/wp/v2/users/${auth.user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Map response to the shape used in the UI
        setUserData(prev => ({
          ...prev,
          displayName: updatedUser.name || updatedUser.displayName || prev.displayName,
          email: updatedUser.email || prev.email,
          description: updatedUser.description || prev.description,
          avatar_urls: updatedUser.avatar_urls || prev.avatar_urls,
          username: updatedUser.slug || updatedUser.username || prev.username
        }));

        // Update localStorage if your app stores the user there
        try {
          const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
          localStorage.setItem('user_data', JSON.stringify({
            ...storedUser,
            displayName: updatedUser.name || storedUser.displayName,
            email: updatedUser.email || storedUser.email,
            description: updatedUser.description || storedUser.description
          }));
        } catch (err) {
          // ignore storage errors
        }

        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const errText = await response.text().catch(() => '');
        setMessage('Failed to update profile' + (errText ? `: ${errText}` : ''));
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <div className="content-container">
        <Card>
          <h2>Access Denied</h2>
          <p>Please login to view your profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar" aria-hidden>
              {userData?.avatar_urls?.['96'] ? (
                <img
                  src={userData.avatar_urls['96']}
                  alt={userData.displayName || userData.username || 'User'}
                />
              ) : (
                <div className="avatar-placeholder">{initials}</div>
              )}
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{userData.displayName || userData.name || 'User'}</h1>
              <p className="profile-email">{userData.email || userData.user_email || ''}</p>
              <p className="profile-role">WordPress User</p>
            </div>
          </div>

          <div className="profile-actions">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "secondary" : "outline"}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          <aside className="profile-sidebar">
            <Card className="stats-card">
              <h3>Account Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Comments</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">0</span>
                  <span className="stat-label">Likes</span>
                </div>
              </div>
            </Card>

            <Card className="quick-links-card">
              <h3>Quick Links</h3>
              <ul className="quick-links">
                <li><a href="/my-posts">My Posts</a></li>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/settings">Settings</a></li>
                <li><a href="/help">Help &amp; Support</a></li>
              </ul>
            </Card>
          </aside>

          <main className="profile-main">
            {isEditing ? (
              <Card>
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit} className="profile-form" noValidate>
                  <div className="form-group">
                    <label htmlFor="display_name">Display Name</label>
                    <input
                      type="text"
                      id="display_name"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      className="form-control"
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="user_email">Email Address</label>
                    <input
                      type="email"
                      id="user_email"
                      name="user_email"
                      value={formData.user_email}
                      onChange={handleInputChange}
                      className="form-control"
                      autoComplete="email"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Bio/Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="4"
                    />
                  </div>

                  {message && (
                    <div className={`form-message ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>
                      {message}
                    </div>
                  )}

                  <div className="form-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="save-button"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
               <Card>
                <h2>About</h2>
                {userData.description ? (
                  <p className="profile-bio">{userData.description}</p>
                ) : (
                  <p className="empty-bio">No bio added yet.</p>
                )}

                <div className="profile-details">
                  <h3>Account Details</h3>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">Username:</span>
                      <span className="detail-value">{userData.username || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{userData.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Member Since:</span>
                      <span className="detail-value">Recently</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Last Login:</span>
                      <span className="detail-value">Just now</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Recent Activity Card */}
            <Card className="activity-card">
              <h2>Recent Activity</h2>
              <div className="empty-activity">
                <p>No recent activity to display.</p>
              </div>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
