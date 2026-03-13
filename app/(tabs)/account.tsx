import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/auth';
import Button from '@/components/Buttons/Button';

const MOCK_PROFILE = {
  nickname: 'Cosmologus',
  userId: '#00001',
  birthdate: '15 October 1997',
  phone: '+40 754 797 699',
  isStudent: false,
};

const MOCK_EVENT_HISTORY = [
  {
    id: '1',
    name: 'ARSH Padel MiniTour #20',
    date: '05 April 2025',
    result: 'Semi-finalist',
  },
  {
    id: '2',
    name: 'ARSH Padel MiniTour #18',
    date: '09 February 2025',
    result: 'Quarter-finalist',
  },
];

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

export default function AccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isStudent, setIsStudent] = useState(MOCK_PROFILE.isStudent);
  const [showTooltip, setShowTooltip] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScrollBeginDrag={() => showTooltip && setShowTooltip(false)}
      >
        {/* Avatar & Nickname */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
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
            <Pressable style={styles.cameraButton}>
              <FontAwesome name="camera" size={14} color={Colors.WHITE} />
            </Pressable>
          </View>
          <View style={styles.nicknameContainer}>
            <Text style={styles.nickname}>{MOCK_PROFILE.nickname}</Text>
            <Text style={styles.userId}>ID: {MOCK_PROFILE.userId}</Text>
          </View>
        </View>

        {/* Linked Google Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Linked Google Accounts</Text>
            <View>
              <Pressable
                onPress={() => setShowTooltip((prev) => !prev)}
                hitSlop={8}
              >
                <FontAwesome name="lock" size={18} color={Colors.CREAM_60} />
              </Pressable>
              {showTooltip && (
                <View style={styles.tooltipContainer}>
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipTitle}>private section</Text>
                    <Text style={styles.tooltipSubtitle}>
                      visible for you only
                    </Text>
                  </View>
                  <View style={styles.tooltipBeak} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.accountCard}>
            <Image
              source={require('@/assets/images/google-icon.png')}
              style={styles.googleIcon}
            />
            <View style={styles.accountInfo}>
              <Text style={styles.accountEmail} numberOfLines={1}>
                {user?.email ?? 'No email'}
              </Text>
              <Text style={styles.accountSubtitle}>Primary Account</Text>
            </View>
            <FontAwesome
              name="check-circle"
              size={16}
              color={Colors.BLUE}
              style={styles.checkIcon}
            />
          </View>

          <Button
            label="Link Another Account"
            icon={<FontAwesome name="plus" size={14} color={Colors.BLUE} />}
            style={styles.linkButton}
            labelStyle={styles.linkButtonLabel}
          />
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCards}>
            <InfoCard label="Full Name" value={user?.name ?? 'N/A'} />
            <InfoCard
              label="Birthdate"
              value={MOCK_PROFILE.birthdate}
              showLock
            />
            <InfoCard
              label="Phone Number"
              value={MOCK_PROFILE.phone}
              showLock
            />
          </View>

          <Pressable
            style={styles.studentRow}
            onPress={() => setIsStudent((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isStudent }}
          >
            <Text style={styles.studentText}>
              High School / University student
            </Text>
            <View style={styles.checkboxTouchTarget}>
              <View
                style={[
                  styles.checkbox,
                  isStudent && styles.checkboxChecked,
                ]}
              >
                {isStudent && (
                  <FontAwesome name="check" size={12} color={Colors.WHITE} />
                )}
              </View>
            </View>
          </Pressable>
        </View>

        {/* Event History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event History</Text>

          <View style={styles.historyCards}>
            {MOCK_EVENT_HISTORY.map((event) => (
              <View key={event.id} style={styles.historyCard}>
                <View style={styles.historyTopRow}>
                  <Text style={styles.historyName} numberOfLines={1}>
                    {event.name}
                  </Text>
                  <Text style={styles.historyDate}>{event.date}</Text>
                </View>
                <Text style={styles.historyResult}>{event.result}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <Pressable style={styles.signOutButton} onPress={async () => {
          await signOut();
          router.replace('/');
        }}>
          <FontAwesome name="sign-out" size={16} color={Colors.RED} />
          <Text style={styles.signOutLabel}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.DARK_GRAY,
  },
  header: {
    height: 53,
    paddingLeft: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.CREAM_10,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Avatar & Nickname
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
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
  cameraButton: {
    position: 'absolute',
    left: 48,
    top: 48,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.BLUE,
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

  // Sections
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

  // Linked Google Accounts
  accountCard: {
    height: 76,
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
  accountSubtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  checkIcon: {
    marginLeft: 12,
  },
  linkButton: {
    backgroundColor: Colors.GRAY,
    marginTop: 12,
  },
  linkButtonLabel: {
    color: Colors.BLUE,
  },

  // Tooltip
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

  // Personal Information
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

  // Student checkbox
  studentRow: {
    height: 56,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 8,
    marginTop: 11,
  },
  studentText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.INACTIVE,
  },
  checkboxTouchTarget: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: Colors.INACTIVE,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.BLUE,
    borderColor: Colors.BLUE,
  },

  // Event History
  historyCards: {
    gap: 12,
    marginTop: 16,
  },
  historyCard: {
    height: 84,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    paddingHorizontal: 16,
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

  // Sign Out
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
  signOutLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.RED,
  },
});
