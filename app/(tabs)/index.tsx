import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import FilterBar from '@/components/Navigation/FilterBar';
import EventCard from '@/components/Events/EventCard';
import {
  useEligibilityStatus,
  useEligibilityLatest,
} from '@/services/hooks/useEligibility';
import { primeEditionCache } from '@/services/editions';
import { classifyTiming } from '@/services/dateRange';
import { editionToCard } from '@/services/mappers';
import type { Edition } from '@/types/api';
import type { EventTiming } from '@/types/types';

const TIMING_FILTERS: EventTiming[] = ['upcoming', 'ongoing', 'past'];

// "My Events" lists the events the player applied for via an eligibility check
// (the pending eligibility's edition_ids), split into Upcoming / Ongoing / Past.
export default function MyEventsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState(0);

  const { data: status, loading: statusLoading, refetch: refetchStatus } =
    useEligibilityStatus();
  const isPending = status?.latest === 'pending';
  const { data: latest, loading: latestLoading, refetch: refetchLatest } =
    useEligibilityLatest(isPending);

  // Editions are embedded in the eligibility response (no by-id lookup needed).
  const editions = useMemo<Edition[]>(
    () => (isPending ? latest?.editions ?? [] : []),
    [isPending, latest]
  );

  // Seed the cache so tapping a card opens Event Details instantly.
  useEffect(() => {
    if (editions.length) primeEditionCache(editions);
  }, [editions]);

  // Refresh on focus so a newly-submitted eligibility shows up here.
  useFocusEffect(
    useCallback(() => {
      refetchStatus();
      if (isPending) refetchLatest();
    }, [refetchStatus, refetchLatest, isPending])
  );

  const buckets = useMemo(() => {
    const result: Record<EventTiming, Edition[]> = {
      upcoming: [],
      ongoing: [],
      past: [],
    };
    for (const e of editions) result[classifyTiming(e.date)].push(e);
    return result;
  }, [editions]);

  const filterOptions = useMemo(
    () => [
      { label: 'Upcoming' },
      { label: 'Ongoing', count: buckets.ongoing.length || undefined },
      { label: 'Past' },
    ],
    [buckets.ongoing.length]
  );

  const loading = statusLoading || (isPending && latestLoading);
  const total = editions.length;
  const timing = TIMING_FILTERS[selectedFilter];
  const cards = buckets[timing].map((e) =>
    editionToCard(e, 'eligibility_pending')
  );

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cards.length === 0 ? (
            <Text style={styles.emptyText}>
              {total === 0
                ? 'No events yet. Apply for an event’s eligibility check and it’ll appear here while under review.'
                : `No ${timing} events.`}
            </Text>
          ) : (
            cards.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          )}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM_60,
    textAlign: 'center',
    marginTop: 48,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
