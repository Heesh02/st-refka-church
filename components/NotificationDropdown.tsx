import React, { useRef, useEffect } from 'react';
import { X, Video, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute top-16 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
              <Video size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''
                    }`}
                    onClick={() => {
                      onNotificationClick(notification);
                      if (!notification.read) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {notification.type === 'new_video' && (
                          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Video size={18} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                              <Clock size={12} />
                              <span>
                                {new Date(notification.createdAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

