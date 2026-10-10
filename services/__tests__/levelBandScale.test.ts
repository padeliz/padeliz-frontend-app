import {
  bandSegmentLabel,
  divisionSegments,
  parseDivisionNumber,
  pointerFraction,
} from '@/services/levelBandScale';
import type { Level } from '@/types/api';

const family = (n: number): Level[] => [
  { id_level: n * 10 + 3, name: `Division ${n} High`, level_min: `${n}.33`, level_max: `${n}.00` },
  { id_level: n * 10 + 1, name: `Division ${n} Low`, level_min: `${n}.99`, level_max: `${n}.67` },
  { id_level: n * 10 + 2, name: `Division ${n} Mid`, level_min: `${n}.66`, level_max: `${n}.34` },
];

describe('parseDivisionNumber', () => {
  it('parses the division number from the band name', () => {
    expect(parseDivisionNumber('Division 3 Mid')).toBe(3);
    expect(parseDivisionNumber('Division 12 Low')).toBe(12);
  });

  it('returns null when there is no number', () => {
    expect(parseDivisionNumber('Advanced')).toBeNull();
    expect(parseDivisionNumber(null)).toBeNull();
    expect(parseDivisionNumber('')).toBeNull();
  });
});

describe('bandSegmentLabel', () => {
  it('uses the last word of the band name', () => {
    expect(bandSegmentLabel('Division 3 Mid')).toBe('Mid');
  });
});

describe('divisionSegments', () => {
  it('returns only the division family ordered Low -> Mid -> High', () => {
    const segments = divisionSegments('Division 3 Mid', [
      ...family(4),
      ...family(3),
      ...family(2),
    ]);
    expect(segments.map((s) => s.name)).toEqual([
      'Division 3 Low',
      'Division 3 Mid',
      'Division 3 High',
    ]);
    expect(segments.map((s) => s.label)).toEqual(['Low', 'Mid', 'High']);
  });

  it('is empty when the band name has no division or levels are missing', () => {
    expect(divisionSegments('Advanced', family(3))).toEqual([]);
    expect(divisionSegments('Division 3 Mid', null)).toEqual([]);
    expect(divisionSegments('Division 9 Mid', family(3))).toEqual([]);
  });
});

describe('pointerFraction (inverted axis N.99 -> N.00)', () => {
  it('maps N.99 to the left edge and N.00 to the right edge', () => {
    expect(pointerFraction('Division 3 Low', '3.99')).toBe(0);
    expect(pointerFraction('Division 3 High', '3.00')).toBe(1);
  });

  it('maps the middle of the division to the middle of the axis', () => {
    expect(pointerFraction('Division 3 Mid', '3.495')).toBeCloseTo(0.5, 5);
  });

  it('clamps and handles bad input', () => {
    expect(pointerFraction('Division 3 Low', '4.5')).toBe(0);
    expect(pointerFraction('Division 3 Low', '2.1')).toBe(1);
    expect(pointerFraction('Advanced', '3.5')).toBeNull();
    expect(pointerFraction('Division 3 Low', 'abc')).toBeNull();
  });
});
