import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  onBack?: () => void;
  backLabel?: string;
  onForward?: () => void;
  forwardLabel?: string;
  forwardDisabled?: boolean;
  isFinalForward?: boolean; // true = filled BLUE button instead of bordered
};

export default function StepNavButtons({ onBack, backLabel, onForward, forwardLabel, forwardDisabled, isFinalForward }: Props) {
  return (
    <View style={styles.container}>
      {onBack && backLabel ? (
        <Pressable testID="step-back" style={styles.button} onPress={onBack}>
          <Text style={styles.smallLabelLeft}>Go back to</Text>
          <Text style={styles.mainLabelLeft}>{backLabel}</Text>
        </Pressable>
      ) : (
        <View />
      )}
      {onForward && forwardLabel ? (
        <Pressable
          testID="step-forward"
          style={[styles.button, styles.buttonRight, isFinalForward && styles.buttonFilled]}
          onPress={onForward}
        >
          <Text style={styles.smallLabelRight}>
            {isFinalForward ? 'Go to' : 'Continue to'}
          </Text>
          <Text style={styles.mainLabelRight}>{forwardLabel}</Text>
        </Pressable>
      ) : forwardDisabled && forwardLabel ? (
        <View style={[styles.button, styles.buttonRight, styles.buttonDisabled]}>
          <Text style={styles.smallLabelDisabled}>Continue to</Text>
          <Text style={styles.mainLabelDisabled}>{forwardLabel}</Text>
        </View>
      ) : (
        <View />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  button: {
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.WHITE,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  buttonRight: {
    alignItems: 'flex-end',
  },
  buttonFilled: {
    backgroundColor: Colors.BLUE,
    borderWidth: 0,
    paddingHorizontal: 10,
  },
  buttonDisabled: {
    borderColor: Colors.INACTIVE,
  },
  smallLabelLeft: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: 10,
    color: Colors.CREAM,
  },
  mainLabelLeft: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  smallLabelRight: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: 10,
    color: Colors.CREAM,
  },
  mainLabelRight: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  smallLabelDisabled: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: 10,
    color: Colors.INACTIVE,
  },
  mainLabelDisabled: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.INACTIVE,
  },
});
