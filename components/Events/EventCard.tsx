import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventCardData } from '@/types/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const STATUS_CONFIG = {
  pending_payment: { label: 'Pending Payment', color: Colors.BLUE },
  registered: { label: 'Registered', color: Colors.BADGE_GREEN },
} as const;

type Props = {
  event: EventCardData;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: Props) {
  const status = STATUS_CONFIG[event.status];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={event.coverImage} style={styles.coverImage} />
        {event.status !== 'none' && (
          <View style={[styles.badge, { backgroundColor: status.color }]}>
            <Text style={styles.badgeText}>{status.label}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.detailRow}>
          <FontAwesome name="map-marker" size={16} color={Colors.CREAM} style={styles.icon} />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <FontAwesome name="calendar" size={14} color={Colors.CREAM} style={styles.icon} />
          <Text style={styles.detailText}>{event.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 316,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.CARD_BG,
  },
  imageContainer: {
    width: '100%',
    height: 192,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    top: 13,
    right: 14,
    height: 24,
    borderRadius: 9999,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
  info: {
    height: 124,
    paddingHorizontal: 16,
    paddingTop: 19,
  },
  title: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    marginTop: 8,
  },
  icon: {
    width: 20,
  },
  detailText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM,
  },
});
