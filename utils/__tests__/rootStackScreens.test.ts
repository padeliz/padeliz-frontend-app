import { ROOT_STACK_SCREENS } from '@/utils/rootStackScreens';

describe('ROOT_STACK_SCREENS', () => {
  it('hides header for event/[id]/[slug] and has no events/[id]', () => {
    const slugScreen = ROOT_STACK_SCREENS.find(
      (s) => s.name === 'event/[id]/[slug]'
    );
    expect(slugScreen?.options?.headerShown).toBe(false);

    const idScreen = ROOT_STACK_SCREENS.find((s) => s.name === 'event/[id]');
    expect(idScreen?.options?.headerShown).toBe(false);

    expect(
      ROOT_STACK_SCREENS.some((s) => s.name.startsWith('events/'))
    ).toBe(false);
  });
});
