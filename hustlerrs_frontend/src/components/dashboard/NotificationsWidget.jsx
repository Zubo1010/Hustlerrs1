import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotificationsWidget() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/recent', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_applied': return '📝';
      case 'new_applicant': return '👥';
      case 'job_accepted': return '✅';
      case 'job_completed': return '🎉';
      case 'payment_received': return '💰';
      case 'new_message': return '💬';
      default: return '🔔';
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'job_applied':
        return `Applied for "${notification.jobTitle}"`;
      case 'new_applicant':
        return `You have a new applicant for "${notification.jobTitle}"`;
      case 'job_accepted':
        return `Your application for "${notification.jobTitle}" was accepted!`;
      case 'job_completed':
        return `Job "${notification.jobTitle}" completed successfully`;
      case 'payment_received':
        return `Received payment of ৳${notification.amount}`;
      case 'new_message':
        return `New message from ${notification.senderName}`;
      default:
        return notification.message || 'New notification';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return `${Math.floor(diffInMinutes / 10080)}w ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        <Link
          to="/notifications"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-2xl mb-2">🔔</div>
          <p className="text-gray-600 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                notification.read ? 'bg-gray-50' : 'bg-blue-50'
              }`}
            >
              <div className="text-lg">{getNotificationIcon(notification.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  {getNotificationText(notification)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 