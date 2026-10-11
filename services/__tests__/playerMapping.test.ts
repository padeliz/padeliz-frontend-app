import { mapPlayerToUser } from '@/services/authUser';
import {
  identityListLabel,
  playerAvatarUrl,
  playerDisplayName,
  primaryPlayerEmail,
  primaryPlayerPhone,
  sortedGoogleIdentities,
} from '@/services/playerMapping';
import { makeGoogleIdentity, makePlayer, makePlayerEmail, makePlayerPhone } from '@/testing/fixtures';

describe('playerMapping', () => {
  it('uses primary email and phone when present', () => {
    const player = makePlayer({
      emails: [
        makePlayerEmail({ email: 'other@example.com', is_primary: false }),
        makePlayerEmail({ email: 'primary@example.com', is_primary: true }),
      ],
      phones: [
        makePlayerPhone({ phone: '0711111111', is_primary: false }),
        makePlayerPhone({ phone: '0722222222', is_primary: true }),
      ],
    });

    expect(primaryPlayerEmail(player)).toBe('primary@example.com');
    expect(primaryPlayerPhone(player)).toBe('0722222222');
  });

  it('uses the API avatar_url (Google primary/latest) first', () => {
    const player = makePlayer({
      avatar_url: 'https://example.com/api-avatar.png',
      identities: [makeGoogleIdentity({ avatar_url: 'https://example.com/other.png' })],
    });
    expect(playerAvatarUrl(player)).toBe('https://example.com/api-avatar.png');
  });

  it('never falls back to PDF or uploaded profile images', () => {
    const player = makePlayer({
      avatar_url: null,
      uploaded_profile_images: [
        { id: 1, url: 'https://example.com/other.png' },
        { id: 2, url: 'https://example.com/pdf.png', is_pdf_primary: true },
      ],
      identities: [makeGoogleIdentity({ avatar_url: null })],
    });
    expect(playerAvatarUrl(player)).toBeUndefined();
  });

  it('without avatar_url picks the primary Google identity, else the latest linked', () => {
    const identities = [
      makeGoogleIdentity({
        id_user_identity: 1,
        linked_at: 100,
        avatar_url: 'https://example.com/first.png',
      }),
      makeGoogleIdentity({
        id_user_identity: 2,
        linked_at: 200,
        avatar_url: 'https://example.com/second.png',
      }),
    ];
    expect(sortedGoogleIdentities(makePlayer({ identities })).map((i) => i.id_user_identity)).toEqual([
      1, 2,
    ]);
    expect(playerAvatarUrl(makePlayer({ avatar_url: null, identities }))).toBe(
      'https://example.com/second.png'
    );

    identities[0].is_avatar_primary = true;
    expect(playerAvatarUrl(makePlayer({ avatar_url: null, identities }))).toBe(
      'https://example.com/first.png'
    );
  });

  it('labels identities by email then display name', () => {
    expect(
      identityListLabel(makeGoogleIdentity({ email: 'a@b.com', display_name: 'Name' }))
    ).toBe('a@b.com');
    expect(
      identityListLabel(makeGoogleIdentity({ email: null, display_name: 'Only Name' }))
    ).toBe('Only Name');
  });

  it('maps player to app user from primary contacts and the Google avatar_url', () => {
    const player = makePlayer({
      emails: [makePlayerEmail({ email: 'mapped@example.com', is_primary: true })],
      phones: [makePlayerPhone({ phone: '0799999999', is_primary: true })],
      avatar_url: 'https://example.com/google.png',
      uploaded_profile_images: [
        { id: 1, url: 'https://example.com/pdf.png', is_pdf_primary: true },
      ],
    });
    expect(mapPlayerToUser(player)).toMatchObject({
      email: 'mapped@example.com',
      phone: '0799999999',
      picture: 'https://example.com/google.png',
    });
  });

  it('builds display name without legacy google_* fields', () => {
    const player = makePlayer({
      name: null,
      first_name: 'Ana',
      last_name: 'Pop',
      identities: [makeGoogleIdentity({ display_name: 'Ignored Google' })],
    });
    expect(playerDisplayName(player)).toBe('Ana Pop');
  });
});
