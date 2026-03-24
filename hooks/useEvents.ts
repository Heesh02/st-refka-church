import { useEffect, useState } from 'react';
import { ChurchEvent, User } from '../types';
import { supabase } from '../supabaseClient';

export const useEvents = (currentUser: User | null) => {
  const [events, setEvents] = useState<ChurchEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!currentUser) {
        setEvents([]);
        return;
      }
      const { data, error } = await supabase
        .from('church_events')
        .select('id, title, event_date, created_at')
        .order('event_date', { ascending: true });
      if (error) {
        console.error('Error loading events', error);
        return;
      }
      setEvents((data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        eventDate: row.event_date,
        createdAt: row.created_at,
      })));
    };
    void loadEvents();
  }, [currentUser]);

  const addEvent = async (eventData: { title: string; eventDate: string }) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('church_events')
      .insert({
        title: eventData.title,
        event_date: eventData.eventDate,
        created_by: currentUser.id,
      })
      .select('id, title, event_date, created_at')
      .single();
    if (error || !data) return;
    setEvents((prev) => [...prev, {
      id: data.id,
      title: data.title,
      eventDate: data.event_date,
      createdAt: data.created_at,
    }]);
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from('church_events').delete().eq('id', id);
    if (error) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return { events, addEvent, deleteEvent };
};
