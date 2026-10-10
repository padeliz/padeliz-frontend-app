/**
 * Map API `Player` resources into display fields for auth / account UI.
 */
import type { Player, PlayerIdentity } from "@/types/api";

const PROVIDER_GOOGLE = "google";

export function primaryPlayerEmail(player: Player): string {
  const emails = player.emails ?? [];
  const primary = emails.find((e) => e.is_primary)?.email;
  if (primary) return primary;
  return emails[0]?.email ?? "";
}

export function primaryPlayerPhone(player: Player): string {
  const phones = player.phones ?? [];
  const primary = phones.find((p) => p.is_primary)?.phone;
  if (primary) return primary;
  return phones[0]?.phone ?? "";
}

/** Google identities ordered by linked_at asc, then id_identity asc. */
export function sortedGoogleIdentities(player: Player): PlayerIdentity[] {
  return (player.identities ?? [])
    .filter((i) => i.provider === PROVIDER_GOOGLE)
    .slice()
    .sort((a, b) => {
      if (a.linked_at !== b.linked_at) return a.linked_at - b.linked_at;
      return a.id_identity - b.id_identity;
    });
}

/**
 * App avatar: Google only. The API resolves it as `avatar_url` (primary Google identity,
 * else the most recently linked one). When a payload lacks it, the same rule runs over the
 * embedded identities. PDF / uploaded profile images are never used.
 */
export function playerAvatarUrl(player: Player): string | undefined {
  if (player.avatar_url) return player.avatar_url;

  const withAvatar = sortedGoogleIdentities(player).filter((i) => i.avatar_url);
  const primary = withAvatar.find((i) => i.is_avatar_primary);
  if (primary?.avatar_url) return primary.avatar_url;

  // sortedGoogleIdentities is oldest-first, so the latest linked is last.
  return withAvatar[withAvatar.length - 1]?.avatar_url ?? undefined;
}

export function playerDisplayName(player: Player): string {
  if (player.name?.trim()) return player.name.trim();
  const parts = [player.first_name, player.last_name].filter(Boolean) as string[];
  if (parts.length) return parts.join(" ");
  const google = sortedGoogleIdentities(player)[0];
  if (google?.display_name?.trim()) return google.display_name.trim();
  return "Player";
}

export function identityListLabel(identity: PlayerIdentity): string {
  if (identity.email?.trim()) return identity.email.trim();
  if (identity.display_name?.trim()) return identity.display_name.trim();
  return "Google account";
}
