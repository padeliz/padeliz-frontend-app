import { StyleSheet, Text, View } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { divisionSegments, pointerFraction } from '@/services/levelBandScale';
import type { Level } from '@/types/api';

type Props = {
  bandName: string | null;
  level: string;
  levels: Level[] | null | undefined;
};

/**
 * 3-segment linear scale (Low / Mid / High) for the player's division family. The axis is
 * inverted: N.99 sits on the left (Low) and N.00 on the right (High).
 */
export default function LevelBandScale({ bandName, level, levels }: Props) {
  const segments = divisionSegments(bandName, levels);
  if (segments.length === 0) return null;

  const fraction = pointerFraction(bandName, level);

  return (
    <View style={styles.wrap} testID="level-band-scale">
      <View style={styles.track}>
        <View style={styles.segments}>
          {segments.map((segment) => (
            <View
              key={segment.id_level}
              style={[
                styles.segment,
                segment.name === bandName && styles.segmentActive,
              ]}
              testID={`level-band-segment-${segment.label.toLowerCase()}`}
            />
          ))}
        </View>
        {fraction !== null ? (
          <View
            pointerEvents="none"
            style={[styles.pointerSlot, { left: `${fraction * 100}%` }]}
            testID="level-band-pointer"
            accessibilityLabel={`Level ${level}`}
          >
            <View style={styles.pointer} />
          </View>
        ) : null}
      </View>
      <View style={styles.labels}>
        {segments.map((segment) => (
          <Text
            key={segment.id_level}
            style={[styles.label, segment.name === bandName && styles.labelActive]}
            testID={`level-band-label-${segment.label.toLowerCase()}`}
          >
            {segment.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
  },
  track: {
    height: 16,
    justifyContent: 'center',
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.CREAM_20,
  },
  segmentActive: {
    backgroundColor: Colors.BLUE_T,
  },
  pointerSlot: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.BLUE,
    borderWidth: 2,
    borderColor: Colors.WHITE,
  },
  labels: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  labelActive: {
    color: Colors.WHITE,
  },
});
