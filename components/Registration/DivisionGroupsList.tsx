import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import DivisionColorBadge from '@/components/Events/DivisionColorBadge';
import { DivisionDetails } from '@/types/types';

export type DivisionCardState = 'available' | 'selected' | 'reserved' | 'paid';

type Props = {
  divisions: DivisionDetails[];
  /** Selected `id_event_division` values (draft multi-select). */
  selectedDivisionIds?: number[];
  /** Per-division registration presentation state. */
  divisionStates?: Record<number, DivisionCardState>;
  onToggle?: (division: DivisionDetails) => void;
  /** When true, catalog is visible but no edits (awaiting proof). */
  editLocked?: boolean;
  /**
   * Presentational catalog: no actions and no level-fit/capacity dimming.
   * Distinct from `editLocked`, which keeps the registration-flow styling.
   */
  readonly?: boolean;
};

type DivisionGroup = {
  key: string;
  header: string;
  divisions: DivisionDetails[];
};

function playingGroupKey(d: DivisionDetails): string {
  const start = d.playingStart ?? '';
  const end = d.playingEnd ?? '';
  return `${start}|${end}`;
}

function playingGroupHeader(d: DivisionDetails): string {
  const start = d.playingStart;
  const end = d.playingEnd;
  if (start && end) return `Playing ${start} - ${end}`;
  if (start) return `Playing from ${start}`;
  if (end) return `Playing until ${end}`;
  return 'Playing time TBA';
}

export function groupDivisions(divisions: DivisionDetails[]): DivisionGroup[] {
  const order: string[] = [];
  const map = new Map<string, DivisionGroup>();

  const sorted = [...divisions].sort((a, b) => {
    const as = a.playingStart ?? '';
    const bs = b.playingStart ?? '';
    if (as !== bs) return as.localeCompare(bs);
    const ae = a.playingEnd ?? '';
    const be = b.playingEnd ?? '';
    return ae.localeCompare(be);
  });

  for (const d of sorted) {
    const key = playingGroupKey(d);
    let group = map.get(key);
    if (!group) {
      group = { key, header: playingGroupHeader(d), divisions: [] };
      map.set(key, group);
      order.push(key);
    }
    group.divisions.push(d);
  }

  return order.map((k) => map.get(k)!);
}

export default function DivisionGroupsList({
  divisions,
  selectedDivisionIds = [],
  divisionStates = {},
  onToggle,
  editLocked = false,
  readonly = false,
}: Props) {
  const groups = groupDivisions(divisions);

  return (
    <View style={styles.container}>
      {divisions.length === 0 && (
        <Text style={styles.emptyText}>No divisions are open for this event yet.</Text>
      )}

      {groups.map((group) => (
        <View key={group.key} style={styles.group} testID={`division-group-${group.key}`}>
          <Text style={styles.groupHeader}>{group.header}</Text>
          {group.divisions.map((division) => {
            const state = divisionStates[division.id] ?? 'available';
            const isSelected =
              state === 'selected' || selectedDivisionIds.includes(division.id);
            const isReserved = state === 'reserved';
            const isPaid = state === 'paid';
            const isEligible = division.isEligible && division.isActive;
            const isFull = division.num_spots === 0;
            const canToggle =
              !readonly &&
              !editLocked &&
              !isPaid &&
              ((isEligible && !isFull) || isReserved || isSelected);
            const dimmed =
              !readonly &&
              (!isEligible || isFull) &&
              !isReserved &&
              !isPaid;
            const priceActive = readonly || (isEligible && !isFull);

            return (
              <View
                key={division.id}
                testID={`division-${division.id}`}
                style={[
                  styles.divisionCard,
                  (isSelected || isReserved) && styles.divisionCardSelected,
                  isPaid && styles.divisionCardPaid,
                  dimmed && styles.divisionCardDisabled,
                ]}
              >
                <View style={styles.divisionBody}>
                  <View style={styles.divisionTextCol}>
                    <DivisionColorBadge
                      name={division.name}
                      color={division.color}
                      testID={`division-badge-${division.id}`}
                    />
                    <Text
                      style={[
                        styles.divisionPrice,
                        priceActive ? styles.priceEligible : styles.textDisabled,
                      ]}
                    >
                      RON {division.price}/player
                    </Text>
                  </View>

                  {readonly || editLocked ? null : isPaid ? (
                    <View
                      style={styles.actionButtonDisabled}
                      testID={`division-paid-${division.id}`}
                    >
                      <Text style={styles.actionButtonDisabledText}>Paid</Text>
                    </View>
                  ) : canToggle ? (
                    <Pressable
                      style={[
                        styles.actionButton,
                        isSelected || isReserved
                          ? styles.actionButtonSelected
                          : styles.actionButtonEligible,
                      ]}
                      onPress={() => onToggle?.(division)}
                      testID={`division-toggle-${division.id}`}
                    >
                      <Text style={styles.actionButtonText}>
                        {isReserved ? 'Remove' : isSelected ? 'Selected' : 'Select'}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={styles.actionButtonDisabled}>
                      <Text style={styles.actionButtonDisabledText}>
                        {isFull ? 'Select' : 'Not Eligible'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  group: {
    gap: 12,
  },
  groupHeader: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    lineHeight: 16,
    color: Colors.CREAM_60,
  },
  divisionCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  divisionCardSelected: {
    borderColor: Colors.BLUE,
  },
  divisionCardPaid: {
    borderColor: Colors.BADGE_GREEN,
  },
  divisionCardDisabled: {
    opacity: 0.6,
  },
  divisionBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  divisionTextCol: {
    flex: 1,
    gap: 6,
  },
  divisionName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  divisionPrice: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
  },
  priceEligible: {
    color: Colors.WHITE,
  },
  textDisabled: {
    color: Colors.INACTIVE,
  },
  actionButton: {
    minWidth: 88,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionButtonEligible: {
    backgroundColor: Colors.BLUE,
  },
  actionButtonSelected: {
    backgroundColor: Colors.BLUE,
    opacity: 0.85,
  },
  actionButtonText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
  actionButtonDisabled: {
    minWidth: 88,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: Colors.WHITE_05,
  },
  actionButtonDisabledText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_XS,
    color: Colors.INACTIVE,
  },
});
