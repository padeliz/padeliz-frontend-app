import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip, TextInput, SegmentedButtons } from 'react-native-paper';
import { useState } from 'react';
import { spacing } from '@/theme/spacing';

interface Sport {
  name: 'padel' | 'tennis' | 'ping-pong' | 'squash';
  experienceYears: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  lastPlayed: string;
}

interface SportsBackgroundFormProps {
  onSubmit: (data: { sports: Sport[] }) => void;
}

const SPORTS = ['padel', 'tennis', 'ping-pong', 'squash'] as const;
const FREQUENCIES = ['daily', 'weekly', 'monthly', 'rarely'] as const;

export function SportsBackgroundForm({ onSubmit }: SportsBackgroundFormProps) {
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);

  const handleSportSelect = (sportName: typeof SPORTS[number]) => {
    setCurrentSport({
      name: sportName,
      experienceYears: 0,
      frequency: 'rarely',
      lastPlayed: '',
    });
  };

  const handleSportSave = () => {
    if (currentSport) {
      setSelectedSports([...selectedSports, currentSport]);
      setCurrentSport(null);
    }
  };

  const handleSubmit = () => {
    onSubmit({ sports: selectedSports });
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Sports Experience
      </Text>

      <View style={styles.sportsGrid}>
        {SPORTS.map(sport => (
          <Chip
            key={sport}
            selected={selectedSports.some(s => s.name === sport)}
            onPress={() => handleSportSelect(sport)}
            style={styles.chip}
          >
            {sport}
          </Chip>
        ))}
      </View>

      {currentSport && (
        <View style={styles.form}>
          <Text variant="titleMedium" style={styles.subtitle}>
            {currentSport.name} Experience
          </Text>

          <TextInput
            label="Years of Experience"
            keyboardType="numeric"
            value={currentSport.experienceYears.toString()}
            onChangeText={(value) =>
              setCurrentSport({ ...currentSport, experienceYears: parseInt(value) || 0 })
            }
            style={styles.input}
          />

          <Text style={styles.label}>How often do you play?</Text>
          <SegmentedButtons
            value={currentSport.frequency}
            onValueChange={(value) =>
              setCurrentSport({ ...currentSport, frequency: value as typeof FREQUENCIES[number] })
            }
            buttons={FREQUENCIES.map(freq => ({
              value: freq,
              label: freq.charAt(0).toUpperCase() + freq.slice(1),
            }))}
          />

          <TextInput
            label="Last Played (YYYY-MM)"
            value={currentSport.lastPlayed}
            onChangeText={(value) => setCurrentSport({ ...currentSport, lastPlayed: value })}
            style={styles.input}
          />

          <Button
            mode="contained-tonal"
            onPress={handleSportSave}
            style={styles.saveButton}
          >
            Save Sport
          </Button>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        disabled={selectedSports.length === 0}
      >
        Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    margin: spacing.xs,
  },
  form: {
    marginTop: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  input: {
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
});
