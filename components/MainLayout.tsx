import React from 'react';
import { Bell, Menu, Plus, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { NotificationDropdown } from './NotificationDropdown';
import { User, Notification as NotificationType } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  t: any;
  isAdmin: boolean;
  isRtl: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void | Promise<void>;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  unreadCount: number;
  notifications: NotificationType[];
  isNotificationOpen: boolean;
  setIsNotificationOpen: (v: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: NotificationType) => void;
  onAddClick: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children, user, t, isAdmin, isRtl, activeTab, setActiveTab, onLogout, searchQuery, setSearchQuery,
  unreadCount, notifications, isNotificationOpen, setIsNotificationOpen, onMarkAsRead, onMarkAllAsRead, onNotificationClick, onAddClick,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex selection:bg-indigo-500/30 transition-colors duration-500 ease-smooth">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={onLogout} translations={t} />
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: isRtl ? '100%' : '-100%' }} animate={{ x: 0 }} exit={{ x: isRtl ? '100%' : '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed top-0 h-full w-72 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 z-50 md:hidden overflow-y-auto ${isRtl ? 'right-0 border-l' : 'left-0 border-r'}`}>
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3"><img src="/st-refka.png" alt="Logo" className="w-10 h-10 rounded-full" /><span className="font-bold text-sm">{t.churchName}</span></div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"><X size={20} /></button>
              </div>
              <nav className="p-4 space-y-2">
                {[{ id: 'library', label: t.mediaLibrary }, { id: 'favorites', label: t.favorites }, { id: 'studies', label: t.bibleStudies }, { id: 'events', label: t.churchEvents }, ...(isAdmin ? [{ id: 'dashboard', label: t.dashboard }, { id: 'users', label: t.users }] : []), { id: 'settings', label: t.settings }].map((item) => (
                  <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{item.label}</button>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-500 ease-smooth">
          <div className="h-16 md:h-20 flex items-center justify-between gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white md:hidden shrink-0"><Menu size={24} /></button>
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input type="text" placeholder={isAdmin ? t.searchPlaceholderAdmin : t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto md:ml-0">
              <div className="relative">
                <button onClick={() => setIsNotificationOpen(!isNotificationOpen)} className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all relative">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-zinc-950"></span>}
                </button>
                <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} notifications={notifications} onMarkAsRead={onMarkAsRead} onMarkAllAsRead={onMarkAllAsRead} onNotificationClick={onNotificationClick} />
              </div>
              {isAdmin && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onAddClick} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20 shrink-0">
                  <Plus size={18} />
                  <span className="hidden sm:inline">{activeTab === 'events' ? t.addEvent : t.addMedia}</span>
                </motion.button>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
};
