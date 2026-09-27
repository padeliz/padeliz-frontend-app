import { Pressable, Text, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type ButtonVariant = 'primary' | 'secondary' | 'disabled';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  labelStyle?: StyleProp<TextStyle>;
};

export default function Button({ label, onPress, variant = 'primary', style, icon, labelStyle }: Props) {
  return (
    <Pressable
      style={[styles.base, variantStyles[variant], style]}
      onPress={onPress}
      disabled={variant === 'disabled'}
    >
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
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
    backgroundColor: Colors.BLUE,
    opacity: 0.5,
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
});
