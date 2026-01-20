import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Video } from '../types';

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // Prevent body scroll
    if (video) document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [video, onClose]);

  if (!video) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&origin=${origin}&rel=0&modestbranding=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <motion.div 
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-5xl bg-zinc-900 rounded-2xl shadow-2xl shadow-black overflow-hidden border border-zinc-800 flex flex-col max-h-[90vh] z-10"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900">
          <h3 className="text-lg font-semibold text-white truncate pr-8">
            {video.title}
          </h3>
          <div className="flex items-center gap-2">
            <a 
                href={`https://www.youtube.com/watch?v=${video.youtubeId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded-lg transition-all"
                title="Open in YouTube"
            >
                <ExternalLink size={20} />
            </a>
            <button 
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
            >
                <X size={24} />
            </button>
          </div>
        </div>

        <div className="relative aspect-video bg-black w-full">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={embedUrl}
            title={video.title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="p-6 overflow-y-auto bg-zinc-900">
          <div className="flex items-center gap-4 mb-4">
             <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                {video.category}
             </span>
             <span className="text-zinc-400 text-sm">
                {video.views.toLocaleString()} views
             </span>
          </div>
          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {video.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
};