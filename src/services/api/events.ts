import { apiClient } from './client';
import { EventsResponse, Event, EventStatus } from '@/types/api/events';

export const eventsService = {
  async getEvents(status: EventStatus): Promise<EventsResponse> {
    const response = await apiClient.get<EventsResponse>(`/editions?status=${status}`);
    return response.data;
  },

  async getEventDetails(eventId: string): Promise<Event> {
    const response = await apiClient.get<Event>(`/editions/${eventId}`);
    return response.data;
  },

  async getUserEvents(): Promise<EventsResponse> {
    const response = await apiClient.get<EventsResponse>('/user/editions');
    return response.data;
  },
};
