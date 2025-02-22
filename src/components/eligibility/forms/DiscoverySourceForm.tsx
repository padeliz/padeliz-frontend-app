import { View, StyleSheet } from 'react-native';
import { Text, RadioButton, TextInput, Button } from 'react-native-paper';
import { useState } from 'react';
import { spacing } from '@/theme/spacing';

interface DiscoverySourceFormProps {
  onSubmit: (data: {
    type: 'online' | 'friends';
    platform?: string;
    referrals?: string[];
  }) => void;
}

export function DiscoverySourceForm({ onSubmit }: DiscoverySourceFormProps) {
  const [sourceType, setSourceType] = useState<'online' | 'friends'>('online');
  const [platform, setPlatform] = useState('');
  const [referrals, setReferrals] = useState<string[]>(['']);

  const handleSubmit = () => {
    onSubmit({
      type: sourceType,
      ...(sourceType === 'online' ? { platform } : { referrals: referrals.filter(Boolean) }),
    });
  };

  const addReferral = () => {
    if (referrals.length < 3) {
      setReferrals([...referrals, '']);
    }
  };

  const updateReferral = (index: number, value: string) => {
    const newReferrals = [...referrals];
    newReferrals[index] = value;
    setReferrals(newReferrals);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        How did you hear about us?
      </Text>

      <RadioButton.Group onValueChange={value => setSourceType(value as 'online' | 'friends')} value={sourceType}>
        <View style={styles.option}>
          <RadioButton.Item label="Online" value="online" />
          {sourceType === 'online' && (
            <TextInput
              label="Which platform?"
              value={platform}
              onChangeText={setPlatform}
              style={styles.input}
            />
          )}
        </View>

        <View style={styles.option}>
          <RadioButton.Item label="Friends" value="friends" />
          {sourceType === 'friends' && (
            <View>
              {referrals.map((referral, index) => (
                <TextInput
                  key={index}
                  label={`Friend ${index + 1}`}
                  value={referral}
                  onChangeText={(value) => updateReferral(index, value)}
                  style={styles.input}
                />
              ))}
              {referrals.length < 3 && (
                <Button
                  mode="text"
                  onPress={addReferral}
                  style={styles.addButton}
                >
                  Add another friend
                </Button>
              )}
            </View>
          )}
        </View>
      </RadioButton.Group>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        disabled={sourceType === 'online' ? !platform : !referrals[0]}
      >
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  option: {
    marginBottom: spacing.md,
  },
  input: {
    marginTop: spacing.xs,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
  },
});
