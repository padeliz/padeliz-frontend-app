import { View, Text, TextInput, StyleSheet } from 'react-native';
import OptionCard from './OptionCard';
import DropdownSelect from './DropdownSelect';
import { PadelIcon, TennisIcon, BadmintonIcon, SquashIcon, PingPongIcon } from './SportIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EligibilityFormState, FormAction } from '@/app/event/eligibility-check';

type Props = {
  state: EligibilityFormState;
  dispatch: React.Dispatch<FormAction>;
};

const SPORT_OPTIONS = [
  { id: 'padel', label: 'Padel', icon: <PadelIcon size={20} color={Colors.WHITE} /> },
  { id: 'tennis', label: 'Tennis', icon: <TennisIcon size={20} color={Colors.WHITE} /> },
  { id: 'badminton', label: 'Badminton', icon: <BadmintonIcon size={20} color={Colors.WHITE} /> },
  { id: 'squash', label: 'Squash', icon: <SquashIcon size={20} color={Colors.WHITE} /> },
  { id: 'ping-pong', label: 'Ping-Pong', icon: <PingPongIcon size={20} color={Colors.WHITE} /> },
];

const EXPERIENCE_OPTIONS = [
  { label: 'Amateur Only', value: 'amateur' },
  { label: 'I got lessons as well', value: 'with_lessons' },
];

export default function StepSports({ state, dispatch }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>How many times in your life have you played the following?</Text>
      <Text style={styles.subtitle}>Mention as precisely as possible</Text>

      <View style={styles.options}>
        {SPORT_OPTIONS.map((sport) => {
          const isSelected = state.selectedSports.includes(sport.id);
          const experience = state.sportsExperience[sport.id];

          return (
            <View key={sport.id}>
              <OptionCard
                label={sport.label}
                checked={isSelected}
                onToggle={() => dispatch({ type: 'TOGGLE_SPORT', sport: sport.id })}
                icon={sport.icon}
              />

              {isSelected && (
                <View style={styles.experienceSection}>
                  <Text style={styles.experienceLabel}>
                    How much {sport.label.toLowerCase()} you played?
                  </Text>
                  <View style={styles.experienceRow}>
                    <View style={styles.dropdownWrap}>
                      <DropdownSelect
                        placeholder="choose experience"
                        options={EXPERIENCE_OPTIONS}
                        selectedValue={experience?.level || ''}
                        onSelect={(value) =>
                          dispatch({
                            type: 'SET_SPORT_EXPERIENCE',
                            sport: sport.id,
                            experience: { level: value },
                          })
                        }
                      />
                    </View>
                    <View style={styles.amountWrap}>
                      <View style={styles.amountInput}>
                        <TextInput
                          style={styles.amountText}
                          value={experience?.amount || ''}
                          onChangeText={(text) =>
                            dispatch({
                              type: 'SET_SPORT_EXPERIENCE',
                              sport: sport.id,
                              experience: { amount: text },
                            })
                          }
                          placeholder="nr of..."
                          placeholderTextColor={Colors.CREAM}
                          keyboardType="numeric"
                        />
                      </View>
                      <Text style={styles.unitLabel}>
                        {experience?.unit || 'times'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
  },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    lineHeight: 26,
    color: Colors.WHITE,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM,
    marginTop: 12,
  },
  options: {
    marginTop: 24,
    gap: 12,
  },
  experienceSection: {
    paddingLeft: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  experienceLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
    marginBottom: 8,
  },
  experienceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dropdownWrap: {
    flex: 1,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountInput: {
    width: 85,
    height: 38,
    backgroundColor: Colors.GRAY,
    borderRadius: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  amountText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
    padding: 0,
  },
  unitLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
});
