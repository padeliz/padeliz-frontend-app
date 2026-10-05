/**
 * Share modal with tabs: Share event | Share referral.
 * Event link uses EXPO_PUBLIC_BASE_URL; referral requires auth.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  Share,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import LoginOptions from '@/components/Login/LoginOptions';
import { useAuth } from '@/context/auth';
import { confirmAsync } from '@/services/confirm';
import {
  createReferralCode,
  eventShareUrl,
  fetchReferralCodes,
  referralShareUrl,
  revokeReferralCode,
} from '@/services/referral';
import type { EventReferralCode, ReferralInviteeInput } from '@/types/api';

type InviteeDraft = { email: string; phone: string };
type TabKey = 'event' | 'referral';

type Props = {
  visible: boolean;
  eventId: number;
  eventName?: string;
  eventSlug?: string | null;
  onClose: () => void;
};

function formatExpiry(expiresAt: number): string {
  return new Date(expiresAt * 1000).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function copyText(text: string): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // fall through to Share
  }
  await Share.share({ message: text });
}

export default function ShareReferralModal({
  visible,
  eventId,
  eventName,
  eventSlug = null,
  onClose,
}: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('event');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingSlots, setRemainingSlots] = useState(0);
  const [codes, setCodes] = useState<EventReferralCode[]>([]);
  const [invitees, setInvitees] = useState<InviteeDraft[]>([
    { email: '', phone: '' },
  ]);
  const [copied, setCopied] = useState<string | null>(null);

  const eventUrl = eventShareUrl(eventId, eventSlug);
  const referralSubtitle = `Invite newcomers join ${eventName ?? 'this event'} with your personal code.`;

  const dismiss = () => {
    if (busy) return;
    onClose();
  };

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReferralCodes(eventId);
      setRemainingSlots(data.remaining_slots);
      setCodes(data.codes ?? []);
    } catch (e) {
      setError((e as Error).message || 'Could not load referral codes.');
    } finally {
      setLoading(false);
    }
  }, [eventId, user]);

  useEffect(() => {
    if (!visible) return;
    setTab('event');
    setInvitees([{ email: '', phone: '' }]);
    setCopied(null);
    setError(null);
    if (user) void load();
  }, [visible, load, user]);

  const maxInvitees = Math.max(1, Math.min(6, remainingSlots || 1));

  const addInvitee = () => {
    if (invitees.length >= maxInvitees) return;
    setInvitees((prev) => [...prev, { email: '', phone: '' }]);
  };

  const updateInvitee = (index: number, patch: Partial<InviteeDraft>) => {
    setInvitees((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  };

  const removeInvitee = (index: number) => {
    setInvitees((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const handleCreate = async () => {
    const payload: ReferralInviteeInput[] = invitees
      .map((row) => ({
        email: row.email.trim() || null,
        phone: row.phone.trim() || null,
      }))
      .filter((row) => row.email || row.phone);

    if (payload.length === 0) {
      setError('Add at least one invitee with email or phone.');
      return;
    }
    if (remainingSlots <= 0) {
      setError('No referral slots remaining for this event.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const created = await createReferralCode(eventId, payload);
      setRemainingSlots(created.remaining_slots);
      setCodes((prev) => [created.code, ...prev]);
      setInvitees([{ email: '', phone: '' }]);
    } catch (e) {
      setError((e as Error).message || 'Could not create referral code.');
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (code: EventReferralCode) => {
    const confirmed = await confirmAsync(
      'Revoke code?',
      'Players won’t be able to use this referral code.'
    );
    if (!confirmed) return;

    setBusy(true);
    setError(null);
    try {
      const result = await revokeReferralCode(code.id_referral_code);
      setRemainingSlots(result.remaining_slots);
      setCodes((prev) =>
        prev.map((c) =>
          c.id_referral_code === code.id_referral_code ? result.code : c
        )
      );
    } catch (e) {
      setError((e as Error).message || 'Could not revoke the code.');
    } finally {
      setBusy(false);
    }
  };

  const handleShareEvent = async () => {
    await Share.share({
      message: eventName
        ? `Join ${eventName}: ${eventUrl}`
        : `Join on Padeliz: ${eventUrl}`,
    });
  };

  const handleCopyEvent = async () => {
    await copyText(eventUrl);
    setCopied('event');
  };

  const handleShareExisting = async (code: EventReferralCode) => {
    const link = referralShareUrl(eventId, code.code, eventSlug);
    await Share.share({
      message: eventName
        ? `Join me at ${eventName}: ${link}`
        : `Join me on Padeliz: ${link}`,
    });
  };

  const handleCopyReferral = async (code: EventReferralCode) => {
    const link = referralShareUrl(eventId, code.code, eventSlug);
    await copyText(link);
    setCopied(`code-${code.id_referral_code}`);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="share-referral-modal">
          <View style={styles.tabs} testID="share-modal-tabs">
            <Pressable
              style={[styles.tab, tab === 'event' && styles.tabActive]}
              onPress={() => setTab('event')}
              testID="share-tab-event"
            >
              <Text style={[styles.tabLabel, tab === 'event' && styles.tabLabelActive]}>
                Share event
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, tab === 'referral' && styles.tabActive]}
              onPress={() => setTab('referral')}
              testID="share-tab-referral"
            >
              <Text style={[styles.tabLabel, tab === 'referral' && styles.tabLabelActive]}>
                Share referral
              </Text>
            </Pressable>
          </View>

          {tab === 'event' ? (
            <View style={styles.eventTab} testID="share-event-panel">
              <Text style={styles.eventSubtitle}>
                Share a link to this event. Anyone can open it in the browser.
              </Text>
              <View style={styles.rowActions}>
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => void handleCopyEvent()}
                  testID="copy-event-link"
                >
                  <Text style={styles.secondaryBtnText}>
                    {copied === 'event' ? 'Copied' : 'Copy link'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.primaryBtn}
                  onPress={() => void handleShareEvent()}
                  testID="share-event-link"
                >
                  <Text style={styles.primaryBtnText}>Share</Text>
                </Pressable>
              </View>
            </View>
          ) : !user ? (
            <View style={styles.guestReferral} testID="share-referral-guest">
              <Text style={styles.subtitle}>{referralSubtitle}</Text>
              <Text style={styles.guestHint}>Sign in to create and share referral codes.</Text>
              <LoginOptions style={{ marginTop: 16 }} />
            </View>
          ) : (
            <>
              <Text style={styles.subtitle} testID="share-referral-subtitle">
                {referralSubtitle}
              </Text>
              <Text style={styles.slotsLine}>
                Slots left: <Text style={styles.slots}>{remainingSlots}</Text>
              </Text>

              {loading ? (
                <ActivityIndicator color={Colors.BLUE} style={{ marginVertical: 24 }} />
              ) : (
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                  {error ? (
                    <Text style={styles.error} testID="share-referral-error">
                      {error}
                    </Text>
                  ) : null}

                  {remainingSlots > 0 ? (
                    <View style={styles.createBlock}>
                      <Text style={styles.sectionLabel}>
                        Invitees (1–{maxInvitees})
                      </Text>
                      {invitees.map((row, index) => (
                        <View key={index} style={styles.inviteeRow}>
                          <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.INACTIVE}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={row.email}
                            onChangeText={(text) => updateInvitee(index, { email: text })}
                            testID={`invitee-email-${index}`}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Phone"
                            placeholderTextColor={Colors.INACTIVE}
                            keyboardType="phone-pad"
                            value={row.phone}
                            onChangeText={(text) => updateInvitee(index, { phone: text })}
                            testID={`invitee-phone-${index}`}
                          />
                          {invitees.length > 1 ? (
                            <Pressable onPress={() => removeInvitee(index)} hitSlop={8}>
                              <Text style={styles.remove}>Remove</Text>
                            </Pressable>
                          ) : null}
                        </View>
                      ))}
                      <View style={styles.createActionsRow} testID="create-invitee-actions">
                        {invitees.length < maxInvitees ? (
                          <Pressable onPress={addInvitee} testID="add-invitee">
                            <Text style={styles.addLink}>+ Add invitee</Text>
                          </Pressable>
                        ) : (
                          <View />
                        )}
                        <Pressable
                          style={[
                            styles.createCodeBtn,
                            busy && styles.btnDisabled,
                          ]}
                          disabled={busy}
                          onPress={() => void handleCreate()}
                          testID="create-referral-code"
                        >
                          <Text style={styles.primaryBtnText}>
                            {busy ? 'Creating…' : 'Create code'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.emptySlots}>
                      No referral discount slots left for this event.
                    </Text>
                  )}

                  {codes.length > 0 ? (
                    <View style={styles.listBlock}>
                      <Text style={styles.sectionLabel}>Your codes</Text>
                      {codes.map((code) => {
                        const revoked = code.revoked_at != null;
                        const expired = code.expires_at <= Math.floor(Date.now() / 1000);
                        return (
                          <View
                            key={code.id_referral_code}
                            style={styles.codeCard}
                            testID={`referral-code-${code.id_referral_code}`}
                          >
                            <Text style={styles.codeValue}>{code.code}</Text>
                            <Text style={styles.codeMeta}>
                              {revoked
                                ? 'Revoked'
                                : expired
                                  ? 'Expired'
                                  : `Expires ${formatExpiry(code.expires_at)}`}
                              {' · '}
                              {(code.invitees?.length ?? 0)} invitee
                              {(code.invitees?.length ?? 0) === 1 ? '' : 's'}
                            </Text>
                            {!revoked && !expired ? (
                              <View style={styles.codeActions}>
                                <Pressable
                                  onPress={() => void handleCopyReferral(code)}
                                  testID={`copy-referral-${code.id_referral_code}`}
                                >
                                  <Text style={styles.addLink}>
                                    {copied === `code-${code.id_referral_code}`
                                      ? 'Copied'
                                      : 'Copy link'}
                                  </Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => void handleShareExisting(code)}
                                  testID={`share-referral-${code.id_referral_code}`}
                                >
                                  <Text style={styles.addLink}>Share</Text>
                                </Pressable>
                                <Pressable
                                  onPress={() => void handleRevoke(code)}
                                  disabled={busy}
                                  testID={`revoke-referral-${code.id_referral_code}`}
                                >
                                  <Text style={styles.revoke}>Revoke</Text>
                                </Pressable>
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ) : null}
                </ScrollView>
              )}
            </>
          )}

          <Pressable
            style={[styles.closeBtn, busy && styles.btnDisabled]}
            onPress={dismiss}
            disabled={busy}
            testID="close-share-referral"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
    gap: 16,
  },
  tab: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.BLUE,
  },
  tabLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM_60,
  },
  tabLabelActive: {
    fontFamily: Fonts.FONT_MEDIUM,
    color: Colors.WHITE,
  },
  eventTab: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  eventSubtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    lineHeight: 20,
  },
  guestReferral: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  guestHint: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  slotsLine: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  slots: {
    color: Colors.WHITE,
    fontFamily: Fonts.FONT_MEDIUM,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 12,
  },
  createActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 4,
  },
  createCodeBtn: {
    flexShrink: 0,
    minWidth: 140,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.CREAM_10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  scroll: {
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  error: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
  },
  createBlock: {
    gap: 10,
  },
  sectionLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  inviteeRow: {
    gap: 8,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
  },
  input: {
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.WHITE_05,
    paddingHorizontal: 12,
    color: Colors.WHITE,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
  },
  remove: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.RED,
    marginTop: 4,
  },
  addLink: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.BLUE,
  },
  primaryBtn: {
    marginTop: 4,
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  emptySlots: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  listBlock: {
    gap: 10,
  },
  codeCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  codeValue: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  codeMeta: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  revoke: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
  },
  closeBtn: {
    marginTop: 8,
    marginHorizontal: 16,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.CREAM_20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
