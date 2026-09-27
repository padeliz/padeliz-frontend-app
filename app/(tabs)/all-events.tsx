import { useRouter } from 'expo-router';
import EditionsList from '@/components/Events/EditionsList';
import { fetchEditions } from '@/services/editions';

export default function AllEventsScreen() {
  const router = useRouter();

  return (
    <EditionsList
      title="All Events"
      fetcher={fetchEditions}
      onSelectEvent={(id) => router.push(`/event/${id}`)}
    />
  );
}
