import React from 'react';
import { Notification } from '../types';

interface NotificationPanelProps {
    notifications: Notification[];
    onMarkAsRead: () => void;
}

// Function to format time difference for display
const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead }) => {
    return (
        <div className="notification-panel">
            <div className="notification-panel-header">
                <h4>Notifications</h4>
                <button className="notification-mark-read" onClick={onMarkAsRead}>
                    Mark all as read
                </button>
            </div>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">You have no new notifications.</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                            <h5 className="notification-item-title">{notification.title}</h5>
                            <p className="notification-item-message">{notification.message}</p>
                            <span className="notification-item-time">{timeAgo(notification.timestamp)}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;