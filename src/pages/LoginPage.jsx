import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/LoginPage.css";

const JWT_URL = `https://tiptipparty.co.ke/wp-json/jwt-auth/v1/token`;

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Check for saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('saved_username');
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    
    // Auto hide toast after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      showErrorToast("Please enter both username and password");
      triggerShake();
      setLoading(false);
      return;
    }

    try {
      // Get JWT Token
      const res = await fetch(JWT_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          username, 
          password 
        }),
      });
      
      const data = await res.json();
      
      if (data.token) {
        console.log("JWT Token received successfully!");
        console.log("User data:", data);
        
        // Remember username if checked
        if (rememberMe) {
          localStorage.setItem('saved_username', username);
        } else {
          localStorage.removeItem('saved_username');
        }
        
        // Store auth data
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_data', JSON.stringify({
          id: data.user_id || 2,
          email: data.user_email,
          username: data.user_nicename,
          displayName: data.user_display_name,
          token: data.token
        }));
        
        // Update auth context
        login(data.token, {
          id: data.user_id || 2,
          email: data.user_email,
          username: data.user_nicename,
          displayName: data.user_display_name
        });
        
        // Navigate to dashboard
        navigate(from, { replace: true });
        
      } else {
        // Handle WordPress JWT errors - Show only "Wrong username or password"
        showErrorToast("Wrong username or password");
        triggerShake();
      }
    } catch (err) {
      console.error("Login error:", err);
      showErrorToast("Network error. Please check your connection.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Modern Toast Notification */}
      {showToast && (
        <div className="modern-toast">
          <div className="toast-content">
            <div className="toast-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="toast-message">
              {toastMessage}
            </div>
            <button 
              className="toast-close"
              onClick={() => setShowToast(false)}
              aria-label="Close notification"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="toast-progress">
              <div className="toast-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <div className="input-with-icon">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                autoComplete="username"
                className="form-input"
                placeholder="Enter your username or email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
                className="form-input"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <i className="fas fa-eye-slash"></i>
                ) : (
                  <i className="fas fa-eye"></i>
                )}
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p className="footer-note">
            <small>Using JWT Authentication</small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
