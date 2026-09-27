import { View, Text, StyleSheet } from 'react-native';
import FormField from './FormField';
import OptionCard from './OptionCard';
import PhotoUploadSlot from './PhotoUploadSlot';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EligibilityFormState, FormAction } from '@/app/event/eligibility-check';

type Props = {
  state: EligibilityFormState;
  dispatch: React.Dispatch<FormAction>;
};

export default function StepDetails({ state, dispatch }: Props) {
  return (
    <View style={styles.container}>
      {/* Section title */}
      <Text style={styles.heading}>Tell us more about you</Text>
      <Text style={styles.subtitle}>It's nice having you here</Text>

      {/* Personal details fields */}
      <View style={styles.fields}>
        <FormField
          label="first name"
          value={state.firstName}
          onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'firstName', value: v })}
          placeholder="Enter first name"
        />
        <FormField
          label="middle name"
          value={state.middleName}
          onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'middleName', value: v })}
          placeholder="Enter middle name"
        />
        <FormField
          label="last name"
          value={state.lastName}
          onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'lastName', value: v })}
          placeholder="Enter last name"
        />
        <FormField
          label="phone number"
          value={state.phoneNumber}
          onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'phoneNumber', value: v })}
          placeholder="+40..."
          keyboardType="phone-pad"
        />

        {/* Birth date row */}
        <View style={styles.birthRow}>
          <FormField
            label="birth year"
            value={state.birthYear}
            onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'birthYear', value: v })}
            placeholder="YYYY"
            keyboardType="numeric"
            style={styles.birthField}
          />
          <FormField
            label="birth month"
            value={state.birthMonth}
            onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'birthMonth', value: v })}
            placeholder="Month"
            style={styles.birthField}
          />
          <FormField
            label="birth day"
            value={state.birthDay}
            onChangeText={(v) => dispatch({ type: 'SET_FIELD', field: 'birthDay', value: v })}
            placeholder="DD"
            keyboardType="numeric"
            style={styles.birthField}
          />
        </View>
      </View>

      {/* Student section */}
      <View style={styles.studentSection}>
        <Text style={styles.heading}>Are you still in school?</Text>
        <Text style={styles.subtitle}>Some divisions are for students only</Text>

        <View style={styles.studentCheckbox}>
          <OptionCard
            label="High School / University student"
            checked={state.isStudent}
            onToggle={() => dispatch({ type: 'SET_FIELD', field: 'isStudent', value: !state.isStudent })}
          />
        </View>

        {state.isStudent && (
          <View style={styles.studentProof}>
            <Text style={styles.uploadLabel}>
              Upload front and back photos of the student ID
            </Text>
            <View style={styles.uploadRow}>
              <View style={styles.fileList}>
                {state.studentIdFront && (
                  <View style={styles.fileRow}>
                    <FontAwesome name="file-image-o" size={16} color={Colors.ORANGE} />
                    <Text style={styles.fileName}>student ID front.jpg</Text>
                  </View>
                )}
                {state.studentIdBack && (
                  <View style={styles.fileRow}>
                    <FontAwesome name="file-image-o" size={16} color={Colors.ORANGE} />
                    <Text style={styles.fileName}>student ID back.jpg</Text>
                  </View>
                )}
              </View>
              <View style={styles.uploadSlots}>
                <View style={styles.uploadSlotHalf}>
                  <PhotoUploadSlot
                    uri={state.studentIdFront}
                    onSelect={(uri) => dispatch({ type: 'SET_FIELD', field: 'studentIdFront', value: uri })}
                    allowsEditing={false}
                    label={state.studentIdFront ? 'Replace front' : 'Upload front'}
                    fill
                  />
                </View>
                <View style={styles.uploadSlotHalf}>
                  <PhotoUploadSlot
                    uri={state.studentIdBack}
                    onSelect={(uri) => dispatch({ type: 'SET_FIELD', field: 'studentIdBack', value: uri })}
                    allowsEditing={false}
                    label={state.studentIdBack ? 'Replace back' : 'Upload back'}
                    fill
                  />
                </View>
              </View>
            </View>
          </View>
        )}
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
    marginTop: 8,
  },
  fields: {
    marginTop: 20,
    gap: 12,
  },
  birthRow: {
    flexDirection: 'row',
    gap: 12,
  },
  birthField: {
    flex: 1,
  },
  studentSection: {
    marginTop: 32,
  },
  studentCheckbox: {
    marginTop: 16,
  },
  studentProof: {
    marginTop: 16,
  },
  uploadLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    lineHeight: 16,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  uploadRow: {
    gap: 12,
  },
  fileList: {
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fileName: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  uploadSlots: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  uploadSlotHalf: {
    flex: 1,
  },
});
