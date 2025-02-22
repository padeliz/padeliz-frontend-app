import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Event } from '@/types/api/events';
import { EventCard } from './EventCard';
import { spacing } from '@/theme/spacing';

interface EventListProps {
  events: Event[];
  loading?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ReactNode;
}

export function EventList({ events, loading, onRefresh, ListEmptyComponent }: EventListProps) {
  return (
    <FlatList
      data={events}
      renderItem={({ item }) => <EventCard event={item} style={styles.card} />}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={loading || false} onRefresh={onRefresh} />
        ) : undefined
      }
      ListEmptyComponent={ListEmptyComponent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  separator: {
    height: spacing.md,
  },
});
