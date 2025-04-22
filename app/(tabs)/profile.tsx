import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button, ActivityIndicator } from 'react-native-paper';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { LinkedAccounts } from '@/components/profile/LinkedAccounts';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { useProfile } from '@/hooks/api/useProfile';
import { useAuth } from '@/context/auth/AuthContext';
import { useToast } from '@/context/toast/ToastContext';
import { spacing } from '@/theme/spacing';

export default function ProfileScreen() {
  const { isAuthenticated, googleAuth } = useAuth();
  const { loading, error, profile, fetchProfile, updateProfile, unlinkGoogleAccount } = useProfile();
  const { showToast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const handleUnlinkAccount = async (accountId: string) => {
    try {
      await unlinkGoogleAccount(accountId);
      showToast('Account unlinked successfully', 'success');
    } catch (error) {
      showToast('Failed to unlink account', 'error');
    }
  };

  const handleLinkNewAccount = () => {
    router.push('/link-account');
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <Button mode="contained" onPress={googleAuth.signIn}>
          Sign in with Google
        </Button>
      </View>
    );
  }

  if (loading && !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Button mode="contained" onPress={fetchProfile}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {isEditing ? (
        <ProfileEditForm
          profile={profile}
          onSubmit={handleUpdateProfile}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <ProfileHeader profile={profile} />
          <Button
            mode="outlined"
            onPress={() => setIsEditing(true)}
            icon="account-edit"
            style={styles.editButton}
          >
            Edit Profile
          </Button>
          <LinkedAccounts
            accounts={profile.googleAccounts}
            onUnlink={handleUnlinkAccount}
            onLinkNew={handleLinkNewAccount}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    margin: spacing.md,
  },
  signOutButton: {
    margin: spacing.md,
    marginTop: spacing.xl,
  },
});
