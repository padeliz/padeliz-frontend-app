import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  Modal,
} from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import FilterBar from "@/components/Navigation/FilterBar";
import ScreenHeader from "@/components/Navigation/ScreenHeader";
import EventCard from "@/components/Events/EventCard";
import EventsFilterChips from "@/components/Events/EventsFilterChips";
import StatusBanner from "@/components/Feedback/StatusBanner";
import LoginModal from "@/components/Login/LoginModal";
import { useAuth } from "@/context/auth";
import { eventToCard } from "@/services/mappers";
import {
  TIMING_TAB_ORDER,
  defaultTimingIndex,
  rangeForTab,
} from "@/services/dateRange";
import {
  initialFiltersByTab,
  toEventListFilters,
  type TabFilterState,
} from "@/services/eventsFilters";
import { fetchFilterOptions } from "@/services/events";
import {
  useEventCount,
  useEventsPager,
} from "@/services/hooks/useEvents";
import type { EventFilterOptions } from "@/types/api";
import type { EventTiming } from "@/types/types";
import { eventDetailPath } from "@/utils/eventPaths";

type Props = {
  title?: string;
  /** Called with the in-app detail path, e.g. `/event/9` or `/event/9/slug`. */
  onSelectEvent: (path: string) => void;
};

export default function EventsList({
  title = "Events",
  onSelectEvent,
}: Props) {
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const userId = user?.id ?? null;
  const prevUserIdRef = useRef(userId);

  const ongoingRange = useMemo(() => rangeForTab("ongoing"), []);
  const ongoingCount = useEventCount(ongoingRange);
  const ongoingVisible = (ongoingCount ?? 0) > 0;

  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);
  const [filtersByTab, setFiltersByTab] = useState(() =>
    initialFiltersByTab(isAuthed)
  );
  const [loginOpen, setLoginOpen] = useState(false);
  const [clubsOpen, setClubsOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<EventFilterOptions | null>(
    null
  );

  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      setFiltersByTab(initialFiltersByTab(false));
      setClubsOpen(false);
      prevUserIdRef.current = userId;
    }
  }, [userId]);

  // Resolve default tab once we know whether Ongoing is visible.
  useEffect(() => {
    if (selectedFilter != null || ongoingCount === undefined) return;
    setSelectedFilter(defaultTimingIndex(ongoingVisible));
  }, [ongoingCount, ongoingVisible, selectedFilter]);

  const timingTabs = useMemo(() => {
    return TIMING_TAB_ORDER.filter(
      (t) => t !== "ongoing" || ongoingVisible || selectedFilter === TIMING_TAB_ORDER.indexOf("ongoing")
    );
  }, [ongoingVisible, selectedFilter]);

  const activeIndex = selectedFilter ?? defaultTimingIndex(ongoingVisible);
  const timing: EventTiming =
    TIMING_TAB_ORDER[activeIndex] ?? "upcoming";
  // Map FilterBar index (possibly without Ongoing) back to timing.
  const visibleTiming = timingTabs.includes(timing)
    ? timing
    : timingTabs[timingTabs.length - 1] ?? "upcoming";
  const visibleIndex = Math.max(0, timingTabs.indexOf(visibleTiming));

  const filters = filtersByTab[visibleTiming];
  const range = useMemo(() => rangeForTab(visibleTiming), [visibleTiming]);
  const listFilters = useMemo(
    () => toEventListFilters(visibleTiming, filters),
    [visibleTiming, filters]
  );

  const {
    events,
    isInitialLoading,
    loadingMore,
    error,
    hasMore,
    total,
    loadMore,
    refetch,
  } = useEventsPager(range, listFilters);

  useEffect(() => {
    let cancelled = false;
    void fetchFilterOptions(range)
      .then((opts) => {
        if (!cancelled) setFilterOptions(opts);
      })
      .catch(() => {
        if (!cancelled) {
          setFilterOptions({ clubs: [], unpaid_count: 0, has_lottery_winner: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [range.date_from, range.date_to, isAuthed]);

  const updateFilters = useCallback(
    (patch: Partial<TabFilterState>) => {
      setFiltersByTab((prev) => ({
        ...prev,
        [visibleTiming]: { ...prev[visibleTiming], ...patch },
      }));
    },
    [visibleTiming]
  );

  const onMembershipToggle = () => {
    if (!isAuthed) {
      setLoginOpen(true);
      return;
    }
    updateFilters({
      membership: !filters.membership,
      membershipTouched: true,
    });
  };

  const filterBarOptions = timingTabs.map((t) => ({
    label: t === "past" ? "Past" : t === "ongoing" ? "Ongoing" : "Upcoming",
    count:
      t === "ongoing" && (ongoingCount ?? 0) > 0 ? ongoingCount : undefined,
  }));

  const onSelectTiming = (index: number) => {
    const nextTiming = timingTabs[index];
    const fullIndex = TIMING_TAB_ORDER.indexOf(nextTiming);
    setSelectedFilter(fullIndex);
  };

  const clubs = filterOptions?.clubs ?? [];
  const unpaidCount = filterOptions?.unpaid_count ?? 0;
  const hasLottery = Boolean(filterOptions?.has_lottery_winner);
  const cards = events.map((e) => eventToCard(e, "none"));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={title} variant="root" />
      <FilterBar
        options={filterBarOptions}
        selectedIndex={visibleIndex}
        onSelect={onSelectTiming}
      />

      <EventsFilterChips
        timing={visibleTiming}
        filters={filters}
        unpaidCount={unpaidCount}
        clubCount={clubs.length}
        hasLottery={hasLottery}
        total={total}
        onMembershipToggle={onMembershipToggle}
        onToggleUnpaid={() => updateFilters({ unpaid: !filters.unpaid })}
        onOpenClubs={() => setClubsOpen(true)}
        onToggleLottery={() => updateFilters({ lottery: !filters.lottery })}
      />

      {isInitialLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : error && events.length === 0 ? (
        <View style={styles.centered}>
          <StatusBanner variant="error" message={error.message} />
          <Pressable style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          testID="events-list-scroll"
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
        >
          {cards.length === 0 ? (
            <Text style={styles.emptyText}>No {visibleTiming} events.</Text>
          ) : (
            cards.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() =>
                  onSelectEvent(
                    eventDetailPath(Number(event.id), event.slug)
                  )
                }
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

      <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />

      <ClubsSheet
        visible={clubsOpen}
        clubs={clubs}
        selectedIds={filters.clubIds}
        onClose={() => setClubsOpen(false)}
        onChange={(clubIds) => updateFilters({ clubIds })}
      />
    </SafeAreaView>
  );
}

function ClubsSheet({
  visible,
  clubs,
  selectedIds,
  onClose,
  onChange,
}: {
  visible: boolean;
  clubs: Array<{ id_club: number; name: string }>;
  selectedIds: number[];
  onClose: () => void;
  onChange: (ids: number[]) => void;
}) {
  const [draft, setDraft] = useState(selectedIds);

  useEffect(() => {
    if (visible) setDraft(selectedIds);
  }, [visible, selectedIds]);

  const toggle = (id: number) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="clubs-sheet">
          <Text style={styles.sheetTitle}>Clubs</Text>
          <ScrollView style={styles.sheetScroll}>
            {clubs.map((club) => {
              const selected = draft.includes(club.id_club);
              return (
                <Pressable
                  key={club.id_club}
                  testID={`club-option-${club.id_club}`}
                  style={[styles.clubOption, selected && styles.clubOptionSelected]}
                  onPress={() => toggle(club.id_club)}
                >
                  <Text style={styles.clubOptionLabel}>{club.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.sheetActions}>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                onChange([]);
                onClose();
              }}
            >
              <Text style={styles.secondaryLabel}>Clear</Text>
            </Pressable>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                onChange(draft);
                onClose();
              }}
              testID="clubs-apply"
            >
              <Text style={styles.primaryLabel}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  sheetTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  sheetScroll: {
    maxHeight: 320,
  },
  clubOption: {
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.GRAY,
    justifyContent: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  clubOptionSelected: {
    borderColor: Colors.BLUE,
  },
  clubOptionLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.CREAM_10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
