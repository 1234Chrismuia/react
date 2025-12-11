// src/pages/LoginPage.jsx
import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/LoginPage.css";


const JWT_URL = `https://tiptipparty.co.ke/wp-json/jwt-auth/v1/token`;

function LoginPage() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        
        // Redirect
        navigate(from, { replace: true });
      } else {
        // Handle WordPress JWT errors
        let errorMsg = "Login failed";
        if (data.code === "jwt_auth_failed") {
          errorMsg = "Invalid username or password";
        } else if (data.message) {
          errorMsg = data.message;
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle"></p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login"}
          </button>
        </form>
        
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="login-footer">
          <p><small>Use JWT authentication</small></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
