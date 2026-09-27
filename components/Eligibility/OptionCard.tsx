import { Pressable, View, Text, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Checkbox from '@/components/Inputs/Checkbox';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
  icon?: React.ReactNode;
};

export default function OptionCard({ label, checked, onToggle, icon }: Props) {
  return (
    <Pressable style={styles.container} onPress={onToggle}>
      <View style={styles.left}>
        {icon && <View style={styles.iconWrap}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Checkbox checked={checked} onToggle={onToggle} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
});
