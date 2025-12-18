// src/context/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Loader from '../components/Loader'; 

const ProtectedRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  // Show loader while checking auth (if you have async auth check)
  if (auth === undefined) {
    return <Loader />;
  }

  if (!auth) {
    // Redirect to login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
