import React, { useState, useRef, useEffect } from 'react';
import { Play, Eye, Trash2, Heart, MessageCircle, Share2, Bookmark, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video } from '../types';
import { WhatsAppIcon, FacebookIcon, MessengerIcon, TelegramIcon } from './ShareIcons';

const shareMenuVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 28,
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 4,
    transition: { duration: 0.15, staggerChildren: 0.02, staggerDirection: -1 },
  },
};

const shareItemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, x: -4, transition: { duration: 0.1 } },
};

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onDelete?: (id: string) => void;
  onLike?: (videoId: string, isLiked: boolean) => void;
  onComment?: (video: Video) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (videoId: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onDelete,
  onLike,
  onComment,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(video.id, video.isLiked || false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(video);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const getVideoUrl = () => {
    return `https://www.youtube.com/watch?v=${video.youtubeId}`;
  };

  const shareToWhatsApp = () => {
    const url = getVideoUrl();
    const text = `🎬 ${video.title}\n\n${video.description}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToFacebook = () => {
    const url = getVideoUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToTelegram = () => {
    const url = getVideoUrl();
    const text = `🎬 ${video.title}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    setShowShareMenu(false);
  };

  const shareToMessenger = () => {
    const url = getVideoUrl();
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_FB_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`, '_blank');
    setShowShareMenu(false);
  };

  const copyLink = async () => {
    const url = getVideoUrl();
    await navigator.clipboard.writeText(url);
    setShowShareMenu(false);
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-400 ease-smooth hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-950">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover opacity-100 dark:opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-smooth"
        />

        {/* Overlay Play Button */}
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-smooth backdrop-blur-[2px]">
          <button
            onClick={() => onPlay(video)}
            className="w-14 h-14 rounded-full bg-white/20 dark:bg-white/10 border border-white/40 dark:border-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300 ease-bounce-sm"
          >
            <Play fill="white" className="text-white translate-x-0.5" size={24} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
            {video.category}
          </span>
          <div className="flex items-center gap-1">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(video.id);
                }}
                className={`transition-colors p-1 ${isFavorite
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-amber-500 dark:hover:text-amber-400'
                  }`}
                title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                <Bookmark size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(video.id);
                }}
                className="text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                title="Delete Video"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors duration-300">
          {video.title}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 flex-1">
          {video.description}
        </p>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-auto space-y-3">
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Eye size={14} />
              <span>{video.views.toLocaleString()}</span>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              {new Date(video.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Like, Comment, and Share Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${video.isLiked
                ? 'text-red-600 dark:text-red-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
            >
              <Heart
                size={16}
                fill={video.isLiked ? 'currentColor' : 'none'}
                className={video.isLiked ? 'animate-pulse' : ''}
              />
              <span>{video.likesCount || 0}</span>
            </button>
            <button
              onClick={handleComment}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <MessageCircle size={16} />
              <span>{video.commentsCount || 0}</span>
            </button>

            {/* Share Button */}
            <div className="relative" ref={shareMenuRef}>
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  showShareMenu
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400'
                }`}
                aria-expanded={showShareMenu}
                aria-haspopup="menu"
              >
                <Share2 size={16} className={showShareMenu ? 'scale-110 transition-transform duration-200' : ''} />
              </button>

              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    role="menu"
                    variants={shareMenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute bottom-full right-0 mb-2 origin-bottom-right bg-white dark:bg-zinc-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-zinc-200 dark:border-zinc-700 py-1.5 min-w-[172px] z-50 overflow-hidden"
                  >
                    <motion.button
                      role="menuitem"
                      variants={shareItemVariants}
                      onClick={shareToWhatsApp}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 flex items-center gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#25D366]">
                        <WhatsAppIcon size={16} />
                      </span>
                      WhatsApp
                    </motion.button>
                    <motion.button
                      role="menuitem"
                      variants={shareItemVariants}
                      onClick={shareToFacebook}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 flex items-center gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]">
                        <FacebookIcon size={16} />
                      </span>
                      Facebook
                    </motion.button>
                    <motion.button
                      role="menuitem"
                      variants={shareItemVariants}
                      onClick={shareToMessenger}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 flex items-center gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0084FF]/10 text-[#0084FF]">
                        <MessengerIcon size={16} />
                      </span>
                      Messenger
                    </motion.button>
                    <motion.button
                      role="menuitem"
                      variants={shareItemVariants}
                      onClick={shareToTelegram}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 flex items-center gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#26A5E4]/10 text-[#26A5E4]">
                        <TelegramIcon size={16} />
                      </span>
                      Telegram
                    </motion.button>
                    <motion.hr
                      variants={shareItemVariants}
                      className="my-1 border-zinc-200 dark:border-zinc-700"
                    />
                    <motion.button
                      role="menuitem"
                      variants={shareItemVariants}
                      onClick={copyLink}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/80 flex items-center gap-3 transition-colors"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-200/80 dark:bg-zinc-700/80 text-zinc-600 dark:text-zinc-300">
                        <Link2 size={16} />
                      </span>
                      Copy Link
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};