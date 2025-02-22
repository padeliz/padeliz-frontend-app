import { useState, useCallback, useEffect } from 'react';
import { eventsService } from '@/services/api/events';
import { Event, EventStatus } from '@/types/api/events';
import { useAuth } from '@/context/auth/AuthContext';

export function useEvents(status: EventStatus | 'user') {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let response;
      if (status === 'user') {
        if (!isAuthenticated) {
          setEvents([]);
          return;
        }
        response = await eventsService.getUserEvents();
      } else {
        response = await eventsService.getEvents(status);
      }
      setEvents(response.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [status, isAuthenticated]);

  // Add useEffect to fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { loading, events, fetchEvents };
}
