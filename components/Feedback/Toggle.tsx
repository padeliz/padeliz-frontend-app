import { View, Text, Switch, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export default function Toggle({ label, value, onValueChange, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.GRAY, true: Colors.GREEN }}
        thumbColor={Colors.WHITE}
        ios_backgroundColor={Colors.GRAY}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.DARK_GRAY,
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
  },
  label: {
    flex: 1,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM,
    marginRight: 12,
  },
});
