import React from 'react';
import { ChevronLeft, ChevronRight, Filter, Heart } from 'lucide-react';
import { Video } from '../types';
import { VideoCard } from './VideoCard';
import { VideoCardSkeleton } from './VideoCardSkeleton';

interface VideoGridProps {
  activeTab: string;
  paginatedVideos: Video[];
  isLoadingMedia: boolean;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  t: any;
  isAdmin: boolean;
  favoriteIds: string[];
  onPlay: (video: Video) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onLike: (videoId: string, isLiked: boolean) => void | Promise<void>;
  onComment: (video: Video) => void;
  onToggleFavorite: (videoId: string) => void | Promise<void>;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  activeTab,
  paginatedVideos,
  isLoadingMedia,
  totalPages,
  currentPage,
  setCurrentPage,
  t,
  isAdmin,
  favoriteIds,
  onPlay,
  onDelete,
  onLike,
  onComment,
  onToggleFavorite,
}) => {
  if (activeTab === 'settings' || activeTab === 'dashboard' || activeTab === 'users' || activeTab === 'events') {
    return null;
  }

  if (isLoadingMedia) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
        {Array.from({ length: 8 }).map((_, idx) => <VideoCardSkeleton key={idx} />)}
      </div>
    );
  }

  if (paginatedVideos.length === 0) {
    return (
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
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
        {paginatedVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={onPlay}
            onDelete={isAdmin ? onDelete : undefined}
            onLike={onLike}
            onComment={onComment}
            isFavorite={favoriteIds.includes(video.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium">
            <ChevronLeft size={16} />
            {t.previous}
          </button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">{currentPage} {t.pageOf} {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium">
            {t.next}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  );
};
