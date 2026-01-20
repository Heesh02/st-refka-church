import React from 'react';
import { Play, Clock, Eye, Trash2, Heart, MessageCircle } from 'lucide-react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  onDelete?: (id: string) => void;
  onLike?: (videoId: string, isLiked: boolean) => void;
  onComment?: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onDelete,
  onLike,
  onComment,
}) => {
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

        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1">
            <Clock size={12} /> 12:45
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
            {video.category}
          </span>
          {onDelete && (
            <div className="relative">
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
            </div>
          )}
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

          {/* Like and Comment Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                video.isLiked
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
          </div>
        </div>
      </div>
    </div>
  );
};