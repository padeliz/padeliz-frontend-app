import UpcomingEventDetails from '@/components/BigComponents/UpcomingEventDetails';
import { EventDetails } from "@/types/types";
import { DARK_GRAY } from '@/constants/Colors';
import { Text, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const source = require("../assets/images/estilo-cochino.png");

let activities = ["Arriving", "Lottery", "Finals"];
let times = ["11:30", "12:20 - 15:30", "15:45 - 15:59"];

export const sampleEvent: EventDetails = {
    id: 1,
    eventImage: source,
    eventName: "ARSH Padel Mini Tour",
    date: "24 aug 2025",
    location: "Padel ONE",
    price: "RON 45-75",
    activities: activities,
    times: times,
    eventDescription: "Me gustan los puerco', bien perro, bien suelto",
    organizerImage: source,
    organizerName: "Jenn Morel",
    organizerTitle: "Singer and Rapper",
    registrationStatus: "not_registered",
    division: "Student Rookies",
};

export default function UpcomingEventScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <UpcomingEventDetails event={sampleEvent} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DARK_GRAY,
    },
    scrollableContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        alignItems: "center",
        gap: 16,
    },
});