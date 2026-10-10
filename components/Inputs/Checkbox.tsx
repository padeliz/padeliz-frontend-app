import { Pressable, StyleSheet } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';

type Props = {
  checked: boolean;
  onToggle?: () => void;
};

export default function Checkbox({ checked, onToggle }: Props) {
  return (
    <Pressable
      style={[styles.container, checked ? styles.boxChecked : styles.boxUnchecked]}
      onPress={onToggle}
      hitSlop={8}
    >
      {checked && <Icon name="check" size={14} color={Colors.WHITE} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 18,
    height: 18,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: Colors.ORANGE,
  },
  boxUnchecked: {
    borderWidth: 2,
    borderColor: Colors.WHITE,
  },
});
