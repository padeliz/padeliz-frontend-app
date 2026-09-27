import { TextInput, View, StyleSheet, StyleProp, ViewStyle, TextInputProps } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  style?: StyleProp<ViewStyle>;
};

export default function Input({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry,
  keyboardType,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={Colors.INACTIVE}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
      />
      {icon && (
        <FontAwesome name={icon} size={16} color={Colors.INACTIVE} style={styles.icon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.CREAM,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.DARK_GRAY,
    height: '100%',
    outlineStyle: 'none',
  },
  icon: {
    paddingLeft: 8,
  },
});
