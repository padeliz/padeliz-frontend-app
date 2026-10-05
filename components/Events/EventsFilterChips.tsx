import { Text, ScrollView, StyleSheet, Pressable } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { EVENTS_CHIP_SCROLL_STYLE } from "@/services/eventsListLayout";
import {
  anyChipFilterActive,
  membershipChipLabel,
  type TabFilterState,
} from "@/services/eventsFilters";
import type { EventTiming } from "@/types/types";

export type EventsFilterChipsProps = {
  timing: EventTiming;
  filters: TabFilterState;
  unpaidCount: number;
  clubCount: number;
  hasLottery: boolean;
  total: number;
  onMembershipToggle: () => void;
  onToggleUnpaid: () => void;
  onOpenClubs: () => void;
  onToggleLottery: () => void;
};

export function FilterChip({
  label,
  active,
  onPress,
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function EventsFilterChips({
  timing,
  filters,
  unpaidCount,
  clubCount,
  hasLottery,
  total,
  onMembershipToggle,
  onToggleUnpaid,
  onOpenClubs,
  onToggleLottery,
}: EventsFilterChipsProps) {
  const showEventsCount = anyChipFilterActive(filters);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={EVENTS_CHIP_SCROLL_STYLE}
      contentContainerStyle={styles.chipRow}
      testID="events-filter-chips"
    >
      <FilterChip
        label={membershipChipLabel(timing)}
        active={filters.membership}
        onPress={onMembershipToggle}
        testID="chip-membership"
      />
      {unpaidCount > 0 ? (
        <FilterChip
          label={`Unpaid Registrations (${unpaidCount})`}
          active={filters.unpaid}
          onPress={onToggleUnpaid}
          testID="chip-unpaid"
        />
      ) : null}
      {clubCount > 0 ? (
        <FilterChip
          label={
            filters.clubIds.length > 0
              ? `Clubs (${filters.clubIds.length})`
              : "Clubs"
          }
          active={filters.clubIds.length > 0}
          onPress={onOpenClubs}
          testID="chip-clubs"
        />
      ) : null}
      {hasLottery ? (
        <FilterChip
          label="I was lottery winner"
          active={filters.lottery}
          onPress={onToggleLottery}
          testID="chip-lottery"
        />
      ) : null}
      {showEventsCount ? (
        <Text style={styles.eventsCount} testID="events-count-label">
          {total} {total === 1 ? "event" : "events"}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: Colors.GRAY,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    borderColor: Colors.BLUE,
    backgroundColor: Colors.BLUE_T,
  },
  chipLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  chipLabelActive: {
    color: Colors.WHITE,
  },
  eventsCount: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginLeft: 4,
  },
});
