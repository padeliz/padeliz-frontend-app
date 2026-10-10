import { ROOT_STACK_SCREENS } from '@/utils/rootStackScreens';

describe('ROOT_STACK_SCREENS', () => {
  it('registers event routes without per-screen header options (inherit Stack default)', () => {
    const slugScreen = ROOT_STACK_SCREENS.find(
      (s) => s.name === 'event/[id]/[slug]'
    );
    expect(slugScreen).toBeDefined();
    expect(slugScreen?.options).toBeUndefined();

    const idScreen = ROOT_STACK_SCREENS.find((s) => s.name === 'event/[id]');
    expect(idScreen).toBeDefined();
    expect(idScreen?.options).toBeUndefined();

    expect(
      ROOT_STACK_SCREENS.some((s) => s.name.startsWith('events/'))
    ).toBe(false);
  });

  it('keeps intentional native-header opt-ins only', () => {
    const withOptions = ROOT_STACK_SCREENS.filter((s) => s.options != null);
    expect(withOptions.map((s) => s.name).sort()).toEqual(
      ['+not-found', 'test-screen'].sort()
    );
    for (const screen of withOptions) {
      expect(screen.options?.headerShown).toBe(true);
    }
  });

  it('registers the level progression screens and drops eligibility-check', () => {
    const names = ROOT_STACK_SCREENS.map((s) => s.name);
    expect(names).toEqual(
      expect.arrayContaining(['discovery', 'level-assessment', 'student-proof'])
    );
    expect(names).not.toContain('event/eligibility-check');
  });

  it('new routes inherit the global headerShown: false default', () => {
    const inheriting = ROOT_STACK_SCREENS.filter(
      (s) => s.name !== '+not-found' && s.name !== 'test-screen'
    );
    for (const screen of inheriting) {
      expect(screen.options?.headerShown).toBeUndefined();
    }
  });
});
