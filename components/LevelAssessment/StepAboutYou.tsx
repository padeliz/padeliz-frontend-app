import { View, Text, StyleSheet } from 'react-native';
import FormField from './FormField';
import OptionCard from './OptionCard';
import DropdownSelect from './DropdownSelect';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import {
  yearOfBirthOptions,
  type AssessmentFormState,
  type FormAction,
  type TextFieldKey,
} from '@/services/levelAssessmentForm';
import { useLevels } from '@/services/hooks/useLevels';
import type { Level } from '@/types/api';

type Props = {
  state: AssessmentFormState;
  dispatch: React.Dispatch<FormAction>;
  dirtyKeys?: ReadonlySet<string>;
  disabled?: boolean;
};

/** Seeded custom-field help_text (Details shows these under labels; no placeholders). */
const HELP = {
  bigTournamentDivision: 'If you played major tournaments, which division fit you?',
  yearOfBirth: 'Four-digit year you were born.',
  playtomicId: 'Paste your Playtomic profile URL.',
  rankedinId: 'Paste your Rankedin profile URL.',
  gender: 'Select your gender.',
  instagramUsername: 'Username without @.',
  facebookUsername: 'Username or profile name.',
} as const;

function resolveSelectedLevelId(raw: string, levels: Level[]): string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  if (/^\d+$/.test(trimmed)) return trimmed;
  const byName = levels.find((l) => l.name === trimmed);
  return byName ? String(byName.id_level) : '';
}

/**
 * Assessment details. Names and phone are Account-only and never asked here.
 * Playtomic / RankedIn: send profile URLs; after save the stored ID is shown.
 */
export default function StepAboutYou({ state, dispatch, dirtyKeys, disabled }: Props) {
  const set = (field: TextFieldKey) => (value: string) =>
    dispatch({ type: 'SET_FIELD', field, value });
  const dirty = (key: string) => dirtyKeys?.has(key) ?? false;
  const yobOptions = yearOfBirthOptions();
  const levelsQuery = useLevels(!disabled);
  const levels = levelsQuery.data ?? [];
  const levelOptions = levels.map((l) => ({
    label: l.name,
    value: String(l.id_level),
  }));
  const selectedLevelId = resolveSelectedLevelId(state.bigTournamentDivision, levels);

  return (
    <View style={styles.container} testID="step-about-you">
      <View style={styles.fields}>
        <View style={styles.block} testID="field-big-tournament-division-wrap">
          <Text style={styles.groupLabel}>Big tournament division</Text>
          <Text style={styles.help}>{HELP.bigTournamentDivision}</Text>
          <DropdownSelect
            testID="field-big-tournament-division"
            placeholder="Select division"
            options={levelOptions}
            selectedValue={selectedLevelId}
            onSelect={set('bigTournamentDivision')}
            dirty={dirty('bigTournamentDivision')}
            disabled={disabled || levelsQuery.loading}
          />
        </View>

        <View style={styles.block} testID="field-year-of-birth-wrap">
          <Text style={styles.groupLabel}>Year of birth</Text>
          <Text style={styles.help}>{HELP.yearOfBirth}</Text>
          <DropdownSelect
            testID="field-year-of-birth"
            placeholder="Select year"
            options={yobOptions}
            selectedValue={state.yearOfBirth}
            onSelect={set('yearOfBirth')}
            dirty={dirty('yearOfBirth')}
            disabled={disabled}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.groupLabel}>Gender</Text>
          <Text style={styles.help}>{HELP.gender}</Text>
          <View style={styles.genderRow} testID="field-gender">
            <View style={styles.genderOption}>
              <OptionCard
                label="Female"
                checked={state.gender === 'female'}
                dirty={dirty('gender')}
                onToggle={() => {
                  if (disabled) return;
                  dispatch({
                    type: 'SET_GENDER',
                    value: state.gender === 'female' ? '' : 'female',
                  });
                }}
              />
            </View>
            <View style={styles.genderOption}>
              <OptionCard
                label="Male"
                checked={state.gender === 'male'}
                dirty={dirty('gender')}
                onToggle={() => {
                  if (disabled) return;
                  dispatch({
                    type: 'SET_GENDER',
                    value: state.gender === 'male' ? '' : 'male',
                  });
                }}
              />
            </View>
          </View>
        </View>

        <FormField
          testID="field-playtomic-id"
          label="Playtomic"
          helpText={HELP.playtomicId}
          value={state.playtomicId}
          onChangeText={set('playtomicId')}
          autoCapitalize="none"
          dirty={dirty('playtomicId')}
          disabled={disabled}
        />
        <FormField
          testID="field-rankedin-id"
          label="Rankedin"
          helpText={HELP.rankedinId}
          value={state.rankedinId}
          onChangeText={set('rankedinId')}
          autoCapitalize="none"
          dirty={dirty('rankedinId')}
          disabled={disabled}
        />
        <FormField
          testID="field-instagram-username"
          label="Instagram"
          helpText={HELP.instagramUsername}
          value={state.instagramUsername}
          onChangeText={set('instagramUsername')}
          autoCapitalize="none"
          dirty={dirty('instagramUsername')}
          disabled={disabled}
        />
        <FormField
          testID="field-facebook-username"
          label="Facebook"
          helpText={HELP.facebookUsername}
          value={state.facebookUsername}
          onChangeText={set('facebookUsername')}
          autoCapitalize="none"
          dirty={dirty('facebookUsername')}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
  },
  fields: {
    marginTop: 4,
    gap: 16,
  },
  block: {
    gap: 6,
  },
  groupLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  help: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    lineHeight: 16,
    color: Colors.CREAM_60,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
  },
});
