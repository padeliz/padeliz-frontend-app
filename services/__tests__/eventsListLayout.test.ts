import {
  EVENTS_CHIP_SCROLL_HEIGHT,
  EVENTS_CHIP_SCROLL_STYLE,
} from '@/services/eventsListLayout';

describe('eventsListLayout chip ScrollView shell', () => {
  it('uses flexGrow 0 and fixed height 56', () => {
    expect(EVENTS_CHIP_SCROLL_HEIGHT).toBe(56);
    expect(EVENTS_CHIP_SCROLL_STYLE).toEqual({
      flexGrow: 0,
      flexShrink: 0,
      height: 56,
    });
  });
});
