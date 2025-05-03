import React, { useState, useEffect } from 'react';
import './VendorNotifications.css';

const VendorNotifications = ({ vendorId }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!vendorId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('vendorToken');
        if (!token) {
          throw new Error('Authentication token is missing');
        }

        const response = await fetch(`http://localhost:5000/api/vendors/notifications/${vendorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(data.notifications || []);

        const unread = data.notifications.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const intervalId = setInterval(fetchNotifications, 60000);

    return () => clearInterval(intervalId);
  }, [vendorId]);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      const response = await fetch(`http://localhost:5000/api/vendors/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark notification as read');
      }

      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="vendor-notifications loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vendor-notifications error">
        <p>Error loading notifications: {error}</p>
      </div>
    );
  }

  return (
    <div className="vendor-notifications">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount}</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && markAsRead(notification._id)}
            >
              <div className="notification-icon">
                {notification.type === 'quote_match' && <i className="icon-quote-match">📋</i>}
                {notification.type === 'quote_selected' && <i className="icon-quote-selected">✅</i>}
                {notification.type === 'quote_declined' && <i className="icon-quote-declined">❌</i>}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatDate(notification.createdAt)}</div>
              </div>
              {!notification.read && (
                <div className="notification-status">
                  <span className="unread-indicator"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorNotifications;
