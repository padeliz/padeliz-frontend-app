import { Event } from '@/types/api/events';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Padel Tournament',
    description: 'Join us for an exciting summer padel tournament!',
    date: '2024-07-15',
    location: {
      name: 'Padel Club Central',
      address: '123 Sports Street',
      city: 'Barcelona',
      coordinates: { lat: 41.3851, lng: 2.1734 },
    },
    price: 50,
    registrationDeadline: '2024-07-01',
    hoursInterval: {
      start: '09:00',
      end: '18:00',
    },
    organizer: {
      name: 'John Doe',
      contact: 'john@padelclub.com',
    },
    status: 'upcoming',
    maxParticipants: 32,
    currentParticipants: 12,
    imageUrl: 'https://example.com/tournament1.jpg',
    level: 'intermediate',
    format: 'doubles',
  },
  {
    id: '2',
    title: 'Spring Championship',
    description: 'Spring season championship with great prizes!',
    date: '2024-04-20',
    location: {
      name: 'Padel Arena',
      address: '456 Game Avenue, Town',
      city: 'Town',
      coordinates: { lat: 0, lng: 0 },
    },
    price: 45,
    registrationDeadline: '2024-04-10',
    hoursInterval: {
      start: '10:00',
      end: '17:00',
    },
    organizer: {
      name: 'Jane Smith',
      contact: 'jane@padelarena.com',
    },
    status: 'upcoming',
    maxParticipants: 24,
    currentParticipants: 8,
    imageUrl: 'https://example.com/tournament2.jpg',
    level: 'beginner',
    format: 'training',
  },
  // Add more mock events as needed
];
