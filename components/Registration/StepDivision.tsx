import { View, Text, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { DivisionDetails, EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';
import DivisionGroupsList, { type DivisionCardState } from './DivisionGroupsList';

export type { DivisionCardState };

type Props = {
  event: EventDetails;
  divisions: DivisionDetails[];
  /** Selected `id_event_division` values (draft multi-select). */
  selectedDivisionIds: number[];
  /** Per-division registration presentation state. */
  divisionStates: Record<number, DivisionCardState>;
  onToggle: (division: DivisionDetails) => void;
  /** When true, catalog is visible but no edits (awaiting proof). */
  editLocked?: boolean;
  lockMessage?: string;
};

const DEFAULT_LOCK_MESSAGE =
  'Divisions can’t be edited while payment proof is under review. Use Cancel proof on the Payment step first.';

export default function StepDivision({
  event,
  divisions,
  selectedDivisionIds,
  divisionStates,
  onToggle,
  editLocked = false,
  lockMessage,
}: Props) {
  const bannerCopy = lockMessage ?? DEFAULT_LOCK_MESSAGE;

  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      <Text style={styles.heading}>Choose Division</Text>
      {!editLocked ? (
        <Text style={styles.hint}>
          Select one or more divisions to reserve, then continue.
        </Text>
      ) : (
        <Text style={styles.lockBanner} testID="division-edit-locked">
          {bannerCopy}
        </Text>
      )}

      <DivisionGroupsList
        divisions={divisions}
        selectedDivisionIds={selectedDivisionIds}
        divisionStates={divisionStates}
        onToggle={onToggle}
        editLocked={editLocked}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginTop: 4,
  },
  hint: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 20,
    color: Colors.CREAM_60,
    marginTop: -8,
  },
  lockBanner: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 20,
    color: Colors.ORANGE,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    padding: 12,
    marginTop: -8,
  },
});
