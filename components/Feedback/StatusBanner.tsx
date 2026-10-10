import { View, Text, StyleSheet, StyleProp, ViewStyle, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type StatusVariant = 'success' | 'warning' | 'error' | 'loading';

type Props = {
  variant: StatusVariant;
  message: string;
  style?: StyleProp<ViewStyle>;
};

type VariantConfig = {
  bg: string;
  border: string;
  color: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const variantConfig: Record<StatusVariant, VariantConfig> = {
  success: { bg: Colors.GREEN_T,  border: Colors.GREEN,  color: Colors.GREEN,  icon: 'check-circle' },
  warning: { bg: Colors.YELLOW_T, border: Colors.YELLOW, color: Colors.YELLOW, icon: 'alert' },
  error:   { bg: Colors.RED_T,    border: Colors.RED,    color: Colors.RED,    icon: 'close-circle' },
  loading: { bg: Colors.BLUE_T,   border: Colors.BLUE,   color: Colors.BLUE },
};

export default function StatusBanner({ variant, message, style }: Props) {
  const config = variantConfig[variant];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      {variant === 'loading' ? (
        <ActivityIndicator color={config.color} size="small" style={styles.icon} />
      ) : (
        <MaterialCommunityIcons name={config.icon!} size={16} color={config.color} style={styles.icon} />
      )}
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    width: '100%',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
  },
});
