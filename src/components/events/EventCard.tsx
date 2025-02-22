import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Event } from '@/types/api/events';
import { formatDate } from '@/utils/date';
import { spacing } from '@/theme/spacing';

interface EventCardProps {
  event: Event;
  style?: ViewStyle;
}

export function EventCard({ event, style }: EventCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/editions/${event.id}`);  // Allow navigation for all events
  };

  return (
    <Card
      style={[styles.card, style]}
      onPress={handlePress}
    >
      <Card.Content>
        <Text variant="titleLarge">{event.title}</Text>
        <Text variant="bodyMedium" style={styles.description}>
          {event.description}
        </Text>

        <View style={styles.details}>
          <Text variant="bodyMedium">
            {formatDate(event.date)}
          </Text>
          <Text variant="bodyMedium">
            {event.location.name}
          </Text>
        </View>

        <View style={styles.tags}>
          {event.status === 'upcoming' && (
            <Chip style={styles.chip}>
              {event.currentParticipants}/{event.maxParticipants} players
            </Chip>
          )}
          {event.status === 'completed' && (
            <Chip style={styles.chip} icon="check">Completed</Chip>
          )}
          {event.status === 'ongoing' && (
            <Chip style={styles.chip} icon="clock">In Progress</Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
  },
  description: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  details: {
    marginBottom: spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
  },
});
