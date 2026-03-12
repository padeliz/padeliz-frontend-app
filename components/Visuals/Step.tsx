import { View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFinalStep: boolean;
  stepNumber: number;
  color: string;
};

export default function Step({ label, isCompleted, isCurrent, isFinalStep, stepNumber, color }: Props) {
  const circleColor = isCompleted || isCurrent ? color : Colors.GRAY;
  const labelColor  = isCurrent ? color : Colors.CREAM;

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        {isCompleted && (
          <FontAwesome name="check" size={Fonts.BODY_S} color={Colors.WHITE} />
        )}
        {isCurrent && isFinalStep && (
          <FontAwesome name="flag" size={Fonts.BODY_S} color={Colors.WHITE} />
        )}
        {isCurrent && !isFinalStep && (
          <Text style={styles.number}>{stepNumber}</Text>
        )}
        {!isCompleted && !isCurrent && (
          <Text style={styles.number}>{stepNumber}</Text>
        )}
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    marginTop: 8,
  },
});
