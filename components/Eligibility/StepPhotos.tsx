import { View, Text, StyleSheet } from 'react-native';
import PhotoUploadSlot from './PhotoUploadSlot';
import StatusBanner from '@/components/Feedback/StatusBanner';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EligibilityFormState, FormAction } from '@/app/event/eligibility-check';

type Props = {
  state: EligibilityFormState;
  dispatch: React.Dispatch<FormAction>;
};

export default function StepPhotos({ state, dispatch }: Props) {
  return (
    <View style={styles.container}>
      {/* Instructions */}
      <Text style={styles.heading}>We need clear picture with you</Text>
      <Text style={styles.subtitle}>
        A picture of you looking into the camera, with a background as simple as possible
      </Text>

      {/* Upload section */}
      <View style={styles.uploadSection}>
        <Text style={styles.uploadTitle}>Upload 3 avatar photos</Text>
        <Text style={styles.uploadSubtitle}>
          No sunglasses, hats, or other objects near the face
        </Text>

        <View style={styles.photoRow}>
          {[0, 1, 2].map((index) => (
            <PhotoUploadSlot
              key={index}
              uri={state.avatarPhotos[index]}
              onSelect={(uri) => dispatch({ type: 'SET_AVATAR_PHOTO', index, uri })}
              size={110}
              allowsEditing={true}
              aspect={[1, 1]}
              label={state.avatarPhotos[index] ? undefined : 'upload photo'}
            />
          ))}
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warning}>
        <StatusBanner
          variant="warning"
          message="If no picture meets the criteria, the eligibility application will be rejected."
        />
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
    marginTop: 8,
  },
  uploadSection: {
    marginTop: 32,
  },
  uploadTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    lineHeight: 26,
    color: Colors.WHITE,
  },
  uploadSubtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 18,
    color: Colors.CREAM,
    marginTop: 8,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  warning: {
    marginTop: 24,
  },
});
