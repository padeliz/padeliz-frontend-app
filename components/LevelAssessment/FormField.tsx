import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  helpText?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  dirty?: boolean;
  disabled?: boolean;
};

/**
 * Details-step field: label above, optional gray help_text, no placeholder.
 */
export default function FormField({
  label,
  helpText,
  value,
  onChangeText,
  keyboardType,
  style,
  testID,
  autoCapitalize,
  dirty,
  disabled,
}: Props) {
  return (
    <View style={[styles.container, style]} testID={testID ? `${testID}-wrap` : undefined}>
      <Text style={styles.label}>{label}</Text>
      {helpText ? <Text style={styles.help}>{helpText}</Text> : null}
      <TextInput
        style={[styles.input, dirty && styles.inputDirty, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        testID={testID}
        autoCapitalize={autoCapitalize}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  help: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    lineHeight: 16,
    color: Colors.CREAM_60,
  },
  input: {
    minHeight: 44,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  inputDirty: {
    borderColor: Colors.YELLOW,
  },
  inputDisabled: {
    opacity: 0.55,
  },
});
