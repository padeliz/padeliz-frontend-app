import { ImageSourcePropType } from "react-native";

export type EventDetails = {
    eventImage: ImageSourcePropType;
    eventName: string;
    date: string;
    location: string;
    price: string;
    activities: string[];
    times: string[];
    eventDescription: string;
    organizerImage: ImageSourcePropType;
    organizerName: string;
    organizerTitle: string;
};