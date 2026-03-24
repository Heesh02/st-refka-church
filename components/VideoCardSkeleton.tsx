import React from 'react';

export const VideoCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    </div>
  );
};
