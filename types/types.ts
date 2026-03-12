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
    eventImage: ImageSourcePropType;
    eventName: string;
    date: string;
    location: string;
    price: string;
    schedule: ScheduleItem[];
    eventDescription: string;
    organizerImage: ImageSourcePropType;
    organizerName: string;
    organizerTitle: string;
    status: EventStatus;
    timing: EventTiming;
};

export type EventStatus = 'pending_payment' | 'registered' | 'none' | 'eligibility_pending' | 'registration_pending';
export type EventTiming = 'upcoming' | 'ongoing' | 'past';

export type EventCardData = {
    id: string;
    title: string;
    location: string;
    date: string;
    coverImage: ImageSourcePropType;
    status: EventStatus;
    timing: EventTiming;
};

export type DivisionDetails = {
    isActive: boolean;
    isEligible: boolean;
    name: string;
    price: number;
    description: string;
    num_spots: number;
};