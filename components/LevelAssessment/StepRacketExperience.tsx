import { View, Text, TextInput, StyleSheet } from 'react-native';
import OptionCard from './OptionCard';
import DropdownSelect from './DropdownSelect';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import {
  RACKET_LEVELS,
  RACKET_MEASURES,
  RACKET_SPORTS,
  type AssessmentFormState,
  type FormAction,
} from '@/services/levelAssessmentForm';

type Props = {
  state: AssessmentFormState;
  dispatch: React.Dispatch<FormAction>;
  /** sport id → validation problem to show under that sport. */
  errors?: Record<string, string>;
  dirtyKeys?: ReadonlySet<string>;
  disabled?: boolean;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Racket sport id → MaterialCommunityIcons glyph (padel/pickleball have no dedicated glyph). */
export const SPORT_ICON_NAMES: Record<(typeof RACKET_SPORTS)[number]['id'], IconName> = {
  padel: 'star',
  tennis: 'tennis',
  badminton: 'badminton',
  squash: 'racquetball',
  'ping-pong': 'table-tennis',
  pickleball: 'baseball',
};

function sportIcon(id: string) {
  const name = (SPORT_ICON_NAMES as Record<string, IconName>)[id];
  return name ? <MaterialCommunityIcons name={name} size={20} color={Colors.WHITE} /> : undefined;
}

/**
 * Racket experience: per sport a level plus at least one number
 * (years playing, matches played, lessons had) — saved as the `racket_experience` json.
 */
export default function StepRacketExperience({
  state,
  dispatch,
  errors = {},
  dirtyKeys,
  disabled,
}: Props) {
  return (
    <View style={styles.container} testID="step-racket-experience">
      <Text style={styles.heading}>What racket sports have you played?</Text>
      <Text style={styles.subtitle}>
        Pick every sport you have tried and tell us how much. You can skip this.
      </Text>

      <View style={styles.options}>
        {RACKET_SPORTS.map((sport) => {
          const selected = state.selectedSports.includes(sport.id);
          const draft = state.racket[sport.id];
          const error = errors[sport.id];
          const racketDirty = dirtyKeys?.has(`racket:${sport.id}`) ?? false;

          return (
            <View key={sport.id}>
              <OptionCard
                label={sport.label}
                checked={selected}
                onToggle={() => {
                  if (disabled) return;
                  dispatch({ type: 'TOGGLE_SPORT', sport: sport.id });
                }}
                icon={sportIcon(sport.id)}
              />

              {selected && (
                <View style={styles.experienceSection} testID={`racket-${sport.id}`}>
                  <Text style={styles.experienceLabel}>
                    How good are you at {sport.label.toLowerCase()}?
                  </Text>
                  <DropdownSelect
                    testID={`racket-${sport.id}-level`}
                    placeholder="choose level"
                    options={RACKET_LEVELS.map((l) => ({ label: l.label, value: l.value }))}
                    selectedValue={draft?.level ?? ''}
                    onSelect={(value) =>
                      dispatch({
                        type: 'SET_RACKET',
                        sport: sport.id,
                        patch: { level: value },
                      })
                    }
                    dirty={racketDirty}
                    disabled={disabled}
                  />

                  <View style={styles.metricsRow}>
                    {RACKET_MEASURES.map((measure) => (
                      <View key={measure.key} style={styles.metric}>
                        <Text style={styles.metricLabel}>{measure.label}</Text>
                        <View
                          style={[
                            styles.metricInput,
                            racketDirty && styles.metricInputDirty,
                          ]}
                        >
                          <TextInput
                            testID={`racket-${sport.id}-${measure.key}`}
                            style={styles.metricText}
                            value={draft?.[measure.key] ?? ''}
                            onChangeText={(text) =>
                              dispatch({
                                type: 'SET_RACKET',
                                sport: sport.id,
                                patch: { [measure.key]: text },
                              })
                            }
                            placeholder="0"
                            placeholderTextColor={Colors.INACTIVE}
                            keyboardType={measure.decimal ? 'decimal-pad' : 'number-pad'}
                            editable={!disabled}
                          />
                        </View>
                      </View>
                    ))}
                  </View>

                  {error ? (
                    <Text style={styles.error} testID={`racket-${sport.id}-error`}>
                      {error}
                    </Text>
                  ) : null}
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
    lineHeight: 18,
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
    gap: 8,
  },
  experienceLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  metricInput: {
    height: 38,
    backgroundColor: Colors.GRAY,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  metricInputDirty: {
    borderColor: Colors.YELLOW,
  },
  metricText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
    padding: 0,
  },
  error: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.RED,
  },
});
