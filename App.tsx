import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Bell, Filter, Loader2, ChevronLeft, ChevronRight, Heart, Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { VideoModal } from './components/VideoModal';
import { AddVideoModal } from './components/AddVideoModal';
import { AddEventModal } from './components/AddEventModal';
import { EventCard } from './components/EventCard';
import { AuthScreen } from './components/AuthScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { EmailConfirmationScreen } from './components/EmailConfirmationScreen';
import { CommentModal } from './components/CommentModal';
import { UserManagementScreen } from './components/UserManagementScreen';
import { Video, CATEGORIES, Category, User, Language, Theme, Notification as NotificationType, ChurchEvent } from './types';
import { DUMMY_VIDEOS, TRANSLATIONS } from './constants';
import { supabase } from './supabaseClient';
import { NotificationDropdown } from './components/NotificationDropdown';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // App State
  const [activeTab, setActiveTab] = useState('library');
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings State
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');

  // Modal States
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [commentVideo, setCommentVideo] = useState<Video | null>(null);

  // Church Events State
  const [events, setEvents] = useState<ChurchEvent[]>(() => {
    const saved = localStorage.getItem('churchEvents');
    return saved ? JSON.parse(saved) : [];
  });

  // Notification States
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sorting & Pagination
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostViewed'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12;

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('favoriteVideos');
    return saved ? JSON.parse(saved) : [];
  });

  // Get Translations
  const t = TRANSLATIONS[language];

  // --- Effects for Settings ---

  useEffect(() => {
    // Handle Theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Handle Language Direction
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // --- Authentication Logic ---

  useEffect(() => {
    // Check for active Supabase session and load profile
    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching session', error);
        setIsAuthChecking(false);
        return;
      }

      const session = data.session;
      if (session?.user) {
        const authUser = session.user;
        let { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .maybeSingle();

        // If profile doesn't exist, create it from user metadata
        if (!profile) {
          const fullName = authUser.user_metadata?.full_name || authUser.email || 'User';
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              full_name: fullName,
              role: 'user',
            })
            .select('full_name, role')
            .single();

          if (!profileError && newProfile) {
            profile = newProfile;
          }
        }

        const userObj: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email || 'User',
          role: (profile?.role as User['role']) || 'user',
        };

        setCurrentUser(userObj);
      }

      setIsAuthChecking(false);
    };

    void initAuth();
  }, []);

  // --- Load media from Supabase ---
  const loadMedia = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('media_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading media items', error);
      // Fallback to dummy data for local/demo usage
      setVideos(DUMMY_VIDEOS);
      return;
    }

    // Fetch likes and comments counts for each video
    const videoIds = data?.map((item: any) => item.id) ?? [];

    // Get likes counts and user's liked videos
    const { data: likesData } = await supabase
      .from('video_likes')
      .select('video_id')
      .in('video_id', videoIds);

    const { data: userLikes } = await supabase
      .from('video_likes')
      .select('video_id')
      .eq('user_id', currentUser.id)
      .in('video_id', videoIds);

    // Get comments counts
    const { data: commentsData } = await supabase
      .from('video_comments')
      .select('video_id')
      .in('video_id', videoIds);

    // Count likes and comments per video
    const likesCountMap = new Map<string, number>();
    const commentsCountMap = new Map<string, number>();
    const userLikedSet = new Set(userLikes?.map((l) => l.video_id) ?? []);

    likesData?.forEach((like) => {
      likesCountMap.set(like.video_id, (likesCountMap.get(like.video_id) || 0) + 1);
    });

    commentsData?.forEach((comment) => {
      commentsCountMap.set(comment.video_id, (commentsCountMap.get(comment.video_id) || 0) + 1);
    });

    const mapped: Video[] =
      data?.map((item: any) => ({
        id: item.id,
        youtubeId: item.youtube_id,
        title: item.title,
        description: item.description || '',
        category: item.category,
        thumbnail: item.thumbnail_url || '',
        views: item.views ?? 0,
        likesCount: likesCountMap.get(item.id) || 0,
        commentsCount: commentsCountMap.get(item.id) || 0,
        isLiked: userLikedSet.has(item.id),
        createdAt: item.created_at,
      })) ?? [];

    setVideos(mapped);
  };

  useEffect(() => {
    void loadMedia();
  }, [currentUser]);

  // --- Web Push Notification Setup ---
  useEffect(() => {
    if (!currentUser) return;

    const setupPushNotifications = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/sw.js');
          // eslint-disable-next-line no-console
          console.log('Service Worker registered:', registration);

          // Request notification permission
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            // Get subscription
            const subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              // Create new subscription
              const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
              if (vapidKey) {
                const newSubscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
                });

                // Store subscription in Supabase (you'd need a table for this)
                // For now, we'll just log it
                // eslint-disable-next-line no-console
                console.log('Push subscription:', newSubscription);
              }
            }
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error setting up push notifications:', error);
        }
      }
    };

    void setupPushNotifications();
  }, [currentUser]);

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // --- Supabase Realtime Subscription for New Videos ---
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('media_items_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media_items',
        },
        async (payload) => {
          const newItem = payload.new as any;
          const newVideo: Video = {
            id: newItem.id,
            youtubeId: newItem.youtube_id,
            title: newItem.title,
            description: newItem.description || '',
            category: newItem.category,
            thumbnail: newItem.thumbnail_url || '',
            views: newItem.views ?? 0,
            createdAt: newItem.created_at,
          };

          // Add to videos list (prevent duplicates by checking if video already exists)
          setVideos((prev) => {
            // Check if video already exists to prevent duplicates
            const exists = prev.some(v => v.id === newVideo.id);
            if (exists) return prev;
            return [newVideo, ...prev];
          });

          // Create notification
          const notification: NotificationType = {
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'new_video',
            title: 'New Video Added',
            message: `${newVideo.title} has been added to the library`,
            videoId: newVideo.id,
            read: false,
            createdAt: new Date().toISOString(),
          };

          setNotifications((prev) => [notification, ...prev]);

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New Video Added', {
              body: `${newVideo.title} has been added to the library`,
              icon: newVideo.thumbnail || '/st-refka.png',
              badge: '/st-refka.png',
              tag: newVideo.id,
              requireInteraction: false,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'media_items',
        },
        (payload) => {
          const updated = payload.new as any;
          // Only sync the view count (avoid clobbering likes/comments client state)
          if (typeof updated?.id !== 'string') return;
          if (typeof updated?.views !== 'number') return;

          setVideos((prev) =>
            prev.map((v) => (v.id === updated.id ? { ...v, views: updated.views } : v))
          );
          setPlayingVideo((prev) =>
            prev && prev.id === updated.id ? { ...prev, views: updated.views } : prev
          );
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // --- Views: count a view on every Play click ---
  const handlePlayVideo = async (video: Video) => {
    // Open immediately + optimistic UI update
    const nextViews = (video.views ?? 0) + 1;
    setPlayingVideo({ ...video, views: nextViews });
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, views: nextViews } : v)));

    // Persist via RPC (increment_media_views) – RLS-safe
    try {
      const { error } = await supabase.rpc('increment_media_views', { p_id: video.id });
      if (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to increment views via RPC', error);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to increment views via RPC', err);
    }
  };

  const handleLogin = async (identifier: string, pass: string, method: 'email' | 'phone'): Promise<string | null> => {
    const credentials = method === 'email'
      ? { email: identifier, password: pass }
      : { phone: identifier, password: pass };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error || !data.user) {
      return error?.message || 'Invalid credentials';
    }

    const authUser = data.user;

    // Fetch profile to get name, role, and phone
    let { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, phone')
      .eq('id', authUser.id)
      .maybeSingle();

    // If profile doesn't exist, create it from user metadata
    if (!profile) {
      const fullName = authUser.user_metadata?.full_name || authUser.email || 'User';
      const { data: newProfile } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          full_name: fullName,
          role: 'user',
          phone: authUser.user_metadata?.phone || authUser.phone || null,
        })
        .select('full_name, role, phone')
        .single();

      if (newProfile) {
        profile = newProfile;
      }
    }

    const userObj: User = {
      id: authUser.id,
      email: authUser.email || '',
      phone: profile?.phone || authUser.user_metadata?.phone || authUser.phone || '',
      name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email || 'User',
      role: (profile?.role as User['role']) || 'user',
    };

    setCurrentUser(userObj);
    return null;
  };

  const handleRegister = async (email: string, pass: string, name: string, phone: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          phone: phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error || !data.user) {
      return error?.message || 'Unable to register user';
    }

    const authUser = data.user;

    // Try to create profile - may fail due to RLS if email not confirmed yet
    // The profile will be created/updated on first login after confirmation
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUser.id,
        full_name: name,
        phone: phone,
        role: 'user',
      });

      if (profileError) {
        // This is expected if RLS blocks unconfirmed users
        // eslint-disable-next-line no-console
        console.log('Profile will be created after email confirmation');
      }
    } catch {
      // Profile creation deferred to first login
    }

    // Do not auto-login; rely on email confirmation if enabled.
    return t.registrationSuccess || 'Registration successful. Please check your email to confirm your address, then sign in.';
  };

  const handleForgotPassword = async (email: string): Promise<string | null> => {
    if (!email) return 'Please enter your email first.';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      return error.message;
    }

    // Null means success; UI shows a generic success message
    return null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setActiveTab('library'); // Reset tab
  };

  // --- App Logic ---

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteVideos', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem('churchEvents', JSON.stringify(events));
  }, [events]);

  // Toggle favorite
  const handleToggleFavorite = (videoId: string) => {
    setFavoriteIds(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  // --- Church Events Handlers ---
  const handleAddEvent = (eventData: { title: string; eventDate: string }) => {
    const newEvent: ChurchEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title: eventData.title,
      eventDate: eventData.eventDate,
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, activeTab, sortBy]);

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

  const handleAddVideo = async (
    newVideoData: Omit<Video, 'id' | 'createdAt' | 'views'>
  ) => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('media_items')
      .insert({
        youtube_id: newVideoData.youtubeId,
        title: newVideoData.title,
        description: newVideoData.description,
        category: newVideoData.category,
        thumbnail_url: newVideoData.thumbnail,
        created_by: currentUser.id,
      })
      .select('*')
      .single();

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error adding media', error);
      alert('Failed to add media item');
      return;
    }

    const newVideo: Video = {
      id: data.id,
      youtubeId: data.youtube_id,
      title: data.title,
      description: data.description || '',
      category: data.category,
      thumbnail: data.thumbnail_url || '',
      views: data.views ?? 0,
      createdAt: data.created_at,
    };

    // Add to videos list with duplicate prevention
    // Real-time subscription may also add it, so we check for duplicates
    setVideos((prev) => {
      const exists = prev.some(v => v.id === newVideo.id);
      if (exists) return prev;
      return [newVideo, ...prev];
    });
  };

  const handleDeleteVideo = async (id: string) => {
    if (!currentUser) return;
    if (!confirm(t.deleteConfirm)) return;

    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting media', error);
      alert('Failed to delete media item');
      return;
    }

    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  // --- Like/Unlike Handler ---
  const handleLike = async (videoId: string, isLiked: boolean) => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', currentUser.id);

        if (error) throw error;

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, isLiked: false, likesCount: Math.max(0, (v.likesCount || 0) - 1) }
              : v
          )
        );
      } else {
        // Like
        const { error } = await supabase.from('video_likes').insert({
          video_id: videoId,
          user_id: currentUser.id,
        });

        if (error) throw error;

        setVideos((prev) =>
          prev.map((v) =>
            v.id === videoId
              ? { ...v, isLiked: true, likesCount: (v.likesCount || 0) + 1 }
              : v
          )
        );
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error toggling like:', error);
    }
  };

  // --- Comment Handler ---
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
        void handlePlayVideo(video);
        setActiveTab('library');
      }
    }
    setIsNotificationOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Rendering ---

  const isResetRoute =
    typeof window !== 'undefined' && window.location.pathname === '/reset-password';
  const isEmailConfirmRoute =
    typeof window !== 'undefined' && window.location.pathname === '/auth/confirm';

  if (isAuthChecking && !isResetRoute && !isEmailConfirmRoute) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center text-zinc-900 dark:text-white">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-500" size={32} />
      </div>
    );
  }

  if (isEmailConfirmRoute) {
    return <EmailConfirmationScreen />;
  }

  if (isResetRoute) {
    return <ResetPasswordScreen />;
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        translations={t}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex selection:bg-indigo-500/30 transition-colors duration-500 ease-smooth">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
        translations={t}
      />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="/st-refka.png" alt="Logo" className="w-10 h-10 rounded-full" />
                  <span className="font-bold text-sm text-zinc-900 dark:text-white">{t.churchName}</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                {[
                  { id: 'library', label: t.mediaLibrary },
                  { id: 'favorites', label: t.favorites },
                  { id: 'studies', label: t.bibleStudies },
                  { id: 'events', label: t.churchEvents },
                  ...(isAdmin ? [
                    { id: 'dashboard', label: t.dashboard },
                    { id: 'users', label: t.users },
                  ] : []),
                  { id: 'settings', label: t.settings },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all text-left"
                >
                  {t.signOut}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-500 ease-smooth">
          {/* Top row: hamburger + actions */}
          <div className="h-16 md:h-20 flex items-center justify-between gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white md:hidden shrink-0"
            >
              <Menu size={24} />
            </button>

            {/* Desktop search bar */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={isAdmin ? t.searchPlaceholderAdmin : t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto md:ml-0">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-all relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border border-white dark:border-zinc-950"></span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onNotificationClick={handleNotificationClick}
                />
              </div>

              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => activeTab === 'events' ? setIsAddEventModalOpen(true) : setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 sm:px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-lg shadow-indigo-600/20 shrink-0"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">{activeTab === 'events' ? t.addEvent : t.addMedia}</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile search row */}
          <div className="flex md:hidden pb-3">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder={isAdmin ? t.searchPlaceholderAdmin : t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">

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

                {/* Dashboard Stats (Admin Only) */}
                {isAdmin && activeTab === 'dashboard' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                      <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{t.totalItems}</p>
                      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{videos.length}</h3>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
                      <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">{t.totalViews}</p>
                      <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        {(videos.reduce((acc, curr) => acc + curr.views, 0) / 1000).toFixed(1)}k
                      </h3>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-2xl shadow-sm">
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium uppercase tracking-wider mb-1">{t.focus}</p>
                      <h3 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{selectedCategory}</h3>
                    </div>
                  </div>
                )}

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
                            onDelete={isAdmin ? handleDeleteEvent : undefined}
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
                {activeTab !== 'settings' && activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'events' && (
                  paginatedVideos.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                        {paginatedVideos.map((video) => (
                          <VideoCard
                            key={video.id}
                            video={video}
                            onPlay={handlePlayVideo}
                            onDelete={isAdmin ? handleDeleteVideo : undefined}
                            onLike={handleLike}
                            onComment={handleCommentClick}
                            isFavorite={favoriteIds.includes(video.id)}
                            onToggleFavorite={handleToggleFavorite}
                          />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-8">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft size={16} />
                            {t.previous}
                          </button>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {currentPage} {t.pageOf} {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            {t.next}
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-500">
                      {activeTab === 'favorites' ? (
                        <>
                          <Heart size={48} className="mb-4 opacity-50" />
                          <p className="text-lg font-medium">{t.noFavorites}</p>
                          <p className="text-sm">{t.noFavoritesDesc}</p>
                        </>
                      ) : (
                        <>
                          <Filter size={48} className="mb-4 opacity-50" />
                          <p className="text-lg font-medium">{t.noMedia}</p>
                          <p className="text-sm">{t.noMediaDesc}</p>
                        </>
                      )}
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modals */}
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
            onAdd={handleAddVideo}
            translations={t}
          />
        )}
        {isAddEventModalOpen && (
          <AddEventModal
            isOpen={isAddEventModalOpen}
            onClose={() => setIsAddEventModalOpen(false)}
            onAdd={handleAddEvent}
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
    </div>
  );
};

export default App;