import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            FreelanceHub
          </Link>
          
          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/jobs">Browse Jobs</Link></li>
              {user && (
                <>
                  <li><Link to="/dashboard">Dashboard</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                </>
              )}
            </ul>

            <div className="nav-actions">
              {user ? (
                <div className="user-info">
                  <span className="user-greeting">Hello, {user.name}</span>
                  <button onClick={logout} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-secondary">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Top Right */}
          <button 
            className="mobile-menu-btn" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Mobile Navigation Menu */}
          <div className={`mobile-nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <ul className="mobile-nav-links">
              <li><Link to="/" onClick={closeMenu}>Home</Link></li>
              <li><Link to="/jobs" onClick={closeMenu}>Browse Jobs</Link></li>
              {user && (
                <>
                  <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
                  <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
                </>
              )}
            </ul>

            <div className="mobile-nav-actions">
              {user ? (
                <div className="mobile-user-info">
                  <span className="mobile-user-greeting">Hello, {user.name}</span>
                  <button onClick={() => { logout(); closeMenu(); }} className="btn btn-secondary">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Overlay for mobile menu */}
          {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
