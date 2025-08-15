import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Tag";
import EventInfo from "@/components/EventInfo";
import EventCard from "@/components/EventCard";
import { EventDetails } from "@/types/types";
import UpcomingEventDetails from "@/components/UpcomingEventDetails";
import Step from "@/components/Step";
import { ORANGE } from "@/constants/Colors";

const source = require("../assets/images/estilo-cochino.png");
let activities = ["Arriving", "Lottery", "Finals"];
let times = ["11:30", "12:20 - 15:30", "15:45 - 15:59"];

export const sampleEvent: EventDetails = {
    eventImage: source,
    eventName: "ARSH Padel Mini Tour",
    date: "24 aug 2025",
    location: "Padel ONE",
    price: "ROM 45-75",
    activities: activities,
    times: times,
    eventDescription: "Me gustan los puerco', bien perro, bien suelto",
    organizerImage: source,
    organizerName: "Jenn Morel",
    organizerTitle: "Singer and Rapper"
};

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollview}>
                <Tag label="New" style="blue"/>
                <Tag label="Pending Payment" style="blue"/>
                <Tag label="Few Spots Remaining" style="blue"/>
                <Tag label="Registered" style="green"/>
                <Tag label="Student Discount" style="green"/>
                <Tag label="Pending Review" style="orange"/>
                <EventInfo name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" registered={true} mini={true}/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={true} />
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false}/>
                <UpcomingEventDetails event={sampleEvent} />
                <Step isCompleted={true} isCurrent={false} number={1} color={ORANGE} label="Source"></Step>
                <Step isCompleted={true} isCurrent={true} number={1} color={ORANGE} label="Source"></Step>
                <Step isCompleted={false} isCurrent={false} number={1} color={ORANGE} label="Source"></Step>
            </ScrollView>
        </SafeAreaView>
    );
}


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        scrollview: {
            flex: 1,
        },
        text: {
            fontSize: 42,
            color: '#fff',
        },
    });