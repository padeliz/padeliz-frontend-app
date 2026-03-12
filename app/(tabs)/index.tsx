import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import FilterBar from '@/components/Navigation/FilterBar';
import EventCard from '@/components/Events/EventCard';
import { EventCardData, EventTiming } from '@/types/types';
import { useEvents } from '@/context/events';

const MOCK_EVENTS: EventCardData[] = [
  // Upcoming — mix of registered and pending_payment
  {
    id: '1',
    title: 'ARSH Padel MiniTour #21',
    location: 'Padel One',
    date: '27 April 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'pending_payment',
    timing: 'upcoming',
  },
  {
    id: '2',
    title: 'ARSH Padel MiniTour #20',
    location: 'Magic Padel',
    date: '05 April 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'registered',
    timing: 'upcoming',
  },
  {
    id: '3',
    title: 'Summer Padel Championship',
    location: 'Club Deportivo',
    date: '10 May 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'registered',
    timing: 'upcoming',
  },
  {
    id: '4',
    title: 'Weekend Padel League',
    location: 'Padel Arena',
    date: '20 April 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'pending_payment',
    timing: 'upcoming',
  },
  // Ongoing — exactly 1 event, registered
  {
    id: '5',
    title: 'Spring Padel Open',
    location: 'Club Deportivo',
    date: '10 - 22 March 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'registered',
    timing: 'ongoing',
  },
  // Past — 3 events, all registered
  {
    id: '6',
    title: 'Winter Padel Cup',
    location: 'Padel One',
    date: '10 January 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'registered',
    timing: 'past',
  },
  {
    id: '7',
    title: 'ARSH Padel MiniTour #19',
    location: 'Magic Padel',
    date: '15 December 2024',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'registered',
    timing: 'past',
  },
  {
    id: '8',
    title: 'Holiday Padel Classic',
    location: 'Club Deportivo',
    date: '01 December 2024',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'registered',
    timing: 'past',
  },
];

const TIMING_FILTERS: EventTiming[] = ['upcoming', 'ongoing', 'past'];

export default function MyEventsScreen() {
  const router = useRouter();
  const { getEventStatus } = useEvents();
  const [selectedFilter, setSelectedFilter] = useState(0);

  const filterOptions = useMemo(() => {
    const ongoingCount = MOCK_EVENTS.filter((e) => e.timing === 'ongoing').length;
    return [
      { label: 'Upcoming' },
      { label: 'Ongoing', count: ongoingCount },
      { label: 'Past' },
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    const timing = TIMING_FILTERS[selectedFilter];
    return MOCK_EVENTS.filter((e) => e.timing === timing);
  }, [selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>
      <FilterBar
        options={filterOptions}
        selectedIndex={selectedFilter}
        onSelect={setSelectedFilter}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={{ ...event, status: getEventStatus(event.id, event.status) }} onPress={() => router.push(`/event/${event.id}`)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.SCREEN_TITLE,
    color: Colors.WHITE,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
});
