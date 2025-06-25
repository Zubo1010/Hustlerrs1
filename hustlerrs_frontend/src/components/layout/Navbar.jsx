import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="text-xl font-bold text-gray-800">
            Hustlerrs
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Always visible links */}
            <Link to="/jobs/all" className="text-gray-600 hover:text-gray-900">
              Browse Jobs
            </Link>

            {user ? (
              <>
                {/* Links for authenticated users */}
                {user.role === 'job-giver' && (
                  <>
                    <Link to="/jobs/my-jobs" className="text-gray-600 hover:text-gray-900">
                      My Posted Jobs
                    </Link>
                    <Link
                      to="/jobs/create"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Post a Job
                    </Link>
                  </>
                )}

                {user.role === 'hustler' && (
                  <>
                    <Link to="/jobs/my-applications" className="text-gray-600 hover:text-gray-900">
                      My Applications
                    </Link>
                  </>
                )}

                {/* Common links for all authenticated users */}
                <Link to="/messages" className="text-gray-600 hover:text-gray-900">
                  Messages
                </Link>
                <Link to="/notifications" className="text-gray-600 hover:text-gray-900">
                  Notifications
                </Link>

                {/* User menu */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                    <span>{user.name || user.email}</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-50">
                    <Link
                      to={`/profile/${user.role === 'hustler' ? 'hustler' : 'job-giver'}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Links for unauthenticated users */}
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 