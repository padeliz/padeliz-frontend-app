import axios from 'axios';
import { mockEvents } from './mock/data/events';
import { mockProfile } from './mock/data/profile';
import { mockEligibility } from './mock/data/eligibility';

const MOCK_API_URL = 'http://localhost:3000/api';
const REAL_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Create a mock adapter for axios
const mockAxios = axios.create({
  baseURL: MOCK_API_URL,
});

// Create the real API client
const realAxios = axios.create({
  baseURL: REAL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add mock interceptors
mockAxios.interceptors.response.use(
  response => response,
  async (error) => {
    const endpoint = error.config?.url?.split('?')[0] || '';
    const queryParams = error.config?.url?.split('?')[1] || '';
    const method = error.config?.method?.toLowerCase() || 'get';

    console.log('----------');
    console.log('endpoint', endpoint);
    console.log('queryParams', queryParams);
    console.log('method', method);
    console.log('----------');

    // Never mock Google auth endpoints
    if (endpoint.includes('/auth/google')) {
      return realAxios(error.config);
    }

    // Events endpoints
    if (endpoint.endsWith('/editions')) {
      const status = new URLSearchParams(queryParams).get('status');
      const filteredEvents = status
        ? mockEvents.filter(event => event.status === status)
        : mockEvents;
      return { data: { events: filteredEvents, total: filteredEvents.length, page: 1, pageSize: 10 } };
    }

    // Event details endpoints
    if (endpoint.includes('/editions/')) {
      const match = endpoint.match(/\/editions\/(\w+)/);
      if (match) {
        const eventId = match[1];
        const event = mockEvents.find(e => e.id === eventId);
        return event ? { data: event } : Promise.reject(new Error('Event not found'));
      }
    }

    // User events endpoints
    if (endpoint.endsWith('/user/editions')) {
      const userEvents = mockEvents.slice(0, 2);
      return { data: { events: userEvents, total: userEvents.length, page: 1, pageSize: 10 } };
    }

    // Profile endpoints
    if (endpoint.endsWith('/players/profile')) {
      if (method === 'patch') {
        const updates = error.config?.data ? JSON.parse(error.config.data) : {};
        return { data: { ...mockProfile, ...updates, updatedAt: new Date().toISOString() } };
      }
      return { data: mockProfile };
    }

    // Eligibility endpoints
    if (endpoint.includes('/eligibility')) {
      if (endpoint.includes('/check') && method === 'post') {
        return {
          data: {
            status: 'pending',
            message: 'Your eligibility check is being reviewed.',
            updatedAt: new Date().toISOString(),
          }
        };
      }
      if (endpoint.endsWith('/status')) {
        return { data: mockEligibility };
      }
      if (endpoint.endsWith('/photos') && method === 'post') {
        return { data: { message: 'Photos uploaded successfully' } };
      }
    }

    // Registration endpoints
    if (endpoint.endsWith('/registrations')) {
      if (method === 'post') {
        const eventId = JSON.parse(error.config?.data || '{}').eventId;
        return {
          data: {
            id: `reg_${Math.random().toString(36).slice(2)}`,
            eventId,
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: new Date().toISOString(),
          }
        };
      }
    }

    return Promise.reject(new Error('Not mocked'));
  }
);

// Export the appropriate client based on environment
export const apiClient = process.env.EXPO_PUBLIC_USE_MOCK_API === 'true'
  ? mockAxios
  : realAxios;
