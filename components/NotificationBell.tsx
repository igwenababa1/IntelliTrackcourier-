import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import Icon from './Icon';
import NotificationPanel from './NotificationPanel';

interface NotificationBellProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, unreadCount, onMarkAsRead }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);
    
    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const togglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    return (
        <div className="notification-bell" ref={bellRef}>
            <div onClick={togglePanel} style={{ position: 'relative' }}>
                <Icon name="bell" />
                {unreadCount > 0 && (
                    <div className="notification-badge">{unreadCount}</div>
                )}
            </div>
            {isPanelOpen && (
                <NotificationPanel 
                    notifications={notifications} 
                    onMarkAsRead={() => {
                        onMarkAsRead();
                        // Keep panel open for a moment so user can see the change
                        setTimeout(() => setIsPanelOpen(false), 300);
                    }}
                />
            )}
        </div>
    );
};

export default NotificationBell;