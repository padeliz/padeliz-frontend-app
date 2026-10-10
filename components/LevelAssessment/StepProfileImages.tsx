import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import PhotoUploadSlot from './PhotoUploadSlot';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import type { AssessmentProfileImage } from '@/types/api';

/** Assessment-scoped gallery cap (matches MAX_PER_PLAYER_ASSESSMENT). */
export const MAX_PROFILE_IMAGES = 3;

const EXAMPLE_IMAGE = require('@/assets/images/ARSH-Padel-MiniTour-poster-team-example.png');

type Props = {
  images: AssessmentProfileImage[];
  /** True while an upload or delete is in flight. */
  busy?: boolean;
  uploading?: boolean;
  deletingId?: number | null;
  onAdd: (uri: string) => void;
  onRemove: (id: number) => void;
  disabled?: boolean;
};

/**
 * Profile images for the assessment. They are uploaded straight away as the pending
 * assessment's images (`uploaded_via = app_level_assessment`).
 */
export default function StepProfileImages({
  images,
  busy,
  uploading,
  deletingId = null,
  onAdd,
  onRemove,
  disabled,
}: Props) {
  const remaining = Math.max(0, MAX_PROFILE_IMAGES - images.length);
  const uploadLocked = Boolean(busy || disabled);

  const slots: Array<AssessmentProfileImage | null> = [
    ...images.slice(0, MAX_PROFILE_IMAGES),
    ...Array.from({ length: remaining }, () => null),
  ].slice(0, MAX_PROFILE_IMAGES);

  return (
    <View style={styles.container} testID="step-profile-images">
      <Text style={styles.heading}>We need clear picture with you</Text>
      <Text style={styles.subtitle}>
        A picture of you looking into the camera, with a background as simple as possible
      </Text>

      <View style={styles.exampleRow} testID="profile-images-example">
        <Image source={EXAMPLE_IMAGE} style={styles.exampleImage} resizeMode="contain" />
        <Text style={styles.exampleCaption}>So you’ll look beautiful in this format...</Text>
      </View>

      <Text style={styles.sectionHeading}>Upload {MAX_PROFILE_IMAGES} avatar photos</Text>
      <Text style={styles.sectionHelp}>No sunglasses, hats, or other objects near the face</Text>

      <View style={styles.row}>
        {slots.map((image, index) => {
          if (image) {
            const deleting = deletingId === image.id;
            return (
              <View key={image.id} style={styles.thumb} testID={`profile-image-${image.id}`}>
                <Image source={{ uri: image.url }} style={styles.image} />
                {!disabled ? (
                  <Pressable
                    style={styles.remove}
                    onPress={() => onRemove(image.id)}
                    disabled={busy}
                    testID={`remove-profile-image-${image.id}`}
                    hitSlop={6}
                  >
                    {deleting ? (
                      <ActivityIndicator color={Colors.WHITE} size="small" />
                    ) : (
                      <MaterialCommunityIcons name="close" size={12} color={Colors.WHITE} />
                    )}
                  </Pressable>
                ) : null}
              </View>
            );
          }

          const isFirstEmpty = index === images.length;
          if (!isFirstEmpty) {
            return <View key={`empty-${index}`} style={styles.emptyPlaceholder} />;
          }

          return (
            <PhotoUploadSlot
              key="add-profile-image"
              testID="add-profile-image"
              uri={null}
              onSelect={onAdd}
              size={110}
              allowsEditing
              aspect={[1, 1]}
              label={images.length === 0 ? 'upload photo' : 'upload one more option'}
              loading={uploading}
              disabled={uploadLocked && !uploading}
            />
          );
        })}
      </View>

      <View style={styles.warning} testID="profile-images-warning">
        <MaterialCommunityIcons name="alert" size={18} color={Colors.YELLOW} />
        <Text style={styles.warningText}>
          If no picture meets the criteria, the assessment will be rejected.
        </Text>
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
  exampleRow: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exampleImage: {
    width: 160,
    height: 72,
    borderRadius: 4,
    backgroundColor: Colors.WHITE,
  },
  exampleCaption: {
    flex: 1,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 18,
    color: Colors.WHITE,
  },
  sectionHeading: {
    marginTop: 24,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  sectionHelp: {
    marginTop: 6,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 18,
    color: Colors.CREAM,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  thumb: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.GRAY,
  },
  emptyPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.CREAM_20,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warning: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.YELLOW,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 18,
    color: Colors.YELLOW,
  },
});
