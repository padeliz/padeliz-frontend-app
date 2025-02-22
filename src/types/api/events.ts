export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  hoursInterval: {
    start: string;
    end: string;
  };
  imageUrl: string;
  location: {
    name: string;
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  organizer: {
    name: string;
    contact: string;
  };
  price: number;
  currentParticipants: number;
  maxParticipants: number;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  pageSize: number;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed';
