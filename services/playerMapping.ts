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

export function playerAvatarUrl(player: Player): string | undefined {
  const pdfPrimary = player.uploaded_profile_images?.find(
    (img) => img.is_pdf_primary
  )?.url;
  if (pdfPrimary) return pdfPrimary;

  for (const identity of sortedGoogleIdentities(player)) {
    if (identity.avatar_url) return identity.avatar_url;
  }

  return player.uploaded_profile_images?.[0]?.url ?? undefined;
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
