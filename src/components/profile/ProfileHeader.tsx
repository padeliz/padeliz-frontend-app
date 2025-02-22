import { View, StyleSheet, Image } from 'react-native';
import { Text, Avatar, Badge } from 'react-native-paper';
import { Profile } from '@/types/api/profile';
import { spacing } from '@/theme/spacing';

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Avatar.Image
          size={80}
          source={{ uri: profile.profilePhoto.url }}
        />
        {profile.profilePhoto.status === 'pending' && (
          <Badge style={styles.badge}>Pending</Badge>
        )}
      </View>
      <Text variant="headlineMedium" style={styles.name}>
        {profile.personalInfo.fullName}
      </Text>
      <Text variant="bodyMedium" style={styles.email}>
        {profile.primaryEmail}
      </Text>
      <View style={styles.stats}>
        <StatItem
          label="Events"
          value={profile.eventHistory.total.toString()}
        />
        <StatItem
          label="Upcoming"
          value={profile.eventHistory.upcoming.toString()}
        />
        <StatItem
          label="Referrals"
          value={profile.referralCount.toString()}
        />
      </View>
    </View>
  );
}

interface StatItemProps {
  label: string;
  value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text variant="titleLarge" style={styles.statValue}>
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFA000',
  },
  name: {
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  email: {
    color: '#666',
    marginBottom: spacing.lg,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
});
