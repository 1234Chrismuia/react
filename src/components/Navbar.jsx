// components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const CATEGORIES_API = `${import.meta.env.VITE_WP_API_URL || 'https://tiptipparty.co.ke/wp-json'}/wp/v2/categories`;

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { auth, logout } = useContext(AuthContext);
  const location = useLocation();
  const categoriesDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetch(CATEGORIES_API)
      .then(res => res.json())
      .then(data => setCategories(data.slice(0, 6))) // Limit to 6 categories
      .catch(() => setCategories([]));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close categories dropdown if clicked outside
      if (categoriesDropdownRef.current && 
          !categoriesDropdownRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      
      // Close user dropdown if clicked outside
      if (userDropdownRef.current && 
          !userDropdownRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      
      // Close mobile menu if clicking outside on mobile
      if (isMenuOpen && menuRef.current && 
          !menuRef.current.contains(event.target) &&
          !event.target.closest('.menu-toggle')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close all dropdowns when menu is closed
  useEffect(() => {
    if (!isMenuOpen) {
      setIsCategoriesOpen(false);
      setIsUserMenuOpen(false);
    }
  }, [isMenuOpen]);

  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const toggleMenu = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCategories = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsCategoriesOpen(!isCategoriesOpen);
    setIsUserMenuOpen(false); // Close user menu if open
  };

  const toggleUserMenu = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsCategoriesOpen(false); // Close categories if open
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    setIsCategoriesOpen(false);
    setIsMenuOpen(false);
  };

  const handleUserMenuItemClick = (e) => {
    e.stopPropagation();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleImageError = (e) => {
    const img = e.target;
    const initialsDiv = img.nextElementSibling;
    
    if (img) img.style.display = 'none';
    if (initialsDiv && initialsDiv.style) {
      initialsDiv.style.display = 'flex';
    }
  };

  const isActive = (path) => location.pathname === path;

  const userInitial = auth?.user?.displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="logo" onClick={closeAllMenus}>
              <span className="logo-text">headlesswp</span>
              <span className="logo-dot">.</span>
            </Link>
            
            <button 
              className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          <div 
            className={`navbar-menu ${isMenuOpen ? 'active' : ''}`} 
            ref={menuRef}
          >
            <div className="navbar-links">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeAllMenus}
              >
                Home
              </Link>
              <Link 
                to="/search" 
                className={`nav-link ${isActive('/search') ? 'active' : ''}`}
                onClick={closeAllMenus}
              >
                Search
              </Link>
              
              {/* Categories Dropdown */}
              <div className="dropdown" ref={categoriesDropdownRef}>
                <button 
                  className="dropdown-toggle"
                  onClick={toggleCategories}
                  aria-expanded={isCategoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <svg 
                    className={`dropdown-icon ${isCategoriesOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`dropdown-menu ${isCategoriesOpen ? 'active' : ''}`}>
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      className="dropdown-item"
                      onClick={handleCategoryClick}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {auth ? (
                <>
                  {/* Welcome message and user dropdown */}
                  <div className="dropdown user-dropdown" ref={userDropdownRef}>
                    <button 
                      className="dropdown-toggle user-toggle"
                      onClick={toggleUserMenu}
                      aria-expanded={isUserMenuOpen}
                      aria-haspopup="true"
                    >
                      <div className="user-info">
                        {auth.user?.avatar_urls?.["24"] ? (
                          <img 
                            src={auth.user.avatar_urls["24"]} 
                            alt={auth.user.displayName} 
                            className="user-avatar"
                            onError={handleImageError}
                          />
                        ) : null}
                        <div 
                          className="user-avatar-initials"
                          style={{ 
                            display: auth.user?.avatar_urls?.["24"] ? 'none' : 'flex',
                            lineHeight: '32px'
                          }}
                        >
                          {userInitial}
                        </div>
                        <span className="user-name">
                          Hi, {auth.user?.displayName?.split(' ')[0] || 'User'}
                        </span>
                      </div>
                      <svg 
                        className={`dropdown-icon ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className={`dropdown-menu user-menu ${isUserMenuOpen ? 'active' : ''}`}>
                      <div className="user-menu-header">
                        <div className="user-menu-info">
                          <h4>{auth.user?.displayName || 'User'}</h4>
                          <p>{auth.user?.email || ''}</p>
                        </div>
                      </div>
                      <div className="user-menu-items">
                        <Link 
                          to="/profile" 
                          className="dropdown-item"
                          onClick={handleUserMenuItemClick}
                        >
                          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <Link 
                          to="/my-posts" 
                          className="dropdown-item"
                          onClick={handleUserMenuItemClick}
                        >
                          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          My Posts
                        </Link>
                        <Link 
                          to="/dashboard" 
                          className="dropdown-item"
                          onClick={handleUserMenuItemClick}
                        >
                          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Dashboard
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button 
                          onClick={handleLogout}
                          className="dropdown-item logout-item"
                        >
                          <svg className="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                  onClick={closeAllMenus}
                >
                  <Button 
                    variant="primary" 
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
