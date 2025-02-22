import { Share } from 'react-native';
import { Event } from '@/types/api/events';
import { format } from 'date-fns';

export async function shareEvent(event: Event) {
  try {
    const message = `
Join me at ${event.title}!

📅 Date: ${format(new Date(event.date), 'MMMM dd, yyyy')}
⏰ Time: ${event.hoursInterval.start} - ${event.hoursInterval.end}
📍 Location: ${event.location.name}
${event.location.address}

${event.description}

Register now to secure your spot!
`;

    await Share.share({
      message,
      title: event.title,
    });
  } catch (error) {
    console.error('Error sharing event:', error);
    throw error;
  }
}
