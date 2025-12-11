import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api/client';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if user is logged in
  useEffect(() => {
    // Use location to trigger re-check on route change
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token); // eslint-disable-line react-hooks/set-state-in-effect
  }, [location]);

  const navLinks = [{ name: 'Home', path: '/' }];

  const authenticatedLinks = [
    { name: 'My Lists', path: '/lists' },
    { name: 'Board', path: '/board' },
  ];

  const handleLogout = () => {
    api.auth.logout();
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm'
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent shrink-0"
          >
            GrocerFlow
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                  location.pathname === link.path
                    ? 'text-blue-600'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isLoggedIn && (
              <>
                {authenticatedLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                      location.pathname === link.path
                        ? 'text-blue-600'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  <Search size={20} />
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium text-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  <Search size={20} />
                </button>
                <Link
                  to="/cart"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors relative"
                >
                  <ShoppingCart size={20} />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    0
                  </span>
                </Link>
                <Link to="/login" className="btn-primary py-2 px-4 text-sm">
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-gray-600 dark:text-gray-300 font-medium py-2 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {isLoggedIn && (
                <>
                  {authenticatedLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="text-gray-600 dark:text-gray-300 font-medium py-2 hover:text-blue-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </>
              )}

              <hr className="border-gray-100 dark:border-gray-800" />

              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-4 py-2">
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-1">
                      <Search size={20} />
                      <span>Search</span>
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-danger text-center py-2.5 w-full flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4 py-2">
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 flex-1"
                    >
                      <ShoppingCart size={20} />
                      <span>Cart</span>
                    </Link>
                  </div>
                  <Link to="/login" className="btn-primary text-center py-2.5 w-full">
                    Login / Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
