/**
 * Discovery is NOT a post-login gate. It is only shown when the player taps
 * "Assess my level" or "Register" AND discovery is incomplete:
 *   media empty  OR  (Friends selected AND friends empty).
 * After Discovery is submitted the player continues to the stored target.
 */
import type {
  DiscoverySummary,
  FriendInput,
  FriendSuggestion,
  PlayerSearchResult,
} from "@/types/api";
import { FRIENDS_SOURCE_CODE, MAX_FRIENDS } from "@/services/discovery";

/** What the player was trying to do when Discovery intercepted them. */
export type LevelFlowTarget = "assessment" | "registration";

export function isLevelFlowTarget(v: unknown): v is LevelFlowTarget {
  return v === "assessment" || v === "registration";
}

export function discoveryNeeded(
  summary: Pick<
    DiscoverySummary,
    "media_source_ids" | "friends_selected" | "friends"
  >
): boolean {
  const mediaEmpty = (summary.media_source_ids ?? []).length === 0;
  const friendsMissing =
    Boolean(summary.friends_selected) && (summary.friends ?? []).length === 0;
  return mediaEmpty || friendsMissing;
}

// ---------- Discovery form helpers ----------

export type FriendRow = {
  key: string;
  friend_player_id: number | null;
  full_name: string;
  email: string;
  phone: string;
};

let rowSeq = 0;

export function newFriendRow(partial: Partial<FriendRow> = {}): FriendRow {
  rowSeq += 1;
  return {
    key: `friend-${rowSeq}`,
    friend_player_id: null,
    full_name: "",
    email: "",
    phone: "",
    ...partial,
  };
}

/** A picked search result: links the real player and carries their name. */
export function friendRowFromSearchResult(p: PlayerSearchResult): FriendRow {
  return newFriendRow({ friend_player_id: p.id_player, full_name: p.name });
}

export function friendRowFromSuggestion(s: FriendSuggestion): FriendRow {
  return newFriendRow({
    friend_player_id: s.friend_player_id,
    full_name: s.full_name,
  });
}

function rowHasIdentifier(r: FriendRow): boolean {
  return (
    r.friend_player_id != null ||
    r.full_name.trim() !== "" ||
    r.email.trim() !== "" ||
    r.phone.trim() !== ""
  );
}

/** Non-empty rows as API friends (max 3). */
export function buildFriendInputs(rows: FriendRow[]): FriendInput[] {
  return rows
    .filter(rowHasIdentifier)
    .slice(0, MAX_FRIENDS)
    .map((r) => ({
      friend_player_id: r.friend_player_id,
      full_name: r.full_name.trim() || null,
      email: r.email.trim() || null,
      phone: r.phone.trim() || null,
    }));
}

/** Whether the selected media include the Friends source. */
export function friendsSourceSelected(
  catalog: Array<{ id_media_source: number; code: string }>,
  selectedIds: number[]
): boolean {
  return catalog.some(
    (m) => m.code === FRIENDS_SOURCE_CODE && selectedIds.includes(m.id_media_source)
  );
}

/** Client-side Discovery rules: ≥1 media; Friends selected ⇒ ≥1 friend. */
export function discoveryFormError(args: {
  selectedIds: number[];
  friendsSelected: boolean;
  rows: FriendRow[];
}): string | null {
  if (args.selectedIds.length === 0) return "Pick at least one option.";
  if (args.friendsSelected && buildFriendInputs(args.rows).length === 0) {
    return "Tell us who told you about Padeliz (up to 3 friends).";
  }
  return null;
}
