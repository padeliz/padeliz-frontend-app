import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventCardData, EventBadge } from '@/types/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

const BADGE_COLORS: Record<string, string> = {
  pending_payment: Colors.BLUE,
  registration_pending: Colors.ORANGE,
  eligibility_pending: Colors.ORANGE,
  registered: Colors.BADGE_GREEN,
  participated: Colors.BADGE_GREEN,
  lottery_winner: Colors.AMBER,
  new: Colors.BLUE,
  few_spots_remained: Colors.ORANGE,
};

function badgeColor(key: string): string {
  return BADGE_COLORS[key] ?? Colors.BLUE;
}

type Props = {
  event: EventCardData;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: Props) {
  const badges: EventBadge[] =
    event.badges && event.badges.length > 0
      ? event.badges
      : [];

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      testID={`event-card-${event.id}`}
    >
      <View style={styles.imageContainer}>
        {event.coverImage ? (
          <Image
            source={event.coverImage}
            style={styles.coverImage}
            testID="event-card-cover"
          />
        ) : (
          <View style={styles.coverEmpty} testID="event-card-cover-empty" />
        )}
        {badges.length > 0 ? (
          <View style={styles.badgeStack} testID="event-card-badges">
            {badges.map((badge) => (
              <View
                key={badge.key}
                style={[styles.badge, { backgroundColor: badgeColor(badge.key) }]}
                testID={`event-badge-${badge.key}`}
              >
                <Text style={styles.badgeText}>{badge.label}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
  coverEmpty: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.GRAY,
  },
  badgeStack: {
    position: 'absolute',
    top: 13,
    right: 14,
    left: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  badge: {
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
    paddingHorizontal: 16,
    paddingTop: 19,
    paddingBottom: 16,
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
