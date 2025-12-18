// src/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import "./css/Layout.css";

const Layout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("jwt_token") || localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]); 

  const isLoginPage = location.pathname === "/login";

  return (
    <div className="app-container">
      {/* Show Navbar on all pages except login */}
      {!isLoginPage && <Navbar />}
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;