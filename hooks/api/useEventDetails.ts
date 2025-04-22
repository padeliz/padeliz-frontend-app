import { useState, useCallback } from 'react';
import { eventsService } from '@/services/api/events';
import { Event } from '@/types/api/events';

export function useEventDetails(eventId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [event, setEvent] = useState<Event | null>(null);

  const fetchEventDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsService.getEventDetails(eventId);
      setEvent(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch event details'));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  return {
    loading,
    error,
    event,
    fetchEventDetails,
  };
}
