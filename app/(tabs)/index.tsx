import { useRouter } from 'expo-router';
import EventsList from '@/components/Events/EventsList';

export default function EventsScreen() {
  const router = useRouter();

  return (
    <EventsList
      title="Events"
      onSelectEvent={(path) => router.push(path as any)}
    />
  );
}
