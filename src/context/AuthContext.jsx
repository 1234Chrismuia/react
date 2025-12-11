// context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  // Check for existing auth on load
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuth({
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName,
            description: user.description,
            avatar_urls: user.avatar_urls
          }
        });
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = (token, userData) => {
    const user = {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName,
      description: userData.description,
      avatar_urls: userData.avatar_urls
    };
    
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_data', JSON.stringify({ ...user, token }));
    
    setAuth({
      token,
      user
    });
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('wp_jwt_token');
    localStorage.removeItem('wp_user');
    
    // Clear state
    setAuth(null);
    
    // Redirect to home page immediately
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      auth, 
      setAuth, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
