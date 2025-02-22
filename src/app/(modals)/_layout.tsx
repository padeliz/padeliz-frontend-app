import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="editions/[id]"
        options={{
          title: 'Event Details',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="register-check/[eventId]"
        options={{
          title: 'Eligibility Check',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="register/[eventId]"
        options={{
          title: 'Register',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="payment-confirmation/[registrationId]"
        options={{
          title: 'Payment',
          headerBackTitle: 'Back',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="link-account"
        options={{
          title: 'Link Google Account',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
