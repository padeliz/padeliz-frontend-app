import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions, StyleProp, ViewStyle } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
};

export default function FormField({ label, value, onChangeText, placeholder, keyboardType, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.INACTIVE}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    paddingHorizontal: 21,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: 10,
    color: Colors.INACTIVE,
    marginTop: 4,
  },
  input: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    padding: 0,
    height: 24,
  },
});
