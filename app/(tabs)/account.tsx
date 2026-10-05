import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { useAuth } from '@/context/auth';
import Button from '@/components/Buttons/Button';
import LoginOptions from '@/components/Login/LoginOptions';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import { fetchEventHistory } from '@/services/eventHistory';
import { confirmAsync } from '@/services/confirm';
import { ApiError } from '@/services/apiError';
import { identityListLabel } from '@/services/playerMapping';
import {
  useIdentities,
  useUnlinkIdentityMutation,
} from '@/services/hooks/useIdentities';
import { queryKeys } from '@/lib/queryClient';
import { formatDateHuman } from '@/services/mappers';
import { eventDetailPath } from '@/utils/eventPaths';
import type { EventHistoryItem, PlayerIdentity } from '@/types/api';

function InfoCard({
  label,
  value,
  showLock,
}: {
  label: string;
  value: string;
  showLock?: boolean;
}) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      {showLock && (
        <View style={styles.lockIconAbsolute}>
          <FontAwesome name="lock" size={20} color={Colors.CREAM_60} />
        </View>
      )}
    </View>
  );
}

function formatLinkedAt(linkedAt: number): string {
  return new Date(linkedAt * 1000).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IdentityDetailsModal({
  identity,
  visible,
  onClose,
  onUnlink,
  unlinkBusy,
  canUnlink,
  unlinkError,
}: {
  identity: PlayerIdentity | null;
  visible: boolean;
  onClose: () => void;
  onUnlink: () => void;
  unlinkBusy: boolean;
  canUnlink: boolean;
  unlinkError?: string | null;
}) {
  if (!identity) return null;

  const dismiss = () => {
    if (unlinkBusy) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={styles.modalBackdrop} onPress={dismiss}>
        <Pressable style={styles.modalCard} onPress={() => undefined}>
          <Text style={styles.modalTitle}>Google account</Text>
          {identity.email ? (
            <Text style={styles.modalRow}>
              <Text style={styles.modalLabel}>Email </Text>
              {identity.email}
            </Text>
          ) : null}
          {identity.display_name ? (
            <Text style={styles.modalRow}>
              <Text style={styles.modalLabel}>Name </Text>
              {identity.display_name}
            </Text>
          ) : null}
          <Text style={styles.modalRow}>
            <Text style={styles.modalLabel}>Linked </Text>
            {formatLinkedAt(identity.linked_at)}
          </Text>

          {unlinkError ? (
            <Text style={styles.unlinkError} testID="identity-unlink-error">
              {unlinkError}
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            {canUnlink ? (
              <Button
                label={unlinkBusy ? 'Unlinking…' : 'Unlink'}
                onPress={onUnlink}
                disabled={unlinkBusy}
                style={styles.unlinkButton}
                labelStyle={styles.unlinkButtonLabel}
              />
            ) : null}
            <Button
              label="Close"
              onPress={dismiss}
              disabled={unlinkBusy}
              style={styles.modalCloseButton}
              labelStyle={styles.modalCloseLabel}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function GuestAccountBody() {
  return (
    <View style={styles.guestBody} testID="account-guest-login">
      <Image
        source={require('@/assets/images/logos/logo.png')}
        style={styles.guestLogo}
      />
      <Text style={styles.guestHeading}>Welcome to Padeliz</Text>
      <Text style={styles.guestSubtitle}>
        Join padel events, track tournaments, and connect with players
      </Text>
      <LoginOptions style={styles.guestLogin} />
      <Text style={styles.guestFooter}>
        By continuing, you agree to our Terms of Service
      </Text>
    </View>
  );
}

function linkErrorAlert(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 409 || err.status === 422) {
      Alert.alert('Could not link account', err.message);
      return;
    }
  }
  Alert.alert('Could not link account', 'Something went wrong. Please try again.');
}

function unlinkErrorAlert(err: unknown) {
  if (err instanceof ApiError && err.status === 422) {
    Alert.alert('Could not unlink', err.message);
    return;
  }
  Alert.alert('Could not unlink', 'Something went wrong. Please try again.');
}

function ProfileAccountBody() {
  const { user, signOut, obtainGoogleIdToken, linkGoogleIdentity } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const viewer = user ? String(user.id) : 'guest';
  const player = user?.player;
  const [avatarError, setAvatarError] = useState(false);
  const [history, setHistory] = useState<EventHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedIdentity, setSelectedIdentity] = useState<PlayerIdentity | null>(null);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const { data: identities, loading: identitiesLoading, refetch: refetchIdentities } =
    useIdentities();
  const unlinkMutation = useUnlinkIdentityMutation();

  const googleIdentities = useMemo(
    () => (identities ?? []).filter((i) => i.provider === 'google'),
    [identities]
  );

  const nickname = user?.name ?? 'Player';
  const userId = player ? `#${String(player.id_player).padStart(5, '0')}` : '—';
  const emailDisplay = user?.email?.trim() ? user.email : 'Not set';
  const phoneDisplay = user?.phone?.trim() ? user.phone : 'Not set';

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetchEventHistory(1);
      setHistory(res.data ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleLinkAnother = async () => {
    setLinkBusy(true);
    try {
      const idToken = await obtainGoogleIdToken();
      await linkGoogleIdentity(idToken);
      void refetchIdentities();
      void queryClient.invalidateQueries({ queryKey: queryKeys.identities.all(viewer) });
    } catch (e) {
      linkErrorAlert(e);
    } finally {
      setLinkBusy(false);
    }
  };

  const canUnlinkSelected =
    selectedIdentity != null &&
    googleIdentities.filter((i) => i.provider === selectedIdentity.provider).length > 1;

  const handleUnlink = async () => {
    if (!selectedIdentity || !canUnlinkSelected) return;
    const confirmed = await confirmAsync(
      'Unlink Google account',
      'You can link it again later from this screen.'
    );
    if (!confirmed) return;

    setUnlinkError(null);
    try {
      await unlinkMutation.mutateAsync(selectedIdentity.id_identity);
      setSelectedIdentity(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.identities.all(viewer) });
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
      setUnlinkError(message);
      unlinkErrorAlert(e);
    }
  };

  const handleSignOut = async () => {
    const confirmed = await confirmAsync(
      'Sign out',
      'You will need to sign in again to register or manage your account.'
    );
    if (!confirmed) return;

    setSignOutBusy(true);
    try {
      await signOut();
    } finally {
      setSignOutBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer} testID="account-avatar">
          {user?.picture && !avatarError ? (
            <Image
              source={{ uri: user.picture }}
              style={styles.avatar}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <FontAwesome name="user" size={36} color={Colors.CREAM_60} />
            </View>
          )}
          <View style={styles.avatarLock} testID="account-avatar-lock">
            <FontAwesome name="lock" size={14} color={Colors.CREAM_60} />
          </View>
        </View>
        <View style={styles.nicknameContainer}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.userId}>ID: {userId}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Linked Google Accounts</Text>

        {identitiesLoading ? (
          <ActivityIndicator color={Colors.BLUE} />
        ) : googleIdentities.length === 0 ? (
          <Text style={styles.emptyIdentities} testID="google-identities-empty">
            No Google accounts linked yet.
          </Text>
        ) : (
          <View style={styles.identityList} testID="google-identities-list">
            {googleIdentities.map((identity) => (
              <Pressable
                key={identity.id_identity}
                style={styles.accountCard}
                testID={`google-identity-${identity.id_identity}`}
                onPress={() => setSelectedIdentity(identity)}
              >
                <Image
                  source={require('@/assets/images/google-icon.png')}
                  style={styles.googleIcon}
                />
                <View style={styles.accountInfo}>
                  <Text style={styles.accountEmail} numberOfLines={1}>
                    {identityListLabel(identity)}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={14} color={Colors.CREAM_60} />
              </Pressable>
            ))}
          </View>
        )}

        <Button
          label="Link Another Account"
          icon={<FontAwesome name="plus" size={14} color={Colors.BLUE} />}
          style={styles.linkButton}
          labelStyle={styles.linkButtonLabel}
          onPress={() => void handleLinkAnother()}
          disabled={linkBusy}
          testID="link-google-account"
        />
        {linkBusy ? (
          <ActivityIndicator color={Colors.BLUE} style={{ marginTop: 8 }} />
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoCards}>
          <InfoCard label="Full Name" value={user?.name ?? 'N/A'} showLock />
          <InfoCard label="Email" value={emailDisplay} showLock />
          <InfoCard label="Phone Number" value={phoneDisplay} showLock />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event History</Text>

        {historyLoading ? (
          <ActivityIndicator color={Colors.BLUE} style={{ marginTop: 16 }} />
        ) : (
          <View style={styles.historyCards} testID="event-history-list">
            {history.length === 0 ? (
              <Text style={styles.emptyHistory}>No past events yet.</Text>
            ) : (
              history.map((event) => (
                <Pressable
                  key={event.id_event}
                  style={styles.historyCard}
                  testID={`event-history-${event.id_event}`}
                  onPress={() =>
                    router.push(
                      eventDetailPath(Number(event.id_event), event.slug) as any
                    )
                  }
                >
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyName} numberOfLines={1}>
                      {event.name}
                    </Text>
                    <Text style={styles.historyDate}>
                      {formatDateHuman(event.date)}
                    </Text>
                  </View>
                  <Text style={styles.historyResult}>
                    {(event.division_titles ?? []).join(' · ') || '—'}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      </View>

      <Pressable
        style={[styles.signOutButton, signOutBusy && styles.signOutDisabled]}
        onPress={() => void handleSignOut()}
        disabled={signOutBusy}
        testID="account-sign-out"
      >
        {signOutBusy ? (
          <ActivityIndicator color={Colors.RED} />
        ) : (
          <>
            <FontAwesome name="sign-out" size={16} color={Colors.RED} />
            <Text style={styles.signOutLabel}>Sign Out</Text>
          </>
        )}
      </Pressable>

      <IdentityDetailsModal
        identity={selectedIdentity}
        visible={selectedIdentity !== null}
        onClose={() => {
          setUnlinkError(null);
          setSelectedIdentity(null);
        }}
        onUnlink={() => void handleUnlink()}
        unlinkBusy={unlinkMutation.isPending}
        canUnlink={canUnlinkSelected}
        unlinkError={unlinkError}
      />
    </ScrollView>
  );
}

export default function AccountScreen() {
  const { user, isLoading } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Account" variant="root" />

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.BLUE} />
        </View>
      ) : user ? (
        <ProfileAccountBody />
      ) : (
        <GuestAccountBody />
      )}
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
  scrollContent: {
    paddingBottom: 32,
  },
  guestBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestLogo: {
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },
  guestHeading: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: 28,
    color: Colors.WHITE,
    textAlign: 'center',
    marginTop: 24,
  },
  guestSubtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  guestLogin: {
    marginTop: 40,
  },
  guestFooter: {
    marginTop: 32,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_T,
    textAlign: 'center',
  },

  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    backgroundColor: Colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameContainer: {
    marginLeft: 16,
  },
  nickname: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    color: Colors.WHITE,
  },
  userId: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 2,
  },

  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },

  identityList: {
    gap: 12,
  },
  accountCard: {
    minHeight: 76,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  googleIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.CREAM_60,
  },
  accountInfo: {
    marginLeft: 12,
    flex: 1,
  },
  accountEmail: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  emptyIdentities: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginBottom: 8,
  },
  linkButton: {
    backgroundColor: Colors.GRAY,
    marginTop: 12,
  },
  linkButtonLabel: {
    color: Colors.BLUE,
  },

  tooltipContainer: {
    position: 'absolute',
    right: 30,
    top: -15,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: Colors.WHITE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#d9d9d9',
  },
  tooltipTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: '#000',
    textAlign: 'center',
  },
  tooltipSubtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: '#000',
    textAlign: 'center',
  },
  tooltipBeak: {
    width: 8,
    height: 8,
    backgroundColor: Colors.WHITE,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#d9d9d9',
    marginLeft: -4,
  },

  infoCards: {
    gap: 11,
    marginTop: 16,
  },
  infoCard: {
    height: 80,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  infoLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  infoValue: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    marginTop: 4,
  },
  lockIconAbsolute: {
    position: 'absolute',
    right: 16,
    top: 28,
  },

  historyCards: {
    gap: 12,
    marginTop: 16,
  },
  historyCard: {
    minHeight: 84,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyName: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    flex: 1,
    marginRight: 8,
  },
  historyDate: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  historyResult: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 8,
  },
  emptyHistory: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 8,
  },

  signOutButton: {
    marginTop: 32,
    marginHorizontal: 16,
    height: 56,
    backgroundColor: Colors.RED_T,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  signOutDisabled: {
    opacity: 0.7,
  },
  signOutLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.RED,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  modalRow: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    marginTop: 6,
  },
  modalLabel: {
    color: Colors.CREAM_60,
  },
  modalActions: {
    marginTop: 20,
    gap: 10,
  },
  unlinkButton: {
    backgroundColor: Colors.RED_T,
  },
  unlinkButtonLabel: {
    color: Colors.RED,
  },
  modalCloseButton: {
    backgroundColor: Colors.DARK_GRAY,
  },
  modalCloseLabel: {
    color: Colors.WHITE,
  },
  unlinkError: {
    marginTop: 12,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.RED,
  },
  avatarLock: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: 10,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
