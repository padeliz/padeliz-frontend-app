import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { DivisionDetails, EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';

type Props = {
  event: EventDetails;
  divisions: DivisionDetails[];
  selectedDivision: string | null;
  onSelect: (name: string, price: number) => void;
};

export default function StepDivision({ event, divisions, selectedDivision, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      <Text style={styles.heading}>Choose Division</Text>

      {divisions.map((division) => {
        const isSelected = selectedDivision === division.name;
        const isEligible = division.isEligible && division.isActive;
        const isFull = division.num_spots === 0;
        const isDisabled = !isEligible || isFull;

        return (
          <View
            key={division.name}
            style={[
              styles.divisionCard,
              isSelected && styles.divisionCardSelected,
              isDisabled && styles.divisionCardDisabled,
            ]}
          >
            <View style={styles.divisionHeader}>
              <Text style={[styles.divisionName, isDisabled && styles.textDisabled]}>
                {division.name}
              </Text>
              <Text style={[styles.divisionPrice, isEligible && !isFull ? styles.priceEligible : styles.textDisabled]}>
                RON {division.price}/player
              </Text>
            </View>

            <Text style={[styles.divisionDescription, isDisabled && styles.textDisabled]}>
              {division.description}
            </Text>

            <View style={styles.divisionFooter}>
              <Text style={styles.spotsText}>
                {isFull ? 'Full' : `${division.num_spots} spots left`}
              </Text>

              {isEligible && !isFull ? (
                <Pressable
                  style={[styles.actionButton, isSelected ? styles.actionButtonSelected : styles.actionButtonEligible]}
                  onPress={() => onSelect(division.name, division.price)}
                >
                  <Text style={styles.actionButtonText}>
                    {isSelected ? 'Selected' : 'Register'}
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
  divisionCardDisabled: {
    opacity: 0.6,
  },
  divisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divisionName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
  divisionPrice: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM,
  },
  priceEligible: {
    color: Colors.BLUE,
  },
  textDisabled: {
    color: Colors.CREAM,
  },
  divisionDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM,
    marginTop: 8,
  },
  divisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  spotsText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM_60,
  },
  actionButton: {
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonEligible: {
    backgroundColor: Colors.BLUE,
  },
  actionButtonSelected: {
    backgroundColor: Colors.BLUE,
  },
  actionButtonText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  actionButtonDisabled: {
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.CREAM_20,
  },
  actionButtonDisabledText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
});
