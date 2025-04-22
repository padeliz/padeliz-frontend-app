import { Stack } from 'expo-router';

export default function EligibilityLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="discovery"
        options={{
          title: 'Eligibility Check',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="sports"
        options={{
          title: 'Sports Background',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="personal"
        options={{
          title: 'Personal Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="photos"
        options={{
          title: 'Profile Photos',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="status"
        options={{
          title: 'Eligibility Status',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
