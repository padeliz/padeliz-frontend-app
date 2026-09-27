import { createContext, useContext, useState, useCallback } from 'react';
import { EventStatus } from '@/types/types';

type EventsContextType = {
  getEventStatus: (id: string, defaultStatus: EventStatus) => EventStatus;
  setEventStatus: (id: string, status: EventStatus) => void;
};

const EventsContext = createContext<EventsContextType | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, EventStatus>>({});

  const getEventStatus = useCallback(
    (id: string, defaultStatus: EventStatus): EventStatus => {
      return statusOverrides[id] ?? defaultStatus;
    },
    [statusOverrides],
  );

  const setEventStatus = useCallback((id: string, status: EventStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }, []);

  return (
    <EventsContext.Provider value={{ getEventStatus, setEventStatus }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}
