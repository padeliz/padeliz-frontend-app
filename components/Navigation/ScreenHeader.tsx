import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenHeader({ title, onBack, rightAction, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
        </Pressable>
      )}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {rightAction && (
        <View style={styles.rightSlot}>{rightAction}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DARK_GRAY,
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
    height: 62,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  rightSlot: {
    marginLeft: 12,
    padding: 4,
  },
});
