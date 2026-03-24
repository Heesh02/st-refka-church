import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '../types';

export const useFavorites = (currentUser: User | null) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!currentUser) {
        setFavoriteIds([]);
        return;
      }
      const { data, error } = await supabase
        .from('user_favorites')
        .select('video_id')
        .eq('user_id', currentUser.id);
      if (error) {
        console.error('Error loading favorites', error);
        return;
      }
      setFavoriteIds((data ?? []).map((row: { video_id: string }) => row.video_id));
    };
    void loadFavorites();
  }, [currentUser]);

  const toggleFavorite = async (videoId: string) => {
    if (!currentUser) return;
    const isFavorite = favoriteIds.includes(videoId);
    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('video_id', videoId);
      if (!error) setFavoriteIds((prev) => prev.filter((id) => id !== videoId));
      return;
    }

    const { error } = await supabase.from('user_favorites').insert({
      user_id: currentUser.id,
      video_id: videoId,
    });
    if (!error) setFavoriteIds((prev) => [...prev, videoId]);
  };

  return { favoriteIds, toggleFavorite };
};
