import { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import FilterBar from '@/components/Navigation/FilterBar';
import EventCard from '@/components/Events/EventCard';
import { EventCardData, EventTiming } from '@/types/types';

const ALL_EVENTS: EventCardData[] = [
  // Upcoming
  {
    id: 'a1',
    title: 'ARSH Padel MiniTour #22',
    location: 'Padel One',
    date: '18 May 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'registered',
    timing: 'upcoming',
  },
  {
    id: 'a2',
    title: 'Summer Padel Championship',
    location: 'Magic Padel',
    date: '01 June 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'none',
    timing: 'upcoming',
  },
  {
    id: 'a3',
    title: 'ARSH Padel MiniTour #21',
    location: 'Padel One',
    date: '27 April 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'pending_payment',
    timing: 'upcoming',
  },
  {
    id: 'a4',
    title: 'Weekend Padel League',
    location: 'Padel Arena',
    date: '20 April 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'none',
    timing: 'upcoming',
  },
  // Ongoing
  {
    id: 'a5',
    title: 'Spring Padel Open',
    location: 'Club Deportivo',
    date: '10 - 22 March 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'registered',
    timing: 'ongoing',
  },
  {
    id: 'a6',
    title: 'City Padel Series',
    location: 'Padel Arena',
    date: '01 - 15 March 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'none',
    timing: 'ongoing',
  },
  {
    id: 'a7',
    title: 'Corporate Padel Cup',
    location: 'Magic Padel',
    date: '05 - 20 March 2025',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'none',
    timing: 'ongoing',
  },
  // Past
  {
    id: 'a8',
    title: 'Winter Padel Cup',
    location: 'Padel One',
    date: '10 January 2025',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'registered',
    timing: 'past',
  },
  {
    id: 'a9',
    title: 'ARSH Padel MiniTour #19',
    location: 'Magic Padel',
    date: '15 December 2024',
    coverImage: require('@/assets/images/events/minitour-21.png'),
    status: 'none',
    timing: 'past',
  },
  {
    id: 'a10',
    title: 'Holiday Padel Classic',
    location: 'Club Deportivo',
    date: '01 December 2024',
    coverImage: require('@/assets/images/events/minitour-20.png'),
    status: 'none',
    timing: 'past',
  },
];

const TIMING_FILTERS: EventTiming[] = ['upcoming', 'ongoing', 'past'];

export default function AllEventsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState(0);

  const filterOptions = useMemo(() => {
    const ongoingCount = ALL_EVENTS.filter((e) => e.timing === 'ongoing').length;
    return [
      { label: 'Upcoming' },
      { label: 'Ongoing', count: ongoingCount },
      { label: 'Past' },
    ];
  }, []);

  const filteredEvents = useMemo(() => {
    const timing = TIMING_FILTERS[selectedFilter];
    return ALL_EVENTS.filter((e) => e.timing === timing);
  }, [selectedFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Events</Text>
      </View>
      <FilterBar
        options={filterOptions}
        selectedIndex={selectedFilter}
        onSelect={setSelectedFilter}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} onPress={() => router.push(`/event/${event.id}`)} />
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
