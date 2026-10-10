import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isFinalStep: boolean;
  stepNumber: number;
  color: string;
  enabled?: boolean;
  onPress?: () => void;
  /** Replace the step icon/number with a loader while that step is saving. */
  loading?: boolean;
};

export default function Step({
  label,
  isCompleted,
  isCurrent,
  isFinalStep,
  stepNumber,
  color,
  enabled = false,
  onPress,
  loading = false,
}: Props) {
  const circleColor = isCompleted || isCurrent || loading ? color : Colors.CREAM_20;
  const labelColor = isCurrent || loading ? color : Colors.CREAM;
  const content = (
    <>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        {loading ? (
          <ActivityIndicator
            color={Colors.WHITE}
            size="small"
            testID={`wizard-step-${stepNumber}-loading`}
          />
        ) : (
          <>
            {isCompleted && (
              <MaterialCommunityIcons name="check" size={Fonts.BODY_S} color={Colors.WHITE} />
            )}
            {isCurrent && isFinalStep && (
              <MaterialCommunityIcons name="flag" size={Fonts.BODY_S} color={Colors.WHITE} />
            )}
            {isCurrent && !isFinalStep && (
              <Text style={styles.number}>{stepNumber}</Text>
            )}
            {!isCompleted && !isCurrent && (
              <Text style={styles.number}>{stepNumber}</Text>
            )}
          </>
        )}
      </View>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </>
  );

  if (enabled && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={styles.container}
        testID={`wizard-step-${stepNumber}`}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
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
