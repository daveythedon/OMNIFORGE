import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Briefcase, DollarSign, Star, Zap } from 'lucide-react';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import socketService from '../services/socket';
import { formatDistanceToNow } from 'date-fns';

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    socketService.onNewNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast.success('New notification received');
    });

    return () => {
      socketService.off('new-notification');
    };
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const params = filter === 'unread' ? { unread: 'true' } : {};
      const response = await notificationsAPI.getAll(params);
      setNotifications(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      job_assigned: Briefcase,
      job_completed: CheckCheck,
      payment_received: DollarSign,
      review_received: Star,
      automation_triggered: Zap,
      system_alert: AlertCircle
    };

    const Icon = icons[type] || Bell;
    return Icon;
  };

  const getNotificationColor = (type) => {
    const colors = {
      job_assigned: 'bg-blue-100 text-blue-600',
      job_completed: 'bg-green-100 text-green-600',
      payment_received: 'bg-green-100 text-green-600',
      review_received: 'bg-yellow-100 text-yellow-600',
      automation_triggered: 'bg-purple-100 text-purple-600',
      system_alert: 'bg-orange-100 text-orange-600'
    };

    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-blue-100 text-blue-700',
      low: 'bg-gray-100 text-gray-700'
    };

    return badges[priority] || badges.medium;
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Center</h1>
          <p className="text-gray-600">Stay updated with real-time alerts</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <CheckCheck className="w-5 h-5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {['all', 'unread', 'read'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {filterOption}
            {filterOption === 'unread' && notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="ml-2 bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here as they arrive'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationColor(notification.type);

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border p-4 transition ${
                  notification.isRead
                    ? 'border-gray-200'
                    : 'border-blue-300 bg-blue-50 bg-opacity-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityBadge(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {notifications.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {notifications.filter((n) => !n.isRead).length}
              </p>
              <p className="text-sm text-gray-600">Unread</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter((n) => n.isRead).length}
              </p>
              <p className="text-sm text-gray-600">Read</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
