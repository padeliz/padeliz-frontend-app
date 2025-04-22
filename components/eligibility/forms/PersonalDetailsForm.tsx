import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Switch } from 'react-native-paper';
import { useState } from 'react';
import { spacing } from '@/theme/spacing';

interface PersonalDetailsFormProps {
  onSubmit: (data: {
    fullName: string;
    middleName?: string;
    birthDate: string;
    isStudent: boolean;
    studentId?: string;
  }) => void;
}

export function PersonalDetailsForm({ onSubmit }: PersonalDetailsFormProps) {
  const [fullName, setFullName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [studentId, setStudentId] = useState('');

  const handleSubmit = () => {
    onSubmit({
      fullName,
      ...(middleName ? { middleName } : {}),
      birthDate,
      isStudent,
      ...(isStudent ? { studentId } : {}),
    });
  };

  const isValid = fullName && birthDate && (!isStudent || (isStudent && studentId));

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Personal Details
      </Text>

      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        label="Middle Name (Optional)"
        value={middleName}
        onChangeText={setMiddleName}
        style={styles.input}
      />

      <TextInput
        label="Birth Date (YYYY-MM-DD)"
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
        keyboardType="numeric"
      />

      <View style={styles.switchContainer}>
        <Text>Are you a student?</Text>
        <Switch value={isStudent} onValueChange={setIsStudent} />
      </View>

      {isStudent && (
        <TextInput
          label="Student ID"
          value={studentId}
          onChangeText={setStudentId}
          style={styles.input}
        />
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        disabled={!isValid}
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
  input: {
    marginBottom: spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
});
