import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { Profile, ProfileUpdateRequest } from '@/types/api/profile';
import { spacing } from '@/theme/spacing';

interface ProfileEditFormProps {
  profile: Profile;
  onSubmit: (data: ProfileUpdateRequest) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onSubmit, onCancel }: ProfileEditFormProps) {
  const [fullName, setFullName] = useState(profile.personalInfo.fullName);
  const [phone, setPhone] = useState(profile.personalInfo.phone || '');

  const handleSubmit = () => {
    onSubmit({
      personalInfo: {
        fullName,
        phone: phone || undefined,
      },
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        label="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <View style={styles.buttons}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!fullName}
        >
          Save
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: spacing.md,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  button: {
    minWidth: 100,
  },
});
