import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  title: string;
  variant: 'root' | 'stack';
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function ScreenHeader({
  title,
  variant,
  onBack,
  rightAction,
  style,
  testID,
}: Props) {
  if (variant === 'root') {
    return (
      <View style={[styles.rootContainer, style]} testID={testID ?? 'screen-header-root'}>
        <Text style={styles.rootTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.stackContainer, style]} testID={testID ?? 'screen-header-stack'}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={styles.stackSide}
          testID="screen-header-back"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
        </Pressable>
      ) : (
        <View style={styles.stackSide} />
      )}
      <Text style={styles.stackTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.stackSide}>
        {rightAction ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.DARK_GRAY,
  },
  rootTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.SCREEN_TITLE,
    color: Colors.WHITE,
  },
  stackContainer: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
    backgroundColor: Colors.DARK_GRAY,
  },
  stackSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
});
