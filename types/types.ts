import { ImageSourcePropType } from "react-native";

export type FontStyle = {
    color: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
}

export type ScheduleItem = {
    label: string;
    time: string;
};

/** One Info-tab schedule card (unique check-in + playing window). */
export type ScheduleGroup = {
    items: ScheduleItem[];
};

export type EventDetails = {
    eventImage: ImageSourcePropType | null;
    /** Width/height of the primary cover when known; null → no temp height. */
    coverAspectRatio: number | null;
    eventName: string;
    /** Hero date: long single day or long multi-day range. */
    date: string;
    /** Short/compact date for the Info date box. */
    dateShort: string;
    /** Weekday for single-day events; empty when multi-day (box omits it). */
    weekday: string;
    /**
     * Info date modal lines. Single-day: one `{date} · {weekday}` line;
     * multi-day: two `{D} {Month} {YYYY} · {Weekday}` lines.
     */
    dateModalLines: string[];
    location: string;
    locationAddress: string;
    price: string;
    schedule: ScheduleGroup[];
    /** HTML description from the API (detail/show only). */
    eventDescription: string;
    organizerImage: ImageSourcePropType | null;
    organizerName: string | null;
    status: EventStatus;
    timing: EventTiming;
    badges?: EventBadge[];
    slug?: string | null;
};

export type EventStatus = 'pending_payment' | 'registered' | 'none' | 'registration_pending';
export type EventTiming = 'upcoming' | 'ongoing' | 'past';

export type EventBadge = {
    key: string;
    label: string;
};

export type EventCardData = {
    id: string;
    title: string;
    location: string;
    date: string;
    coverImage: ImageSourcePropType | null;
    /** Width/height of the primary cover when known; null → no temp height. */
    coverAspectRatio: number | null;
    status: EventStatus;
    timing: EventTiming;
    badges?: EventBadge[];
    slug?: string | null;
};

export type DivisionDetails = {
    /** `id_event_division` — sent to the API as `event_division_id`. */
    id: number;
    isActive: boolean;
    isEligible: boolean;
    name: string;
    price: number;
    description: string;
    num_spots: number;
    /** Hex color from the division catalog when present. */
    color?: string | null;
    /** Playing window start label for grouping on the division step. */
    playingStart?: string;
    /** Playing window end label for grouping on the division step. */
    playingEnd?: string;
};
