import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import * as Colors from '@/constants/Colors';

type CardVariant = 'light' | 'dark';

type Props = {
  variant: CardVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ variant, children, style }: Props) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const variantStyles = StyleSheet.create({
  light: {
    backgroundColor: Colors.WHITE,
  },
  dark: {
    backgroundColor: Colors.DARK_GRAY,
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
  },
});

const styles = StyleSheet.create({
  base: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
});
