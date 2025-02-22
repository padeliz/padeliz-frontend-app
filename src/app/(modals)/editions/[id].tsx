import { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useEventDetails } from '@/hooks/api/useEventDetails';
import { spacing } from '@/theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EventActions } from '@/components/events/EventActions';

export default function EventDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loading, error, event, fetchEventDetails } = useEventDetails(id);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load event details</Text>
        <Button onPress={fetchEventDetails}>Retry</Button>
      </View>
    );
  }

  const handleRegister = () => {
    router.push(`/register/${event.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Cover source={{ uri: event.imageUrl }} style={styles.image} />
        <Card.Content style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            {event.title}
          </Text>

          <View style={styles.section}>
            <InfoRow
              icon="calendar"
              label="Date"
              value={format(new Date(event.date), 'MMMM dd, yyyy')}
            />
            <InfoRow
              icon="clock-outline"
              label="Time"
              value={`${event.hoursInterval.start} - ${event.hoursInterval.end}`}
            />
            <InfoRow
              icon="map-marker"
              label="Location"
              value={`${event.location.name}\n${event.location.address}`}
            />
            <InfoRow
              icon="currency-usd"
              label="Price"
              value={`$${event.price}`}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Description
            </Text>
            <Text variant="bodyMedium">{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Organizer
            </Text>
            <InfoRow
              icon="account"
              label="Name"
              value={event.organizer.name}
            />
            <InfoRow
              icon="email"
              label="Contact"
              value={event.organizer.contact}
            />
          </View>

          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Registration
            </Text>
            <InfoRow
              icon="account-group"
              label="Participants"
              value={`${event.currentParticipants}/${event.maxParticipants}`}
            />
            <InfoRow
              icon="calendar-clock"
              label="Deadline"
              value={format(new Date(event.registrationDeadline), 'MMMM dd, yyyy')}
            />
          </View>
        </Card.Content>
      </Card>

      <EventActions
        event={event}
        onRegister={handleRegister}
        disabled={event.currentParticipants >= event.maxParticipants}
      />
    </ScrollView>
  );
}

interface InfoRowProps {
  readonly icon: keyof typeof MaterialCommunityIcons.glyphMap;
  readonly label: string;
  readonly value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={24} style={styles.icon} />
      <View style={styles.infoContent}>
        <Text variant="bodySmall" style={styles.label}>
          {label}
        </Text>
        <Text variant="bodyMedium">{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 250,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.sm,
    color: '#666',
  },
  infoContent: {
    flex: 1,
  },
  label: {
    color: '#666',
    marginBottom: spacing.xs,
  },
  actions: {
    padding: spacing.md,
  },
  registerButton: {
    marginTop: spacing.md,
  },
});
