import * as Calendar from 'expo-calendar';
import { Event } from '@/types/api/events';
import { Platform } from 'react-native';

async function getDefaultCalendarId() {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Calendar permission not granted');
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find(
    calendar =>
      calendar.isPrimary &&
      calendar.allowsModifications &&
      (Platform.OS === 'ios' ? calendar.type === Calendar.CalendarType.LOCAL : calendar.accessLevel === Calendar.CalendarAccessLevel.OWNER)
  );

  if (!defaultCalendar) {
    throw new Error('No writable calendar found');
  }

  return defaultCalendar.id;
}

export async function addEventToCalendar(event: Event) {
  try {
    const calendarId = await getDefaultCalendarId();
    const startDate = new Date(`${event.date}T${event.hoursInterval.start}`);
    const endDate = new Date(`${event.date}T${event.hoursInterval.end}`);

    await Calendar.createEventAsync(calendarId, {
      title: event.title,
      startDate,
      endDate,
      location: `${event.location.name}, ${event.location.address}`,
      notes: event.description,
      alarms: [{ relativeOffset: -60 }], // Reminder 1 hour before
    });
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    throw error;
  }
}
