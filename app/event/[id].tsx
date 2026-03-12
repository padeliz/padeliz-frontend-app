import { View, Text, Image, ScrollView, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import { EventDetails, EventStatus, EventTiming } from '@/types/types';
import { useEvents } from '@/context/events';

const ORGANIZER_IMAGE = require('@/assets/images/events/organizer-arshavin.jpg');

const MOCK_EVENT_DETAILS: Record<string, EventDetails> = {
  '1': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'ARSH Padel MiniTour #21',
    date: '27 April 2025',
    location: 'Padel One',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:20 - 15:30' },
      { label: 'Finals', time: '15:45 - 15:59' },
    ],
    eventDescription:
      'We organize padel sessions for beginners. They are dedicated to people who have never played padel before. It\u2019s not individual course, but group games for first-timers. We exercise together through a simple and fun sport.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'pending_payment',
    timing: 'upcoming',
  },
  '2': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'ARSH Padel MiniTour #20',
    date: '05 April 2025',
    location: 'Magic Padel',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Lottery', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:15 - 15:00' },
    ],
    eventDescription:
      'We organize padel sessions for beginners. They are dedicated to people who have never played padel before. It\u2019s not individual course, but group games for first-timers. We exercise together through a simple and fun sport.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'upcoming',
  },
  '3': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'Summer Padel Championship',
    date: '10 May 2025',
    location: 'Club Deportivo',
    price: 'RON 50 - 80',
    schedule: [
      { label: 'Arriving', time: '09:00' },
      { label: 'Round Robin', time: '09:30 - 13:00' },
      { label: 'Finals', time: '13:30 - 15:00' },
    ],
    eventDescription:
      'A summer championship for all skill levels. Join us for a day of competitive padel in a friendly atmosphere.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'upcoming',
  },
  '4': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Weekend Padel League',
    date: '20 April 2025',
    location: 'Padel Arena',
    price: 'RON 40 - 60',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Matches', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:30 - 16:00' },
    ],
    eventDescription:
      'Weekend league matches for intermediate players. Come join the fun and improve your game!',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'pending_payment',
    timing: 'upcoming',
  },
  '5': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'Spring Padel Open',
    date: '10 - 22 March 2025',
    location: 'Club Deportivo',
    price: 'RON 55 - 85',
    schedule: [
      { label: 'Arriving', time: '11:00' },
      { label: 'Lottery', time: '11:30 - 15:00' },
      { label: 'Finals', time: '15:30 - 16:30' },
    ],
    eventDescription:
      'The Spring Open is our flagship event. Multiple divisions, exciting matches, and great prizes await!',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'ongoing',
  },
  '6': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Winter Padel Cup',
    date: '10 January 2025',
    location: 'Padel One',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:00 - 15:00' },
      { label: 'Finals', time: '15:15 - 16:00' },
    ],
    eventDescription:
      'Our annual winter cup brought together players from across the city for a great day of padel.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'past',
  },
  '7': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'ARSH Padel MiniTour #19',
    date: '15 December 2024',
    location: 'Magic Padel',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:20 - 15:30' },
      { label: 'Finals', time: '15:45 - 15:59' },
    ],
    eventDescription:
      'MiniTour #19 was a blast! Great matches and amazing sportsmanship from all participants.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'past',
  },
  '8': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Holiday Padel Classic',
    date: '01 December 2024',
    location: 'Club Deportivo',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Matches', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:30 - 15:30' },
    ],
    eventDescription:
      'The Holiday Classic is our end-of-year celebration event. Fun, competitive, and festive!',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'past',
  },
  // All Events mock data
  'a1': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'ARSH Padel MiniTour #22',
    date: '18 May 2025',
    location: 'Padel One',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:20 - 15:30' },
      { label: 'Finals', time: '15:45 - 15:59' },
    ],
    eventDescription:
      'We organize padel sessions for beginners. They are dedicated to people who have never played padel before.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'upcoming',
  },
  'a2': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Summer Padel Championship',
    date: '01 June 2025',
    location: 'Magic Padel',
    price: 'RON 50 - 80',
    schedule: [
      { label: 'Arriving', time: '09:00' },
      { label: 'Round Robin', time: '09:30 - 13:00' },
      { label: 'Finals', time: '13:30 - 15:00' },
    ],
    eventDescription:
      'A summer championship open to all players. Great prizes and exciting matches!',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'upcoming',
  },
  'a3': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'ARSH Padel MiniTour #21',
    date: '27 April 2025',
    location: 'Padel One',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:20 - 15:30' },
      { label: 'Finals', time: '15:45 - 15:59' },
    ],
    eventDescription:
      'We organize padel sessions for beginners. They are dedicated to people who have never played padel before.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'pending_payment',
    timing: 'upcoming',
  },
  'a4': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Weekend Padel League',
    date: '20 April 2025',
    location: 'Padel Arena',
    price: 'RON 40 - 60',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Matches', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:30 - 16:00' },
    ],
    eventDescription:
      'Weekend league for all levels. Come play and have fun!',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'upcoming',
  },
  'a5': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'Spring Padel Open',
    date: '10 - 22 March 2025',
    location: 'Club Deportivo',
    price: 'RON 55 - 85',
    schedule: [
      { label: 'Arriving', time: '11:00' },
      { label: 'Lottery', time: '11:30 - 15:00' },
      { label: 'Finals', time: '15:30 - 16:30' },
    ],
    eventDescription:
      'The Spring Open is our flagship event with multiple divisions.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'ongoing',
  },
  'a6': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'City Padel Series',
    date: '01 - 15 March 2025',
    location: 'Padel Arena',
    price: 'RON 45 - 70',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Matches', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:30 - 16:00' },
    ],
    eventDescription:
      'City-wide padel series with players from all over.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'ongoing',
  },
  'a7': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'Corporate Padel Cup',
    date: '05 - 20 March 2025',
    location: 'Magic Padel',
    price: 'RON 50 - 75',
    schedule: [
      { label: 'Arriving', time: '09:00' },
      { label: 'Matches', time: '09:30 - 13:00' },
      { label: 'Finals', time: '13:30 - 15:00' },
    ],
    eventDescription:
      'Corporate tournament for companies and their teams.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'ongoing',
  },
  'a8': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Winter Padel Cup',
    date: '10 January 2025',
    location: 'Padel One',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:00 - 15:00' },
      { label: 'Finals', time: '15:15 - 16:00' },
    ],
    eventDescription:
      'Annual winter cup with great competition and prizes.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'registered',
    timing: 'past',
  },
  'a9': {
    eventImage: require('@/assets/images/events/minitour-21.png'),
    eventName: 'ARSH Padel MiniTour #19',
    date: '15 December 2024',
    location: 'Magic Padel',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '11:30' },
      { label: 'Lottery', time: '12:20 - 15:30' },
      { label: 'Finals', time: '15:45 - 15:59' },
    ],
    eventDescription:
      'MiniTour #19 was a blast with amazing sportsmanship.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'past',
  },
  'a10': {
    eventImage: require('@/assets/images/events/minitour-20.png'),
    eventName: 'Holiday Padel Classic',
    date: '01 December 2024',
    location: 'Club Deportivo',
    price: 'RON 45 - 75',
    schedule: [
      { label: 'Arriving', time: '10:00' },
      { label: 'Matches', time: '10:30 - 14:00' },
      { label: 'Finals', time: '14:30 - 15:30' },
    ],
    eventDescription:
      'End-of-year celebration event with festive vibes.',
    organizerImage: ORGANIZER_IMAGE,
    organizerName: 'Arshavin',
    organizerTitle: 'Tournament Director',
    status: 'none',
    timing: 'past',
  },
};

type CTAConfig = {
  label: string;
  variant?: 'default' | 'orange';
  showClockIcon?: boolean;
};

function getCTA(status: EventStatus, timing: EventTiming): CTAConfig | null {
  if (timing === 'ongoing' || timing === 'past') return null;
  if (status === 'registered') return null;
  if (status === 'pending_payment') return { label: 'Pay Now' };
  if (status === 'eligibility_pending') return { label: 'Eligibility Check in Pending', variant: 'orange', showClockIcon: true };
  return { label: 'Register Now' };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { getEventStatus } = useEvents();
  const event = MOCK_EVENT_DETAILS[id];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>Event not found</Text>
      </SafeAreaView>
    );
  }

  const status = getEventStatus(id, event.status);
  const cta = getCTA(status, event.timing);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerButton}>
          <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
        </Pressable>
        <Text style={styles.headerTitle}>Event Details</Text>
        <Pressable style={styles.headerButton}>
          <FontAwesome name="share-square-o" size={18} color={Colors.WHITE} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          cta ? { paddingBottom: 105 } : { paddingBottom: 24 },
        ]}
      >
        {/* Cover Image */}
        <Image source={event.eventImage} style={styles.coverImage} />

        {/* Event Info */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>{event.eventName}</Text>

          {/* Date */}
          <View style={styles.dateRow}>
            <FontAwesome name="calendar" size={14} color={Colors.CREAM_80} />
            <Text style={styles.dateText}>{event.date}</Text>
          </View>

          {/* Info Cards Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Location</Text>
              <View style={styles.infoValueRow}>
                <FontAwesome name="map-marker" size={14} color={Colors.WHITE} />
                <Text style={styles.infoValue}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Price per player</Text>
              <View style={styles.infoValueRow}>
                <FontAwesome name="tag" size={14} color={Colors.WHITE} />
                <Text style={styles.infoValue}>{event.price}</Text>
              </View>
            </View>
          </View>

          {/* Schedule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <View style={styles.scheduleCard}>
              {event.schedule.map((item, index) => (
                <View key={index} style={styles.scheduleRow}>
                  <Text style={styles.scheduleLabel}>{item.label}</Text>
                  <Text style={styles.scheduleTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Event</Text>
            <Text style={styles.description}>{event.eventDescription}</Text>
          </View>

          {/* Organizer */}
          <View style={styles.organizerCard}>
            <Image source={event.organizerImage} style={styles.organizerImage} />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{event.organizerName}</Text>
              <Text style={styles.organizerTitle}>{event.organizerTitle}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      {cta && (
        <View style={styles.ctaBar}>
          <Button
            label={cta.label}
            onPress={() => {
              if (status === 'none' || status === 'eligibility_pending') {
                router.push({ pathname: '/event/eligibility-check' as any, params: { eventId: id } });
              }
            }}
            style={cta.variant === 'orange' ? styles.ctaOrange : undefined}
            icon={cta.showClockIcon ? <FontAwesome name="clock-o" size={18} color={Colors.WHITE} /> : undefined}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  header: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
    backgroundColor: Colors.DARK_GRAY,
  },
  headerButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.SCREEN_TITLE,
    lineHeight: 22,
    color: Colors.WHITE,
    marginTop: 24,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  dateText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM_80,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  infoCard: {
    flex: 1,
    height: 80,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  infoValue: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  scheduleCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 24,
  },
  scheduleLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  scheduleTime: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM_60,
  },
  description: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 22,
    color: Colors.CREAM,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    height: 80,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  organizerImage: {
    width: 48,
    height: 48,
    borderRadius: 9999,
  },
  organizerInfo: {
    marginLeft: 16,
  },
  organizerName: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  organizerTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 4,
  },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 89,
    backgroundColor: Colors.DARK_GRAY,
    borderTopWidth: 1,
    borderTopColor: Colors.CREAM_10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaOrange: {
    backgroundColor: Colors.ORANGE,
  },
});
