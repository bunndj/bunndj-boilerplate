import React, { useState } from 'react';
import { useRole, useAuth } from '@/hooks';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = () => {
  const { canViewOwnEvents } = useRole();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      
      // Close mobile menu first
      setIsMobileMenuOpen(false);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        navigate('/signin');
      }, 100);
    } catch (error) {
      console.error('Header: Logout failed:', error);
      // Fallback: force navigation even if logout API fails
      navigate('/signin');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Home' },
    ...(canViewOwnEvents ? [{ path: '/events', label: 'My Events' }] : []),
    { path: '/profile', label: 'My Profile' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="bg-secondary shadow-sm border-b border-secondary-light animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center animate-slide-in-left">
            <Link to="/dashboard" className="flex items-center group" onClick={closeMobileMenu}>
              <img
                src="/assets/logo.png"
                alt="Bunn DJ Planning Logo"
                className="h-8 sm:h-10 w-auto object-contain hover:opacity-80 transition-all duration-300 group-hover:scale-105"
                style={{ aspectRatio: '160/51' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex space-x-6 animate-slide-in-right">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-all duration-300 hover:scale-105 relative group ${
                    location.pathname === item.path
                      ? 'text-brand'
                      : 'text-gray-300 hover:text-brand'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.label}
                  {/* Animated underline */}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all duration-300 group-hover:w-full ${
                      location.pathname === item.path ? 'w-full' : ''
                    }`}
                  ></span>
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-300 hover:text-red-400 transition-all duration-300 hover:scale-105 relative group"
                style={{ animationDelay: `${navigationItems.length * 0.1}s` }}
              >
                Logout
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {user && (
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-brand transition-all duration-300 hover:scale-110 hover:bg-gray-700/50"
              aria-label="Toggle mobile menu"
            >
              <div className="relative">
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 animate-scale-in" />
                ) : (
                  <Menu className="w-6 h-6 animate-scale-in" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-secondary-light animate-slide-down bg-secondary/95 backdrop-blur-sm">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 hover:scale-105 animate-slide-up ${
                    location.pathname === item.path
                      ? 'text-brand bg-gray-700/50 animate-glow'
                      : 'text-gray-300 hover:text-brand hover:bg-gray-700/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-red-400 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${navigationItems.length * 0.1}s` }}
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
