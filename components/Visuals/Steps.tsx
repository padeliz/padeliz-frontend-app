import { View, StyleSheet } from 'react-native';
import Step from './Step';
import * as Colors from '@/constants/Colors';

type Props = {
  labels: string[];
  currentStep: number;  // 1-indexed
  color?: string;
};

export default function Steps({ labels, currentStep, color = Colors.ORANGE }: Props) {
  return (
    <View style={styles.container}>
      {labels.map((label, index) => {
        const stepNumber  = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent   = stepNumber === currentStep;
        const isFinalStep = stepNumber === labels.length;
        const isLast      = index === labels.length - 1;
        const lineColor   = stepNumber < currentStep ? color : Colors.GRAY;

        return (
          <View key={label} style={styles.stepRow}>
            <Step
              label={label}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isFinalStep={isFinalStep}
              stepNumber={stepNumber}
              color={color}
            />
            {!isLast && (
              <View style={[styles.line, { backgroundColor: lineColor }]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: 15,  // (32 - 2) / 2 = centers the 2px line on the 32px circle
  },
});
