import {
  buildFriendInputs,
  discoveryFormError,
  discoveryNeeded,
  friendRowFromSearchResult,
  friendRowFromSuggestion,
  friendsSourceSelected,
  isLevelFlowTarget,
  newFriendRow,
} from '@/services/discoveryGate';
import { makeDiscoverySummary, MEDIA_SOURCES } from '@/testing/fixtures';

describe('discoveryNeeded (intercept rule)', () => {
  it('is needed when media is empty', () => {
    expect(discoveryNeeded(makeDiscoverySummary())).toBe(true);
  });

  it('is needed when Friends is selected and friends are empty', () => {
    expect(
      discoveryNeeded(
        makeDiscoverySummary({
          media_source_ids: [4],
          friends_selected: true,
          friends: [],
        })
      )
    ).toBe(true);
  });

  it('is not needed when media is set and Friends is not selected', () => {
    expect(
      discoveryNeeded(makeDiscoverySummary({ media_source_ids: [1], friends_selected: false }))
    ).toBe(false);
  });

  it('is not needed when Friends is selected and at least one friend exists', () => {
    expect(
      discoveryNeeded(
        makeDiscoverySummary({
          media_source_ids: [4],
          friends_selected: true,
          friends: [
            {
              id_player_friends_source: 1,
              player_user_id: 9,
              friend_player_user_id: null,
              full_name: 'Mihai',
              email: null,
              phone: null,
            },
          ],
        })
      )
    ).toBe(false);
  });
});

describe('discovery form helpers', () => {
  it('validates the stored target', () => {
    expect(isLevelFlowTarget('assessment')).toBe(true);
    expect(isLevelFlowTarget('registration')).toBe(true);
    expect(isLevelFlowTarget('eligibility')).toBe(false);
    expect(isLevelFlowTarget(undefined)).toBe(false);
  });

  it('detects the Friends source in the selection', () => {
    expect(friendsSourceSelected(MEDIA_SOURCES, [1, 2])).toBe(false);
    expect(friendsSourceSelected(MEDIA_SOURCES, [1, 4])).toBe(true);
  });

  it('keeps at most 3 friends and skips blank rows', () => {
    const rows = [
      newFriendRow({ full_name: 'A' }),
      newFriendRow({ full_name: ' ' }),
      newFriendRow({ email: 'b@x.com' }),
      newFriendRow({ full_name: 'C' }),
      newFriendRow({ full_name: 'D' }),
    ];
    const inputs = buildFriendInputs(rows);
    expect(inputs).toHaveLength(3);
    expect(inputs[0]).toEqual({ friend_player_user_id: null, full_name: 'A', email: null, phone: null });
    expect(inputs[1]).toEqual({ friend_player_user_id: null, full_name: null, email: 'b@x.com', phone: null });
  });

  it('turns a suggestion into a row carrying friend_player_user_id', () => {
    const row = friendRowFromSuggestion({
      friend_player_user_id: 12,
      full_name: 'Ana',
      touched_at: 1,
    });
    expect(buildFriendInputs([row])).toEqual([
      { friend_player_user_id: 12, full_name: 'Ana', email: null, phone: null },
    ]);
  });

  it('includes phone in friend inputs and treats a phone-only row as a friend', () => {
    const inputs = buildFriendInputs([
      newFriendRow({ phone: ' +40712000009 ' }),
      newFriendRow({ full_name: 'Ana', phone: '   ' }),
    ]);
    expect(inputs).toEqual([
      { friend_player_user_id: null, full_name: null, email: null, phone: '+40712000009' },
      { friend_player_user_id: null, full_name: 'Ana', email: null, phone: null },
    ]);
    expect(
      discoveryFormError({
        selectedIds: [4],
        friendsSelected: true,
        rows: [newFriendRow({ phone: '0712' })],
      })
    ).toBeNull();
  });

  it('turns a search result into a row with friend_player_user_id and name', () => {
    const row = friendRowFromSearchResult({
      id_user: 31,
      name: 'Ioana Vasilescu',
      email_masked: 'i***@example.com',
      phone_masked: '+*********009',
      avatar_url: null,
    });
    expect(row).toMatchObject({ friend_player_user_id: 31, full_name: 'Ioana Vasilescu', phone: '' });
    expect(buildFriendInputs([row])).toEqual([
      { friend_player_user_id: 31, full_name: 'Ioana Vasilescu', email: null, phone: null },
    ]);
  });

  it('requires media, and a friend when Friends is selected', () => {
    expect(discoveryFormError({ selectedIds: [], friendsSelected: false, rows: [] })).toMatch(
      /at least one/i
    );
    expect(
      discoveryFormError({ selectedIds: [4], friendsSelected: true, rows: [newFriendRow()] })
    ).toMatch(/friends/i);
    expect(
      discoveryFormError({
        selectedIds: [4],
        friendsSelected: true,
        rows: [newFriendRow({ full_name: 'Ana' })],
      })
    ).toBeNull();
    expect(
      discoveryFormError({ selectedIds: [1], friendsSelected: false, rows: [] })
    ).toBeNull();
  });
});
