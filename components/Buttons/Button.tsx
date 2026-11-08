import {
  Pressable,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type ButtonVariant = 'primary' | 'secondary' | 'disabled';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  loadingColor?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  labelStyle?: StyleProp<TextStyle>;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  loadingColor = Colors.WHITE,
  testID,
  style,
  icon,
  labelStyle,
}: Props) {
  const isDisabled = disabled || loading || variant === 'disabled';
  const showGrayDisabled = (disabled || variant === 'disabled') && !loading;
  const surfaceVariant: ButtonVariant = showGrayDisabled ? 'disabled' : variant;

  return (
    <Pressable
      testID={testID}
      style={[styles.base, variantStyles[surfaceVariant], style]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={loadingColor}
            testID={testID ? `${testID}-loading` : 'button-loading'}
          />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.label,
                showGrayDisabled && styles.labelDisabled,
                labelStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.BLUE,
    opacity: 1,
  },
  secondary: {
    backgroundColor: Colors.CREAM_10,
  },
  disabled: {
    backgroundColor: Colors.INACTIVE,
    opacity: 1,
  },
});

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: Colors.WHITE,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
  },
  labelDisabled: {
    color: Colors.DARK_GRAY,
  },
});
