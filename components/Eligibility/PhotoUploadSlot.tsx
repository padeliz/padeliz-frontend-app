import { Pressable, Image, Text, View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  uri: string | null;
  onSelect: (uri: string) => void;
  size?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  label?: string;
  hint?: string;
  fill?: boolean;
  fillHeight?: number;
  testID?: string;
};

export default function PhotoUploadSlot({
  uri,
  onSelect,
  size = 110,
  allowsEditing = true,
  aspect = [1, 1],
  label,
  hint,
  fill,
  fillHeight,
  testID,
}: Props) {
  const handlePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing,
      aspect,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onSelect(result.assets[0].uri);
    }
  };

  return (
    <Pressable
      testID={testID}
      style={[
        styles.container,
        fill
          ? fillHeight
            ? { width: '100%', height: fillHeight }
            : styles.fill
          : { width: size, height: size },
      ]}
      onPress={handlePress}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <FontAwesome name="cloud-upload" size={20} color={Colors.CREAM} />
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.hint}>{hint ?? 'PNG, JPG up to 5MB'}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: Colors.CREAM_20,
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: 10,
    color: Colors.CREAM,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  hint: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: 8,
    color: Colors.CREAM_60,
    textAlign: 'center',
  },
});
