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

  it('prefers is_pdf_primary upload for avatar', () => {
    const player = makePlayer({
      uploaded_profile_images: [
        { id: 1, url: 'https://example.com/other.png' },
        { id: 2, url: 'https://example.com/pdf.png', is_pdf_primary: true },
      ],
      identities: [
        makeGoogleIdentity({ avatar_url: 'https://example.com/google.png' }),
      ],
    });

    expect(playerAvatarUrl(player)).toBe('https://example.com/pdf.png');
  });

  it('falls back to earliest Google identity avatar', () => {
    const player = makePlayer({
      uploaded_profile_images: [],
      identities: [
        makeGoogleIdentity({
          id_identity: 2,
          linked_at: 200,
          avatar_url: 'https://example.com/second.png',
        }),
        makeGoogleIdentity({
          id_identity: 1,
          linked_at: 100,
          avatar_url: 'https://example.com/first.png',
        }),
      ],
    });

    expect(sortedGoogleIdentities(player).map((i) => i.id_identity)).toEqual([1, 2]);
    expect(playerAvatarUrl(player)).toBe('https://example.com/first.png');
  });

  it('labels identities by email then display name', () => {
    expect(
      identityListLabel(makeGoogleIdentity({ email: 'a@b.com', display_name: 'Name' }))
    ).toBe('a@b.com');
    expect(
      identityListLabel(makeGoogleIdentity({ email: null, display_name: 'Only Name' }))
    ).toBe('Only Name');
  });

  it('maps player to app user from primary contacts and avatar rules', () => {
    const player = makePlayer({
      emails: [makePlayerEmail({ email: 'mapped@example.com', is_primary: true })],
      phones: [makePlayerPhone({ phone: '0799999999', is_primary: true })],
      uploaded_profile_images: [
        { id: 1, url: 'https://example.com/pdf.png', is_pdf_primary: true },
      ],
    });
    expect(mapPlayerToUser(player)).toMatchObject({
      email: 'mapped@example.com',
      phone: '0799999999',
      picture: 'https://example.com/pdf.png',
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
