/**
 * Root Stack screen registrations (exported for unit tests).
 * Keep in sync with screens rendered in app/_layout.tsx.
 *
 * The native header is hidden globally (`<Stack screenOptions={{ headerShown: false }}>` in
 * app/_layout.tsx); screens draw their
 * own `ScreenHeader`. New routes inherit that default. Only list `options` for intentional
 * opt-ins (e.g. `headerShown: true`).
 */
export type RootStackScreen = {
  name: string;
  options?: { headerShown?: boolean };
};

export const ROOT_STACK_SCREENS: RootStackScreen[] = [
  { name: 'index' },
  { name: '(tabs)' },
  { name: 'event/[id]' },
  { name: 'event/[id]/[slug]' },
  { name: 'event/registration' },
  { name: 'discovery' },
  { name: 'level-assessment' },
  { name: 'student-proof' },
  // Intentional opt-ins: keep the native header.
  { name: 'test-screen', options: { headerShown: true } },
  { name: '+not-found', options: { headerShown: true } },
];
