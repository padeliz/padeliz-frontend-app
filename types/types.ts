import { ImageSourcePropType } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export type FullLabel = {
    label: string,
    sublabel: string,
    icon: React.ComponentProps<typeof FontAwesome>["name"],
}

export type FontStyle = {
    color: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
}

export type EventDetails = {
    id: number;
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
    isRegistered: boolean;
    isEligible: boolean;
    isReviewed: boolean;
};

export type EligibilityCheck = {
    stepLabels: string[],
    currentStep: number,
    isCheckable: boolean,
    question: string,
    description: string,
    answers: FullLabel[],
};

export type DivisionDetails = {
    isActive: boolean;
    isEligible: boolean;
    name: string;
    price: number;
    description: string;
    num_spots: number;
};