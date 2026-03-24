import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { CATEGORIES, Video } from '../types';

interface DashboardScreenProps {
  videos: Video[];
  translations: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ videos, translations: t }) => {
  const totalItems = videos.length;
  const totalViews = videos.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = videos.reduce((acc, curr) => acc + (curr.likesCount || 0), 0);
  const totalComments = videos.reduce((acc, curr) => acc + (curr.commentsCount || 0), 0);
  const avgViewsPerItem = totalItems ? Math.round(totalViews / totalItems) : 0;
  const mostViewedVideo = totalItems
    ? videos.reduce<Video | null>((top, video) => (!top || video.views > top.views ? video : top), null)
    : null;
  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);
  const categoryCounts = CATEGORIES.filter((c) => c !== 'All').map((category) => ({
    category,
    count: videos.filter((v) => v.category === category).length,
  }));

  return (
    <div className="space-y-8 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">{t.totalItems}</p>
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{totalItems}</h3>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">{t.totalViews}</p>
          <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">{totalViews.toLocaleString()}</h3>
          {avgViewsPerItem > 0 && (
            <p className="mt-1 text-xs text-zinc-500">{t.avgViewsPerItem}: <span className="font-medium">{avgViewsPerItem.toLocaleString()}</span></p>
          )}
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-100 dark:border-indigo-500/20 p-6 rounded-2xl shadow-sm">
          <p className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">{t.engagement}</p>
          <div className="flex items-center gap-6">
            <div><div className="flex items-center gap-2 text-sm"><Heart size={16} className="text-rose-500" />{t.totalLikes}</div><p className="mt-1 text-lg font-bold">{totalLikes.toLocaleString()}</p></div>
            <div><div className="flex items-center gap-2 text-sm"><MessageCircle size={16} className="text-sky-500" />{t.totalComments}</div><p className="mt-1 text-lg font-bold">{totalComments.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">{t.mostPopular}</p>
            {mostViewedVideo ? <h3 className="text-base font-semibold line-clamp-2">{mostViewedVideo.title}</h3> : <p className="text-sm text-zinc-500">{t.noMedia}</p>}
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">{t.recentUploads}</p>
            {recentVideos.length > 0 ? (
              <ul className="space-y-2">{recentVideos.map((v) => <li key={v.id} className="text-sm font-medium line-clamp-1">{v.title}</li>)}</ul>
            ) : <p className="text-sm text-zinc-500">{t.noRecentUploads}</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">{t.byCategory}</p>
          <div className="space-y-2">
            {categoryCounts.map(({ category, count }) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300">{t.categories[category as keyof typeof t.categories]}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
