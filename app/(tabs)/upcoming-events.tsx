import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { useEvents } from '@/hooks/api/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { spacing } from '@/theme/spacing';

export default function EventsScreen() {
  const { loading: loadingUpcoming, events: upcomingEvents = [] } = useEvents('upcoming');
  const { loading: loadingOngoing, events: ongoingEvents = [] } = useEvents('ongoing');
  const { loading: loadingCompleted, events: completedEvents = [] } = useEvents('completed');

  if (loadingUpcoming || loadingOngoing || loadingCompleted) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.sectionTitle}>Upcoming Events</Text>
      {upcomingEvents.map(event => (
        <EventCard key={event.id} event={event} style={styles.card} />
      ))}

      <Divider style={styles.divider} />

      <Text variant="titleLarge" style={styles.sectionTitle}>Ongoing Events</Text>
      {ongoingEvents.map(event => (
        <EventCard key={event.id} event={event} style={styles.card} />
      ))}

      <Divider style={styles.divider} />

      <Text variant="titleLarge" style={styles.sectionTitle}>Previous Events</Text>
      {completedEvents.map(event => (
        <EventCard key={event.id} event={event} style={styles.card} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.xl,
  },
});
