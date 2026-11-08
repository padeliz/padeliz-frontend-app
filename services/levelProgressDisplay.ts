import { dayYmdFromUnix } from "@/services/dateRange";
import { formatDateShort } from "@/services/mappers";
import type { LevelProgressItem } from "@/types/api";

export function formatProgressUnixDate(unix: number): string {
  const ymd = dayYmdFromUnix(unix);
  return formatDateShort(ymd);
}

export function progressItemTitle(item: LevelProgressItem): string {
  if (item.kind === "player_level") {
    const level = item.player_level;
    return level.band_name ?? `Level ${level.level}`;
  }
  const status = item.assessment.review_status;
  if (status === "pending" && item.assessment.ready_for_review) return "Assessment in review";
  if (status === "pending") return "Assessment draft";
  if (status === "approved") return "Assessment approved";
  if (status === "rejected") return "Assessment rejected";
  return "Assessment discarded";
}

export function progressItemSubtitle(item: LevelProgressItem): string | null {
  if (item.kind === "level_assessment") {
    return formatProgressUnixDate(item.inserted_at);
  }
  const level = item.player_level;
  const date = formatProgressUnixDate(item.inserted_at);
  if (level.participation?.event?.name) {
    return `From event: ${level.participation.event.name} · ${date}`;
  }
  if (level.assessment) {
    const st = level.assessment.review_status;
    return `${st.charAt(0).toUpperCase()}${st.slice(1)} assessment · ${date}`;
  }
  return date;
}
