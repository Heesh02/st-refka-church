import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Filter, Loader2 } from 'lucide-react';
import { Route, Routes } from 'react-router-dom';
import { AddEventModal } from './components/AddEventModal';
import { AddVideoModal } from './components/AddVideoModal';
import { AuthScreen } from './components/AuthScreen';
import { CommentModal } from './components/CommentModal';
import { DashboardScreen } from './components/DashboardScreen';
import { EmailConfirmationScreen } from './components/EmailConfirmationScreen';
import { EventCard } from './components/EventCard';
import { MainLayout } from './components/MainLayout';
import { OfflineBanner } from './components/OfflineBanner';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { UserManagementScreen } from './components/UserManagementScreen';
import { VideoGrid } from './components/VideoGrid';
import { VideoModal } from './components/VideoModal';
import { TRANSLATIONS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useEvents } from './hooks/useEvents';
import { useFavorites } from './hooks/useFavorites';
import { useMedia } from './hooks/useMedia';
import { Category, CATEGORIES, Language, Notification as NotificationType, Theme, Video } from './types';

const AppShell: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState('library');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [commentVideo, setCommentVideo] = useState<Video | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostViewed'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;
  const t = TRANSLATIONS[language];
  const {
    currentUser,
    isAuthChecking,
    handleLogin,
    handleRegister,
    handleForgotPassword,
    handleLogout,
    handleGoogleSignIn,
  } = useAuth({
    passwordTooShort: t.passwordTooShort,
    passwordNeedsNumber: t.passwordNeedsNumber,
    registrationSuccess: t.registrationSuccess,
  });
  const { videos, isLoadingMedia, playingVideo, setPlayingVideo, loadMedia, playVideo, addVideo, deleteVideo, likeVideo } = useMedia(currentUser, setNotifications);
  const { events, addEvent, deleteEvent } = useEvents(currentUser);
  const { favoriteIds, toggleFavorite } = useFavorites(currentUser);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeTab, sortBy]);

  const isAdmin = currentUser?.role === 'admin';
  const isRtl = language === 'ar';

  useEffect(() => {
    if (!isAdmin && (activeTab === 'dashboard' || activeTab === 'users')) {
      setActiveTab('library');
    }
  }, [isAdmin, activeTab]);

  const filteredVideos = useMemo(() => {
    let result = videos.filter(video => {
      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTab = true;
      if (activeTab === 'studies' && video.category !== 'Bible Study') matchesTab = false;
      if (activeTab === 'events' && video.category !== 'Events') matchesTab = false;
      if (activeTab === 'favorites') matchesTab = favoriteIds.includes(video.id);
      // Don't show videos in settings, dashboard, or users tabs
      if (activeTab === 'settings' || activeTab === 'dashboard' || activeTab === 'users') matchesTab = false;

      return matchesCategory && matchesSearch && matchesTab;
    });

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostViewed':
          return b.views - a.views;
        default:
          return 0;
      }
    });

    return result;
  }, [videos, selectedCategory, searchQuery, activeTab, sortBy, favoriteIds]);

  // Pagination
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * videosPerPage;
    return filteredVideos.slice(startIndex, startIndex + videosPerPage);
  }, [filteredVideos, currentPage, videosPerPage]);

  const handleCommentClick = (video: Video) => {
    setCommentVideo(video);
  };

  const handleCommentModalClose = () => {
    setCommentVideo(null);
    // Reload videos to update comment counts
    if (currentUser) {
      void loadMedia();
    }
  };

  // --- Notification Handlers ---
  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notification: NotificationType) => {
    if (notification.videoId) {
      const video = videos.find((v) => v.id === notification.videoId);
      if (video) {
        void playVideo(video);
        setActiveTab('library');
      }
    }
    setIsNotificationOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-white">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" size={32} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        onGoogleSignIn={handleGoogleSignIn}
        translations={t}
      />
    );
  }

  return (
    <>
      <OfflineBanner />
      <MainLayout
        user={currentUser}
        t={t}
        isAdmin={isAdmin}
        isRtl={isRtl}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadCount={unreadCount}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        setIsNotificationOpen={setIsNotificationOpen}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
        onAddClick={() => activeTab === 'events' ? setIsAddEventModalOpen(true) : setIsAddModalOpen(true)}
      >

            {/* Title & Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <motion.h1
                  key={activeTab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2"
                >
                  {activeTab === 'dashboard' ? t.dashboard :
                    activeTab === 'studies' ? t.bibleStudies :
                      activeTab === 'events' ? t.churchEvents :
                        activeTab === 'settings' ? t.settings :
                          activeTab === 'users' ? t.users :
                            activeTab === 'favorites' ? t.favorites : t.mediaLibrary}
                </motion.h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {isAdmin
                    ? `${t.welcomeAdmin}`
                    : t.welcomeUser}
                </p>
              </div>

              {/* Categories - Only show if we aren't in a specific tab that restricts content */}
              {activeTab === 'library' && (
                <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto max-w-full">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${selectedCategory === cat
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                        }`}
                    >
                      {t.categories[cat]}
                    </button>
                  ))}
                </div>
              )}

              {/* Sort Dropdown - Show on library and favorites tabs */}
              {(activeTab === 'library' || activeTab === 'favorites') && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.sortBy}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'mostViewed')}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="newest">{t.newest}</option>
                    <option value="oldest">{t.oldest}</option>
                    <option value="mostViewed">{t.mostViewed}</option>
                  </select>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Settings View */}
                {activeTab === 'settings' && (
                  <SettingsScreen
                    theme={theme}
                    language={language}
                    setTheme={setTheme}
                    setLanguage={setLanguage}
                    translations={t}
                  />
                )}

                {/* Dashboard Stats & Insights (Admin Only) */}
                {isAdmin && activeTab === 'dashboard' && <DashboardScreen videos={videos} translations={t} />}

                {/* User Management (Admin Only) */}
                {isAdmin && activeTab === 'users' && (
                  <UserManagementScreen
                    translations={t}
                    currentUserId={currentUser.id}
                  />
                )}

                {/* Events Grid */}
                {activeTab === 'events' && (
                  events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                      {events
                        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                        .map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onDelete={isAdmin ? deleteEvent : undefined}
                            translations={t}
                            language={language}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                      <Filter size={48} className="mb-4 opacity-50" />
                      <p className="text-lg font-medium">{t.noEvents}</p>
                      <p className="text-sm">{t.noEventsDesc}</p>
                    </div>
                  )
                )}

                {/* Video Grid */}
                <VideoGrid
                  activeTab={activeTab}
                  paginatedVideos={paginatedVideos}
                  isLoadingMedia={isLoadingMedia}
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  t={t}
                  isAdmin={isAdmin}
                  favoriteIds={favoriteIds}
                  onPlay={playVideo}
                  onDelete={async (id) => {
                    if (!confirm(t.deleteConfirm)) return;
                    await deleteVideo(id);
                  }}
                  onLike={async (videoId, isLiked) => {
                    if (!currentUser) return;
                    await likeVideo(videoId, isLiked, currentUser.id);
                  }}
                  onComment={handleCommentClick}
                  onToggleFavorite={toggleFavorite}
                />
              </motion.div>
            </AnimatePresence>
      </MainLayout>

      <AnimatePresence>
        {playingVideo && (
          <VideoModal
            video={playingVideo}
            onClose={() => setPlayingVideo(null)}
          />
        )}
        {isAddModalOpen && (
          <AddVideoModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={(video) => currentUser ? addVideo(currentUser.id, video) : undefined}
            translations={t}
          />
        )}
        {isAddEventModalOpen && (
          <AddEventModal
            isOpen={isAddEventModalOpen}
            onClose={() => setIsAddEventModalOpen(false)}
            onAdd={addEvent}
            translations={t}
          />
        )}
        {commentVideo && currentUser && (
          <CommentModal
            isOpen={!!commentVideo}
            onClose={handleCommentModalClose}
            videoId={commentVideo.id}
            videoTitle={commentVideo.title}
            currentUserId={currentUser.id}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/reset-password" element={<ResetPasswordScreen />} />
      <Route path="/auth/confirm" element={<EmailConfirmationScreen />} />
      <Route path="*" element={<AppShell />} />
    </Routes>
  );
};

export default App;