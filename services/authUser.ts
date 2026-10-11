import type { Player } from "@/types/api";
import {
  playerAvatarUrl,
  playerDisplayName,
  primaryPlayerEmail,
  primaryPlayerPhone,
} from "@/services/playerMapping";

/** Normalized user shape consumed by screens (keeps `picture`/`email`/`name`). */
export type AppUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  picture?: string;
  player: Player;
};

export function mapPlayerToUser(p: Player): AppUser {
  return {
    id: String(p.id_user),
    email: primaryPlayerEmail(p),
    phone: primaryPlayerPhone(p),
    name: playerDisplayName(p),
    picture: playerAvatarUrl(p),
    player: p,
  };
}
