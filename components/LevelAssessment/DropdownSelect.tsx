import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Option = { label: string; value: string };

type Props = {
  placeholder?: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  testID?: string;
  dirty?: boolean;
  disabled?: boolean;
};

export default function DropdownSelect({
  placeholder = 'choose',
  options,
  selectedValue,
  onSelect,
  testID,
  dirty,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === selectedValue);

  return (
    <>
      <Pressable
        testID={testID}
        style={[
          styles.trigger,
          dirty && styles.triggerDirty,
          disabled && styles.triggerDisabled,
        ]}
        onPress={() => {
          if (!disabled) setOpen(true);
        }}
        disabled={disabled}
      >
        <Text style={[styles.triggerText, !selectedOption && styles.triggerPlaceholder]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={10} color={Colors.CREAM} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  testID={testID ? `${testID}-option-${option.value}` : undefined}
                  style={styles.option}
                  onPress={() => {
                    onSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
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
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
  },
  triggerDirty: {
    borderColor: Colors.YELLOW,
  },
  triggerDisabled: {
    opacity: 0.55,
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
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.25)',
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 360,
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
