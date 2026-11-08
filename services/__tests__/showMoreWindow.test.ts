import {
  nextShowMoreCount,
  SHOW_MORE_INITIAL,
  showMoreRemaining,
} from '@/services/showMoreWindow';

describe('showMoreWindow', () => {
  it('starts at 3 and adds up to 2', () => {
    expect(SHOW_MORE_INITIAL).toBe(3);
    expect(nextShowMoreCount(3, 10)).toBe(5);
    expect(nextShowMoreCount(9, 10)).toBe(10);
    expect(showMoreRemaining(3, 10)).toBe(7);
    expect(showMoreRemaining(10, 10)).toBe(0);
  });
});
