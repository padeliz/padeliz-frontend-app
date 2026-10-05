/**
 * Root Stack screen registrations (exported for unit tests).
 * Keep in sync with screens rendered in app/_layout.tsx.
 */
export type RootStackScreen = {
  name: string;
  options?: { headerShown?: boolean };
};

export const ROOT_STACK_SCREENS: RootStackScreen[] = [
  { name: 'index', options: { headerShown: false } },
  { name: '(tabs)', options: { headerShown: false } },
  { name: 'event/[id]', options: { headerShown: false } },
  { name: 'event/[id]/[slug]', options: { headerShown: false } },
  { name: 'event/eligibility-check', options: { headerShown: false } },
  { name: 'event/registration', options: { headerShown: false } },
  { name: 'test-screen' },
  { name: '+not-found' },
];
