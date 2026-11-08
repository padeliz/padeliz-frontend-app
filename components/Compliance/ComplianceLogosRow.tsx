import { View, Image, Pressable, StyleSheet, Linking } from 'react-native';
import { ANPC_SAL_URL } from '@/constants/legalUrls';

const LOGO_HEIGHT = 60;
const GAP = 40;

type Props = {
  /** Extra top margin when placed after list content */
  style?: object;
};

/**
 * Netopia (display only) + ANPC SAL (linked). Same height, 40px gap.
 */
export default function ComplianceLogosRow({ style }: Props) {
  return (
    <View style={[styles.row, style]} testID="compliance-logos-row">
      <Image
        testID="compliance-netopia-logo"
        source={require('@/assets/images/logos/netopia-payments-horizontal-white.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Netopia Payments"
      />
      <Pressable
        testID="compliance-anpc-logo"
        onPress={() => void Linking.openURL(ANPC_SAL_URL)}
        accessibilityRole="link"
        accessibilityLabel="ANPC SAL"
      >
        <Image
          source={require('@/assets/images/logos/anpc-sal.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: GAP,
    paddingVertical: 16,
  },
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * 4.5,
    maxWidth: 220,
  },
});
