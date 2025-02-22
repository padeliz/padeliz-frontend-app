import { useEffect } from 'react';
import { mockWorker } from '@/services/api/mock/server';
import 'whatwg-fetch';

// Initialize MSW
async function initMocks() {
  if (process.env.EXPO_PUBLIC_USE_MOCK_API === 'true') {
    if (typeof window !== 'undefined') {
      await mockWorker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
    }
  }
}

initMocks().catch(console.error);

export default function App() {
  // Your existing App component code
}
