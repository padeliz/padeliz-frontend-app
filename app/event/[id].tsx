import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import { EventStatus, EventTiming } from '@/types/types';
import { useEvents } from '@/context/events';
import { useEdition } from '@/services/hooks/useEditions';
import { useEligibilityLatest, useEligibilityStatus } from '@/services/hooks/useEligibility';
import { editionToDetails } from '@/services/mappers';

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
  if (status === 'registration_pending') return { label: 'Registration Review in Pending', variant: 'orange', showClockIcon: true };
  return { label: 'Register Now' };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { getEventStatus } = useEvents();

  const editionId = Number(id);
  const { data: edition, loading } = useEdition(editionId);
  // /status is always 200; only fetch /latest (which 404s when none) if a pending exists.
  const { data: eligibilityStatus } = useEligibilityStatus();
  const { data: latest } = useEligibilityLatest(
    eligibilityStatus?.latest === 'pending'
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const Header = (
    <View style={styles.header}>
      <Pressable onPress={handleBack} style={styles.headerButton}>
        <FontAwesome name="chevron-left" size={16} color={Colors.WHITE} />
      </Pressable>
      <Text style={styles.headerTitle}>Event Details</Text>
      <Pressable style={styles.headerButton}>
        <FontAwesome name="share-square-o" size={18} color={Colors.WHITE} />
      </Pressable>
    </View>
  );

  if (loading && !edition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!edition) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <Text style={styles.title}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // The player has at most one pending eligibility; it applies to this event only if
  // this edition is in its edition_ids. Events context overlays optimistic updates.
  const baseStatus: EventStatus =
    latest?.review_status === 'pending' && latest.edition_ids?.includes(editionId)
      ? 'eligibility_pending'
      : 'none';
  const status = getEventStatus(id, baseStatus);
  const event = editionToDetails(edition, status);
  const cta = getCTA(status, event.timing);

  return (
    <SafeAreaView style={styles.safeArea}>
      {Header}

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
          {event.schedule.length > 0 && (
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
          )}

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
              if (status === 'none') {
                router.push({ pathname: '/event/eligibility-check' as any, params: { eventId: id } });
              } else if (status === 'eligibility_pending') {
                router.push({ pathname: '/event/registration' as any, params: { eventId: id } });
              } else if (status === 'registration_pending') {
                router.push({ pathname: '/event/registration' as any, params: { eventId: id, initialStep: '4' } });
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
