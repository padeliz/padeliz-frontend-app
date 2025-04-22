import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Event } from '@/types/api/events';
import { shareEvent } from '@/utils/share';
import { addEventToCalendar } from '@/utils/calendar';
import { useToast } from '@/context/toast/ToastContext';
import { useAuth } from '@/context/auth/AuthContext';
import { spacing } from '@/theme/spacing';
import { useRouter } from 'expo-router';

interface EventActionsProps {
  readonly event: Event;
  readonly disabled?: boolean;
}

function getButtonText(disabled: boolean | undefined, isAuthenticated: boolean): string {
  if (disabled === true) return 'Event Full';
  if (isAuthenticated) return 'Register Now';
  return 'Sign in to Register';
}

export function EventActions({ event, disabled }: EventActionsProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  if (event.status === 'completed') {
    return null;  // Don't show any actions for completed events
  }

  const handleShare = async () => {
    try {
      await shareEvent(event);
    } catch (error) {
      showToast('Failed to share event', 'error');
    }
  };

  const handleAddToCalendar = async () => {
    try {
      await addEventToCalendar(event);
      showToast('Event added to calendar', 'success');
    } catch (error) {
      showToast('Failed to add event to calendar', 'error');
    }
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push(`/register-check/${event.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Button
          mode="outlined"
          onPress={handleShare}
          icon="share-variant"
          style={styles.button}
        >
          Share
        </Button>
        <Button
          mode="outlined"
          onPress={handleAddToCalendar}
          icon="calendar-plus"
          style={styles.button}
        >
          Add to Calendar
        </Button>
      </View>
      <Button
        mode="contained"
        onPress={handleRegister}
        disabled={disabled}
        style={styles.registerButton}
      >
        {getButtonText(disabled, isAuthenticated)}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
});
