import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@/context/auth/AuthContext';
import { useEvents } from '@/hooks/api/useEvents';
import { EventCard } from '@/components/events/EventCard';
import { spacing } from '@/theme/spacing';

export default function MyEventsScreen() {
  const { isAuthenticated, googleAuth } = useAuth();
  const { loading, events = [] } = useEvents('user');

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.message}>
          Sign in to see your events
        </Text>
        <Button
          mode="contained"
          onPress={googleAuth.signIn}
          style={styles.button}
        >
          Sign in with Google
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>My Events</Text>
      {events.length > 0 ? (
        events.map(event => (
          <EventCard key={event.id} event={event} style={styles.card} />
        ))
      ) : (
        <Text style={styles.message}>You haven't registered for any events yet</Text>
      )}
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
  title: {
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});
