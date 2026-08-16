import React, { useState, useEffect } from 'react';
import { Bell, Sparkles, Check, Film, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface NotificationItem {
  id: number;
  user_id: number;
  title: str;
  message: str;
  category: str;
  is_read: boolean;
  created_at: string;
}

export const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    axios.get(`/api/notifications?user_id=${currentUser.id}`)
      .then((res) => setNotifications(res.data))
      .catch(console.error);
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
        title="AI Smart Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <aside className="absolute right-0 mt-2 w-80 sm:w-96 glass-modal rounded-3xl p-4 shadow-2xl z-50 border border-slate-700/80 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500" /> AI Digest & Notifications
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No notifications right now.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 transition-all ${
                    n.is_read
                      ? 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      : 'bg-slate-900 border-brand-500/40 text-slate-200 shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{n.title}</span>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] font-bold text-brand-500 hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
