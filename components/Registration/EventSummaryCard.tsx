import { View, Text, Image, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';

type Props = {
  event: EventDetails;
};

export default function EventSummaryCard({ event }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.inner}>
        {event.eventImage ? (
          <Image source={event.eventImage} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageEmpty]} testID="event-summary-cover-empty" />
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{event.eventName}</Text>
          <View style={styles.row}>
            <FontAwesome name="map-marker" size={14} color={Colors.CREAM} />
            <Text style={styles.detail}>{event.location}</Text>
          </View>
          <View style={styles.row}>
            <FontAwesome name="calendar" size={14} color={Colors.CREAM} />
            <Text style={styles.detail}>{event.date}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    height: 110,
    paddingHorizontal: 16,
    paddingVertical: 3,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imageEmpty: {
    backgroundColor: Colors.DARK_GRAY,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  detail: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM,
  },
});
