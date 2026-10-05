import { View, Text, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  name: string;
  color?: string | null;
  testID?: string;
};

/** Colored division chip for event UIs (not Payment Details). */
export default function DivisionColorBadge({ name, color, testID }: Props) {
  const bg = color && /^#?[0-9a-fA-F]{3,8}$/.test(color)
    ? color.startsWith('#')
      ? color
      : `#${color}`
    : Colors.BLUE;

  return (
    <View style={[styles.chip, { backgroundColor: bg }]} testID={testID}>
      <Text style={styles.label} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: '100%',
  },
  label: {
    color: Colors.WHITE,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
  },
});
