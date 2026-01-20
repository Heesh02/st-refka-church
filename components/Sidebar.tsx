import React from 'react';
import { LayoutGrid, Video, BookOpen, Calendar, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  translations: any;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout, translations }) => {
  const t = translations;
  const isAdmin = user.role === 'admin';

  const menuItems = [
    ...(isAdmin ? [{ id: 'dashboard', icon: LayoutGrid, label: t.dashboard }] : []),
    { id: 'library', icon: Video, label: t.mediaLibrary },
    { id: 'studies', icon: BookOpen, label: t.bibleStudies },
    { id: 'events', icon: Calendar, label: t.churchEvents },
    { id: 'settings', icon: Settings, label: t.settings },
  ];

  return (
    <div className="w-64 h-screen bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col sticky top-0 hidden md:flex transition-colors duration-500 ease-smooth">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-900/50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="w-12 h-12 shrink-0 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-indigo-900/20 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/10"
        >
             <img src="/st-refka.png" alt="St. Refka Logo" className="w-full h-full object-cover" />
        </motion.div>
        <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-tight text-zinc-900 dark:text-white">{t.churchName}</span>
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{t.mediaCenter}</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`relative w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-smooth group overflow-hidden ${
              activeTab === item.id
                ? 'text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 -z-10"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon
              size={20}
              className={`transition-colors duration-300 ${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-500' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`}
            />
            <span className="relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300 group hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border border-zinc-200 dark:border-zinc-700 shadow-sm ${isAdmin ? 'bg-indigo-600 dark:bg-indigo-900' : 'bg-zinc-600 dark:bg-zinc-800'}`}>
               {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user.name}</h4>
              <p className="text-xs text-zinc-500 truncate capitalize">{user.role}</p>
            </div>
            <button 
              onClick={onLogout}
              title={t.signOut}
              className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-400/10"
            >
              <LogOut size={18} />
            </button>
          </div>
      </div>
    </div>
  );
};