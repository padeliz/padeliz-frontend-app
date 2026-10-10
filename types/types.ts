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

export type EventDetails = {
    eventImage: ImageSourcePropType | null;
    eventName: string;
    date: string;
    /** Short date for compact Info cards, e.g. "24 Oct 2026". */
    dateShort: string;
    /** Weekday label for the event date, e.g. "Saturday". */
    weekday: string;
    location: string;
    locationAddress: string;
    price: string;
    schedule: ScheduleItem[];
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
    /** Playing window start "HH:MM" for grouping on the division step. */
    playingStart?: string;
    /** Playing window end "HH:MM" for grouping on the division step. */
    playingEnd?: string;
};