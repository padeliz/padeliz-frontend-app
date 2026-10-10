import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  useWindowDimensions,
  Linking,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import RenderHtml from 'react-native-render-html';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import FilterBar from '@/components/Navigation/FilterBar';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import DivisionGroupsList, {
  type DivisionCardState,
} from '@/components/Registration/DivisionGroupsList';
import CancelRegistrationModal from '@/components/Registration/CancelRegistrationModal';
import ShareReferralModal from '@/components/Registration/ShareReferralModal';
import LoginModal from '@/components/Login/LoginModal';
import DivisionColorBadge from '@/components/Events/DivisionColorBadge';
import { EventBadge } from '@/types/types';
import type { EventRegistration, RegistrationCancelReason } from '@/types/api';
import { useAuth } from '@/context/auth';
import { useEvent } from '@/services/hooks/useEvents';
import { useCurrentLevel } from '@/services/hooks/useLevelAssessment';
import { useLevelFlow } from '@/services/hooks/useLevelFlow';
import { useEventRegistration } from '@/services/hooks/useRegistrations';
import {
  canSelfCancel,
  cancelRegistration,
  excludeFromCheckout,
  openCheckoutId,
  registrationDivisionLabel,
} from '@/services/registration';
import { eventEndDate, getEventStickyCta } from '@/services/eventCta';
import {
  eventDivisionOptions,
  eventToDetails,
  formatPaymentDueAt,
  registrationToEventStatus,
} from '@/services/mappers';
import { eventRegistrationPath } from '@/utils/eventPaths';

const BADGE_COLORS: Record<string, string> = {
  pending_payment: Colors.BLUE,
  registration_pending: Colors.ORANGE,
  registered: Colors.BADGE_GREEN,
  participated: Colors.BADGE_GREEN,
  lottery_winner: Colors.AMBER,
  new: Colors.BLUE,
  few_spots_remained: Colors.ORANGE,
};

function badgeColor(key: string): string {
  return BADGE_COLORS[key] ?? Colors.BLUE;
}

/** Tags allowed in event descriptions (matches backend sanitizer). */
const DESCRIPTION_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'ul',
  'ol',
  'li',
  'a',
] as const;

const ALL_TABS = ['Info', 'Divisions', 'Description', 'Deadlines'] as const;
type TabKey = (typeof ALL_TABS)[number];

const CANCELLATION_DEADLINE_COPY =
  "You can receive a refund only if you cancel your registration before this time. Don't register if you're not sure you can attend. You can't be replaced by another player, the playing slot will just be lost. Thank you for understanding.";

const REGISTRATION_DEADLINE_COPY =
  'You can only register to the event before this time. Please get your place as fast as possible.';

function registrationDivisionStates(
  registrations: EventRegistration[]
): Record<number, DivisionCardState> {
  const states: Record<number, DivisionCardState> = {};
  for (const r of registrations) {
    if (r.event_division_id == null) continue;
    if (r.payment_status === 'paid') {
      states[r.event_division_id] = 'paid';
    } else if (
      r.payment_status === 'unpaid' ||
      r.payment_status === 'awaiting_proof_review'
    ) {
      states[r.event_division_id] = 'reserved';
    }
  }
  return states;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const descriptionContentWidth = windowWidth - 32;
  const htmlTagsStyles = useMemo(
    () => ({
      body: {
        fontFamily: Fonts.FONT_REGULAR,
        fontSize: Fonts.BODY_S,
        lineHeight: 22,
        color: Colors.CREAM,
      },
      p: { marginTop: 0, marginBottom: 8, color: Colors.CREAM },
      strong: { fontFamily: Fonts.FONT_MEDIUM, color: Colors.CREAM },
      b: { fontFamily: Fonts.FONT_MEDIUM, color: Colors.CREAM },
      em: { fontStyle: 'italic' as const, color: Colors.CREAM },
      i: { fontStyle: 'italic' as const, color: Colors.CREAM },
      ul: { marginBottom: 8, paddingLeft: 16 },
      ol: { marginBottom: 8, paddingLeft: 16 },
      li: { marginBottom: 4, color: Colors.CREAM },
      a: { color: Colors.BLUE, textDecorationLine: 'underline' as const },
    }),
    []
  );
  const htmlDomVisitors = useMemo(
    () => ({
      onElement: (el: { tagName: string; attribs: Record<string, string> }) => {
        if (
          !DESCRIPTION_ALLOWED_TAGS.includes(
            el.tagName as (typeof DESCRIPTION_ALLOWED_TAGS)[number]
          )
        ) {
          el.tagName = 'span';
          el.attribs = {};
        }
        if (el.tagName === 'a') {
          const href = el.attribs?.href;
          el.attribs = href ? { href } : {};
        }
      },
    }),
    []
  );
  const htmlRenderersProps = useMemo(
    () => ({
      a: {
        onPress: (_event: unknown, href?: string) => {
          if (href) void Linking.openURL(href);
        },
      },
    }),
    []
  );

  const eventId = Number(id);
  const { data: event, loading: eventLoading, refetch: refetchEvent } =
    useEvent(eventId);
  const { data: currentLevel, loading: levelLoading } = useCurrentLevel(isAuthed);
  const { start: startLevelFlow, starting: levelStarting } = useLevelFlow();
  const {
    registrations,
    loading: registrationsLoading,
    refetch: refetchRegistration,
  } = useEventRegistration(eventId, isAuthed);

  const [activeTab, setActiveTab] = useState(0);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'date' | 'location' | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const ctaSettled =
    !eventLoading && (!isAuthed || (!levelLoading && !registrationsLoading));

  const handleCancel = async (
    reason: RegistrationCancelReason,
    registrationIds: number[]
  ) => {
    if (registrationIds.length === 0) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const awaitingIds = registrationIds.filter((id) =>
        registrations.some(
          (r) =>
            r.id_registration === id && r.payment_status === 'awaiting_proof_review'
        )
      );
      const otherIds = registrationIds.filter((id) => !awaitingIds.includes(id));

      if (awaitingIds.length > 0) {
        const checkoutId = openCheckoutId(registrations);
        if (checkoutId == null) {
          throw new Error('No open checkout to exclude from.');
        }
        await excludeFromCheckout(checkoutId, awaitingIds, reason);
      }

      for (const registrationId of otherIds) {
        await cancelRegistration(registrationId, reason);
      }
      setCancelOpen(false);
      refetchRegistration();
      void refetchEvent();
    } catch (e) {
      setCancelError((e as Error).message || 'Could not cancel the registration.');
    } finally {
      setCancelling(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const Header = (
    <ScreenHeader
      title="Event Details"
      variant="stack"
      onBack={handleBack}
      rightAction={
        <Pressable
          onPress={() => setShareOpen(true)}
          testID="open-share-referral"
          hitSlop={8}
        >
          <MaterialCommunityIcons name="share-variant" size={18} color={Colors.WHITE} />
        </Pressable>
      }
    />
  );

  if (eventLoading && !event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {Header}
        <View style={styles.centered}>
          <Text style={styles.title}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = isAuthed ? registrationToEventStatus(registrations) : 'none';
  const details = eventToDetails(event, status);
  const eventEndMs = eventEndDate(event).getTime();
  const eventEnded = !Number.isNaN(eventEndMs) && Date.now() >= eventEndMs;
  const tabs: readonly TabKey[] = eventEnded
    ? ALL_TABS.filter((t) => t !== 'Deadlines')
    : ALL_TABS;
  const safeTabIndex = Math.min(activeTab, tabs.length - 1);
  const cta = ctaSettled
    ? getEventStickyCta({
        status,
        event,
        hasPlayerLevel: currentLevel !== null,
        isAuthed,
        hasParticipated: Boolean(event.has_participated),
      })
    : null;
  const showCancel = isAuthed && canSelfCancel(event, registrations);
  const cancelTargets = registrations.map((r) => ({
    id: r.id_registration,
    label: registrationDivisionLabel(r, event),
  }));
  const badges: EventBadge[] = details.badges ?? [];
  const tabKey: TabKey = tabs[safeTabIndex] ?? 'Info';
  const divisionOptions = eventDivisionOptions(event);
  const divisionStates = registrationDivisionStates(registrations);
  const registrationClosesLabel = formatPaymentDueAt(
    event.registration_allowed_until
  );
  const cancellationClosesLabel = formatPaymentDueAt(
    event.cancellation_allowed_until
  );
  const unpaidWithDue = registrations.filter(
    (r) => r.payment_status === 'unpaid' && formatPaymentDueAt(r.payment_due_at)
  );
  const eventTitleAboveTabs = details.organizerName
    ? `${details.organizerName} • ${details.eventName}`
    : details.eventName;

  const divisionColorFor = (registration: EventRegistration): string | null => {
    const embedded = registration.event_division?.division?.color;
    if (typeof embedded === 'string') return embedded;
    const fromEvent = event.event_divisions?.find(
      (d) => d.id_event_division === registration.event_division_id
    );
    const color = fromEvent?.division?.color;
    return typeof color === 'string' ? color : null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {Header}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          cta || !ctaSettled ? { paddingBottom: 105 } : { paddingBottom: 24 },
        ]}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.coverWrap}>
          {details.eventImage ? (
            <Image
              source={details.eventImage}
              style={styles.coverImage}
              testID="event-cover"
            />
          ) : (
            <View style={styles.coverEmpty} testID="event-cover-empty" />
          )}
          {badges.length > 0 ? (
            <View style={styles.badgeStack} testID="event-detail-badges">
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

        <View style={styles.stickyChrome} testID="event-sticky-chrome">
          <Text style={styles.titleAboveTabs} testID="event-title-above-tabs">
            {eventTitleAboveTabs}
          </Text>
          <View style={styles.heroDateUnderTitle} testID="event-hero-date">
            <MaterialCommunityIcons name="calendar" size={14} color={Colors.CREAM_80} />
            <Text style={styles.heroMetaText}>{details.date}</Text>
          </View>
          <View testID="event-tabs">
            <FilterBar
              style={styles.tabBar}
              options={tabs.map((label) => ({ label }))}
              selectedIndex={safeTabIndex}
              onSelect={setActiveTab}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View testID={`event-tab-${tabKey.toLowerCase()}`}>
            {tabKey === 'Info' && (
              <>
                <View style={styles.infoRow}>
                  <Pressable
                    style={styles.infoCard}
                    testID="info-date-card"
                    onPress={() => setInfoModal('date')}
                  >
                    <View style={styles.infoValueRow}>
                      <MaterialCommunityIcons name="calendar" size={22} color={Colors.WHITE} />
                      <View style={styles.infoTextCol}>
                        <Text style={styles.infoValue}>{details.dateShort}</Text>
                        {details.weekday ? (
                          <Text style={styles.infoSubValue}>{details.weekday}</Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    style={styles.infoCard}
                    testID="info-location-card"
                    onPress={() => setInfoModal('location')}
                  >
                    <View style={styles.infoValueRow}>
                      <MaterialCommunityIcons name="map-marker" size={22} color={Colors.WHITE} />
                      <View style={styles.infoTextCol}>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {details.location}
                        </Text>
                        <Text style={styles.infoSubValue} numberOfLines={1}>
                          {details.locationAddress}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>

                {details.schedule.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
                    <View style={styles.scheduleCard}>
                      {details.schedule.map((item, index) => (
                        <View key={index} style={styles.scheduleRow}>
                          <Text style={styles.scheduleLabel}>{item.label}</Text>
                          <Text style={styles.scheduleTime}>{item.time}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

              </>
            )}

            {tabKey === 'Divisions' && (
              <>
                {registrations.length > 0 && (
                  <View style={styles.sectionFirst} testID="active-divisions">
                    <Text style={styles.sectionTitle}>Your divisions</Text>
                    <View style={styles.divisionsCard}>
                      {registrations.map((reg) => {
                        const dueLabel = formatPaymentDueAt(reg.payment_due_at);
                        const unpaid = reg.payment_status === 'unpaid';
                        return (
                          <View
                            key={reg.id_registration}
                            style={styles.divisionRow}
                            testID={`active-division-${reg.id_registration}`}
                          >
                            <View style={styles.divisionLabelCol}>
                              <DivisionColorBadge
                                name={registrationDivisionLabel(reg, event)}
                                color={divisionColorFor(reg)}
                                testID={`active-division-badge-${reg.id_registration}`}
                              />
                              {unpaid && dueLabel ? (
                                <Text
                                  style={[
                                    styles.dueText,
                                    reg.is_overdue && styles.overdueText,
                                  ]}
                                  testID={`payment-due-${reg.id_registration}`}
                                >
                                  {reg.is_overdue
                                    ? `Overdue · was due ${dueLabel}`
                                    : `Pay by ${dueLabel}`}
                                </Text>
                              ) : null}
                              {unpaid && (reg.redemptions?.length ?? 0) > 0
                                ? reg.redemptions!.map((r) => (
                                    <Text
                                      key={`${reg.id_registration}-${r.benefit_definition_id}-${r.benefit_name}`}
                                      style={styles.redemptionText}
                                    >
                                      {r.benefit_name}: -RON {r.amount_ron}
                                    </Text>
                                  ))
                                : null}
                            </View>
                            <Text style={styles.divisionStatus}>
                              {reg.payment_status === 'paid'
                                ? 'Paid'
                                : reg.payment_status === 'awaiting_proof_review'
                                  ? 'Pending review'
                                  : reg.payment_status === 'unpaid'
                                    ? reg.is_overdue
                                      ? 'Overdue'
                                      : `Unpaid · RON ${reg.amount_due}`
                                    : reg.payment_status}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                <View
                  style={registrations.length > 0 ? styles.section : styles.sectionFirst}
                  testID="event-divisions-catalog"
                >
                  <Text style={styles.sectionTitle}>All divisions</Text>
                  <DivisionGroupsList
                    readonly
                    divisions={divisionOptions}
                    divisionStates={divisionStates}
                  />
                </View>
              </>
            )}

            {tabKey === 'Description' && (
              <View style={styles.sectionFirst} testID="event-description">
                <Text style={styles.sectionTitle}>About the Event</Text>
                {details.eventDescription ? (
                  <RenderHtml
                    contentWidth={descriptionContentWidth}
                    source={{ html: details.eventDescription }}
                    tagsStyles={htmlTagsStyles}
                    defaultTextProps={{ style: styles.description }}
                    allowedStyles={[]}
                    domVisitors={htmlDomVisitors}
                    renderersProps={htmlRenderersProps}
                  />
                ) : (
                  <Text style={styles.emptyText}>No description yet.</Text>
                )}
              </View>
            )}

            {tabKey === 'Deadlines' && (
              <View style={styles.sectionFirst} testID="event-deadlines">
                <Text style={styles.sectionTitle}>Important timestamps</Text>

                <View style={styles.deadlinesColumn} testID="deadlines-column">
                  {unpaidWithDue.length > 0 ? (
                    <View style={styles.deadlinesColumn} testID="deadline-payments">
                      {unpaidWithDue.map((reg) => {
                        const dueLabel = formatPaymentDueAt(reg.payment_due_at);
                        return (
                          <View
                            key={reg.id_registration}
                            style={styles.deadlineCard}
                            testID={`deadline-payment-${reg.id_registration}`}
                          >
                            <View style={styles.deadlineTitleRow}>
                              <Text style={styles.deadlineBlockTitle}>
                                {reg.is_overdue ? 'Overdue' : 'Payment due'}
                              </Text>
                              <Text
                                style={[
                                  styles.deadlineTimestamp,
                                  reg.is_overdue && styles.overdueText,
                                ]}
                              >
                                {dueLabel}
                              </Text>
                            </View>
                            <DivisionColorBadge
                              name={registrationDivisionLabel(reg, event)}
                              color={divisionColorFor(reg)}
                              testID={`deadline-payment-badge-${reg.id_registration}`}
                            />
                          </View>
                        );
                      })}
                    </View>
                  ) : null}

                  <View
                    style={styles.deadlineCard}
                    testID="deadline-cancellation-card"
                  >
                    <View style={styles.deadlineTitleRow}>
                      <Text style={styles.deadlineBlockTitle}>Cancellation until</Text>
                      <Text style={styles.deadlineTimestamp} testID="cancellation-until">
                        {cancellationClosesLabel ?? '—'}
                      </Text>
                    </View>
                    <Text style={styles.deadlineCopy}>{CANCELLATION_DEADLINE_COPY}</Text>
                  </View>

                  <View
                    style={styles.deadlineCard}
                    testID="deadline-registration-card"
                  >
                    <View style={styles.deadlineTitleRow}>
                      <Text style={styles.deadlineBlockTitle}>Registration until</Text>
                      <Text style={styles.deadlineTimestamp} testID="registration-until">
                        {registrationClosesLabel ?? '—'}
                      </Text>
                    </View>
                    <Text style={styles.deadlineCopy}>{REGISTRATION_DEADLINE_COPY}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {showCancel && (
            <Pressable
              testID="open-cancel-registration"
              style={styles.cancelLink}
              onPress={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
            >
              <Text style={styles.cancelLinkText}>
                {registrations.length > 1 ? 'Cancel Registrations' : 'Cancel Registration'}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* CTA bar — loader until event + level + regs settle */}
      {!ctaSettled ? (
        <View style={styles.ctaBar} testID="cta-loading">
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : cta ? (
        <View style={styles.ctaBar} testID="cta-bar">
          <Button
            label={cta.label}
            variant={
              cta.variant === 'grey'
                ? 'primary'
                : cta.disabled
                  ? 'disabled'
                  : 'primary'
            }
            disabled={cta.disabled}
            loading={levelStarting}
            testID="event-cta"
            onPress={() => {
              if (cta.disabled) return;
              const target = cta.target;
              if (!target) return;
              if (!isAuthed) {
                setLoginOpen(true);
                return;
              }
              // Assess my level / Register: Discovery first when it is incomplete.
              if (target.screen === 'assessment') {
                void startLevelFlow('assessment', Number(id));
                return;
              }
              if (target.initialStep == null) {
                void startLevelFlow('registration', Number(id));
                return;
              }
              router.push(
                eventRegistrationPath(Number(id), target.initialStep) as any
              );
            }}
            style={
              cta.variant === 'orange'
                ? styles.ctaOrange
                : cta.variant === 'grey'
                  ? styles.ctaGrey
                  : undefined
            }
            icon={cta.showClockIcon ? <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.WHITE} /> : undefined}
          />
        </View>
      ) : null}

      <CancelRegistrationModal
        visible={cancelOpen}
        submitting={cancelling}
        error={cancelError}
        registrations={cancelTargets}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />

      <ShareReferralModal
        visible={shareOpen}
        eventId={eventId}
        eventName={event.name}
        eventSlug={event.slug}
        onClose={() => setShareOpen(false)}
      />

      <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />

      <Modal
        visible={infoModal != null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View style={styles.infoModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setInfoModal(null)}
            testID="info-modal-backdrop"
          />
          <View style={styles.infoModalCard} testID="info-detail-modal">
            {infoModal === 'date' ? (
              <>
                <Text style={styles.infoModalTitle}>Date</Text>
                <Text style={styles.infoModalBody} testID="info-modal-date">
                  {details.date}
                  {details.weekday ? ` · ${details.weekday}` : ''}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.infoModalTitle}>Location</Text>
                <Text style={styles.infoModalBody} testID="info-modal-location-name">
                  {details.location}
                </Text>
                <Text style={styles.infoModalSub} testID="info-modal-location-address">
                  {details.locationAddress}
                </Text>
              </>
            )}
            <Pressable
              style={styles.infoModalClose}
              onPress={() => setInfoModal(null)}
              testID="info-modal-close"
            >
              <Text style={styles.infoModalCloseLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
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
  coverWrap: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.GRAY,
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
  hero: {
    paddingHorizontal: 16,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 12,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  heroMetaRight: {
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  heroMetaText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM_80,
  },
  heroMetaTextRight: {
    flexShrink: 1,
    textAlign: 'right',
  },
  tabBar: {
    marginTop: 16,
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
  stickyChrome: {
    backgroundColor: Colors.DARK_GRAY,
    paddingBottom: 0,
  },
  titleAboveTabs: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.SCREEN_TITLE,
    lineHeight: 22,
    color: Colors.WHITE,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  heroDateUnderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  deadlinesColumn: {
    gap: 12,
  },
  infoModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  infoModalTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  infoModalBody: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  infoModalSub: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  infoModalClose: {
    marginTop: 12,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.CREAM_10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoModalCloseLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },

  infoTextCol: {
    flex: 1,
    gap: 2,
  },
  infoSubValue: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  deadlineCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 12,
    padding: 14,
  },
  deadlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  deadlineBlockTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    flexShrink: 1,
  },
  deadlineTimestamp: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM_60,
  },
  deadlineCopy: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 20,
    color: Colors.CREAM_60,
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
  sectionFirst: {
    marginTop: 24,
  },
  emptyText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  sectionTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  divisionsCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  divisionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 24,
  },
  divisionLabelCol: {
    flex: 1,
    paddingRight: 12,
    gap: 4,
  },
  divisionLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  dueText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  overdueText: {
    color: Colors.RED,
  },
  redemptionText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.BADGE_GREEN,
  },
  divisionStatus: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    textAlign: 'right',
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
  ctaGrey: {
    backgroundColor: Colors.GRAY,
  },
  cancelLink: {
    marginTop: 24,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.RED_T,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLinkText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
  },
});
