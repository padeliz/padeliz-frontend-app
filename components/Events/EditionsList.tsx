import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import FilterBar from "@/components/Navigation/FilterBar";
import EventCard from "@/components/Events/EventCard";
import StatusBanner from "@/components/Feedback/StatusBanner";
import { editionToCard } from "@/services/mappers";
import { rangeForTab } from "@/services/dateRange";
import {
  useEditionsPager,
  useEditionCount,
  type EditionsFetcher,
} from "@/services/hooks/useEditions";
import type { EventStatus, EventTiming } from "@/types/types";

const TIMING_FILTERS: EventTiming[] = ["upcoming", "ongoing", "past"];

type Props = {
  title: string;
  /** fetchEditions (public) or fetchMyEditions (authed). */
  fetcher: EditionsFetcher;
  onSelectEvent: (id: string) => void;
  /** Optional per-event status override (e.g. My Events overlays eligibility status). */
  statusFor?: (id: string, fallback: EventStatus) => EventStatus;
};

export default function EditionsList({
  title,
  fetcher,
  onSelectEvent,
  statusFor,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState(0);
  const timing = TIMING_FILTERS[selectedFilter];

  // Each tab fetches exactly its slice from the server (no client-side bucketing).
  const range = useMemo(() => rangeForTab(timing), [timing]);
  const {
    editions,
    isInitialLoading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useEditionsPager(fetcher, range);

  const ongoingRange = useMemo(() => rangeForTab("ongoing"), []);
  const ongoingCount = useEditionCount(fetcher, ongoingRange);

  const filterOptions = useMemo(
    () => [
      { label: "Upcoming" },
      { label: "Ongoing", count: ongoingCount || undefined },
      { label: "Past" },
    ],
    [ongoingCount]
  );

  const cards = editions.map((e) =>
    editionToCard(e, statusFor ? statusFor(String(e.id_edition), "none") : "none")
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <FilterBar
        options={filterOptions}
        selectedIndex={selectedFilter}
        onSelect={setSelectedFilter}
      />

      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : error && editions.length === 0 ? (
        <View style={styles.centered}>
          <StatusBanner variant="error" message={error.message} />
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cards.length === 0 ? (
            <Text style={styles.emptyText}>No {timing} events.</Text>
          ) : (
            cards.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => onSelectEvent(event.id)}
              />
            ))
          )}

          {hasMore && (
            <Pressable
              style={styles.loadMoreButton}
              onPress={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={Colors.BLUE} size="small" />
              ) : (
                <Text style={styles.loadMoreLabel}>Load more</Text>
              )}
            </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  emptyText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM_60,
    textAlign: "center",
    marginTop: 48,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.GRAY,
  },
  retryLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  loadMoreButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.GRAY,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.BLUE,
  },
});
