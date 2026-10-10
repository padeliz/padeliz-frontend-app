import { View, StyleSheet } from 'react-native';
import Step from './Step';
import * as Colors from '@/constants/Colors';

type Props = {
  labels: string[];
  currentStep: number; // 1-indexed
  color?: string;
  /** 1-indexed steps that can be pressed. */
  enabledSteps?: number[];
  onStepPress?: (step: number) => void;
  /** 1-indexed step currently showing a save loader in its icon. */
  loadingStep?: number | null;
  /**
   * When set, previous steps show a check only if listed here.
   * When omitted, any previous step (index < current) is treated as completed (registration).
   */
  completedSteps?: number[];
};

export default function Steps({
  labels,
  currentStep,
  color = Colors.ORANGE,
  enabledSteps = [],
  onStepPress,
  loadingStep = null,
  completedSteps,
}: Props) {
  return (
    <View style={styles.container}>
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isPrevious = stepNumber < currentStep;
        const isCompleted = completedSteps
          ? isPrevious && completedSteps.includes(stepNumber)
          : isPrevious;
        const isCurrent = stepNumber === currentStep;
        const isFinalStep = stepNumber === labels.length;
        const isLast = index === labels.length - 1;
        const lineColor = isCompleted ? color : Colors.GRAY;
        const enabled = enabledSteps.includes(stepNumber);

        return (
          <View key={label} style={[styles.stepRow, isLast && styles.stepRowLast]}>
            <Step
              label={label}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isFinalStep={isFinalStep}
              stepNumber={stepNumber}
              color={color}
              enabled={enabled}
              loading={loadingStep === stepNumber}
              onPress={
                enabled && onStepPress ? () => onStepPress(stepNumber) : undefined
              }
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
    justifyContent: 'center',
    width: '100%',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepRowLast: {
    flexShrink: 0,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: 15,
    minWidth: 32,
  },
});
