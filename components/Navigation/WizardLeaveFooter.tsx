/**
 * Viewport-fixed leave CTA for assessment / student-proof wizards.
 */
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';

type Props = {
  label: 'Finish it later' | 'Close';
  onPress: () => void;
  testID?: string;
};

export default function WizardLeaveFooter({
  label,
  onPress,
  testID = 'wizard-leave-footer',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Button
        label={label}
        variant="secondary"
        onPress={onPress}
        testID={testID}
      />
    </View>
  );
}

/** Extra scroll padding so content clears the fixed footer. */
export const WIZARD_LEAVE_FOOTER_SCROLL_EXTRA = 72;

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.DARK_GRAY,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.CREAM_20,
  },
});
