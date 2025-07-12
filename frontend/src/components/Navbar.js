import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Plus, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  // Mark all notifications as read when dropdown is opened
  useEffect(() => {
    if (showNotifications && notifications.some(n => !n.isRead)) {
      const markAllAsRead = async () => {
        try {
          await axios.put('/api/notifications/mark-all-read');
          fetchUnreadCount();
          fetchNotifications();
        } catch (error) {
          console.error('Error marking all notifications as read:', error);
        }
      };
      markAllAsRead();
    }
  }, [showNotifications]);

  useEffect(() => {
    if (!showNotifications) return;
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications.slice(0, 5));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Add a function to handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);
      // Try all possible question id fields
      const qid = notification.questionId || notification.question_id || (notification.question && (notification.question._id || notification.question.id));
      if (qid) {
        navigate(`/question/${qid}`);
        setShowNotifications(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-100">StackIt</span>
          </Link>
          {/* Hamburger for mobile */}
          <button
            className="lg:hidden ml-2 p-2 text-gray-300 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-700 text-gray-100 placeholder-gray-400"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </div>
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {/* Ask Question Button */}
                <Link
                  to="/ask"
                  className="flex items-center space-x-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ask Question</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div ref={notificationRef} className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <div className="p-4 border-b border-gray-700">
                        <h3 className="font-semibold text-gray-100">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                                !notification.isRead ? 'bg-teal-900/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <p className="text-sm text-gray-100">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {user.profilePicture ? (
                      <img
                        src={`http://localhost:5000${user.profilePicture}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="hidden md:block">{user.username}</span>
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <div className="py-1">
                        <Link
                          to={`/profile/${user._id || user.id}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50 p-4">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-teal-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-700 text-gray-100 placeholder-gray-400"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </form>
          {/* Mobile Nav Items */}
          {user ? (
            <>
              <Link
                to="/ask"
                className="flex items-center space-x-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4" />
                <span>Ask Question</span>
              </Link>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full mb-2"
              >
                <Bell className="h-5 w-5 mr-2" />
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center px-2">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Link
                to={`/profile/${user._id || user.id}`}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block text-gray-300 hover:text-gray-100 transition-colors px-4 py-2 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar; 