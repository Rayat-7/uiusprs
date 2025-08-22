import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import NotificationDropdown from './NotificationDropdown';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'student':
        return '/student-dashboard';
      case 'dsw_admin':
        return '/admin-dashboard';
      case 'dept_staff':
        return '/staff-dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-white shadow-md border-b-2 border-orange-500 relative z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/uiu_logo.png" 
              alt="UIU Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">UIUSPRS</h1>
              <p className="text-sm text-gray-600">United International University</p>
            </div>
          </Link>
          </motion.div>

          <nav className="hidden md:flex items-center space-x-6">
            <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link to="/" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
              Home
            </Link>
            </motion.div>
            {user ? (
              <>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link 
                  to={getDashboardLink()} 
                  className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                </motion.div>
                {user.role === 'student' && (
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link 
                    to="/report-issue" 
                    className="text-gray-700 hover:text-orange-500 font-medium transition-colors"
                  >
                    Report Issue
                  </Link>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to="/login" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Login
                </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Link to="/register" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">
                  Register
                </Link>
                </motion.div>
              </>
            )}
          </nav>

          {user && (
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2"
              >
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Logout</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;