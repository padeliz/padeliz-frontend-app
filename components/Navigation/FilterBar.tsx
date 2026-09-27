import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type FilterOption = {
  label: string;
  count?: number;
};

type Props = {
  options: FilterOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export default function FilterBar({ options, selectedIndex, onSelect, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isActive = index === selectedIndex;
        return (
          <Pressable key={option.label} onPress={() => onSelect(index)} style={styles.tab}>
            <View style={styles.labelRow}>
              {option.count !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{option.count}</Text>
                </View>
              )}
              <Text style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}>
                {option.label}
              </Text>
            </View>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingLeft: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
  },
  tab: {
    paddingVertical: 14,
    paddingRight: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: Fonts.BODY,
  },
  labelActive: {
    fontFamily: Fonts.FONT_MEDIUM,
    color: Colors.WHITE,
  },
  labelInactive: {
    fontFamily: Fonts.FONT_REGULAR,
    color: 'rgba(220,221,222,0.6)',
  },
  badge: {
    height: 16,
    minWidth: 18,
    paddingHorizontal: 4,
    backgroundColor: '#97989b',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  badgeText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: 10,
    color: Colors.WHITE,
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.BLUE,
  },
});
