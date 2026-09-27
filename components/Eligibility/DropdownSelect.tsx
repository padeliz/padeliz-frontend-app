import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, FlatList } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Option = { label: string; value: string };

type Props = {
  placeholder?: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export default function DropdownSelect({ placeholder = 'choose experience', options, selectedValue, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={[styles.triggerText, !selectedOption && styles.triggerPlaceholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <FontAwesome name="chevron-down" size={10} color={Colors.CREAM} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            {options.map((option) => (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() => {
                  onSelect(option.value);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 38,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },
  triggerText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
  triggerPlaceholder: {
    color: Colors.INACTIVE,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 3,
  },
  optionText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
    lineHeight: 24,
  },
});
