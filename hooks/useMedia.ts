import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Notification as NotificationType, User, Video } from '../types';
import { supabase } from '../supabaseClient';

const VIEW_COOLDOWN_MS = 30000;

export const useMedia = (
  currentUser: User | null,
  setNotifications: Dispatch<SetStateAction<NotificationType[]>>
) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const recentViewsRef = useRef<Set<string>>(new Set());

  const loadMedia = async () => {
    if (!currentUser) return;
    setIsLoadingMedia(true);
    const { data, error } = await supabase.rpc('load_media_with_stats', {
      p_user_id: currentUser.id,
    });
    if (error) {
      console.error('Error loading media items via RPC', error);
      setVideos([]);
      setIsLoadingMedia(false);
      return;
    }
    setVideos((data ?? []).map((item: any) => ({
      id: item.id,
      youtubeId: item.youtube_id,
      title: item.title,
      description: item.description || '',
      category: item.category,
      thumbnail: item.thumbnail_url || '',
      views: item.views ?? 0,
      likesCount: item.likes_count ?? 0,
      commentsCount: item.comments_count ?? 0,
      isLiked: item.is_liked ?? false,
      createdAt: item.created_at,
    })));
    setIsLoadingMedia(false);
  };

  useEffect(() => {
    void loadMedia();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel('media_items_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'media_items' }, (payload) => {
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
        setVideos((prev) => (prev.some((v) => v.id === newVideo.id) ? prev : [newVideo, ...prev]));
        setNotifications((prev) => [{
          id: `notif-${Date.now()}-${Math.random()}`,
          type: 'new_video',
          title: 'New Video Added',
          message: `${newVideo.title} has been added to the library`,
          videoId: newVideo.id,
          read: false,
          createdAt: new Date().toISOString(),
        }, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'media_items' }, (payload) => {
        const updated = payload.new as any;
        if (typeof updated?.id !== 'string' || typeof updated?.views !== 'number') return;
        setVideos((prev) => prev.map((v) => (v.id === updated.id ? { ...v, views: updated.views } : v)));
        setPlayingVideo((prev) => prev && prev.id === updated.id ? { ...prev, views: updated.views } : prev);
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUser, setNotifications]);

  const playVideo = async (video: Video) => {
    const nextViews = (video.views ?? 0) + 1;
    setPlayingVideo({ ...video, views: nextViews });
    setVideos((prev) => prev.map((v) => (v.id === video.id ? { ...v, views: nextViews } : v)));

    if (recentViewsRef.current.has(video.id)) return;
    recentViewsRef.current.add(video.id);
    window.setTimeout(() => {
      recentViewsRef.current.delete(video.id);
    }, VIEW_COOLDOWN_MS);

    try {
      await supabase.rpc('increment_media_views', { p_id: video.id });
    } catch (err) {
      console.warn('Failed to increment views via RPC', err);
    }
  };

  const addVideo = async (currentUserId: string, newVideoData: Omit<Video, 'id' | 'createdAt' | 'views'>) => {
    const { data, error } = await supabase
      .from('media_items')
      .insert({
        youtube_id: newVideoData.youtubeId,
        title: newVideoData.title,
        description: newVideoData.description,
        category: newVideoData.category,
        thumbnail_url: newVideoData.thumbnail,
        created_by: currentUserId,
      })
      .select('*')
      .single();
    if (error) throw error;
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
    setVideos((prev) => (prev.some((v) => v.id === newVideo.id) ? prev : [newVideo, ...prev]));
  };

  const deleteVideo = async (id: string) => {
    const { error } = await supabase.from('media_items').delete().eq('id', id);
    if (error) throw error;
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const likeVideo = async (videoId: string, isLiked: boolean, userId: string) => {
    if (isLiked) {
      const { error } = await supabase.from('video_likes').delete().eq('video_id', videoId).eq('user_id', userId);
      if (error) throw error;
      setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, isLiked: false, likesCount: Math.max(0, (v.likesCount || 0) - 1) } : v));
      return;
    }
    const { error } = await supabase.from('video_likes').insert({ video_id: videoId, user_id: userId });
    if (error) throw error;
    setVideos((prev) => prev.map((v) => v.id === videoId ? { ...v, isLiked: true, likesCount: (v.likesCount || 0) + 1 } : v));
  };

  return {
    videos,
    isLoadingMedia,
    playingVideo,
    setPlayingVideo,
    loadMedia,
    playVideo,
    addVideo,
    deleteVideo,
    likeVideo,
  };
};
