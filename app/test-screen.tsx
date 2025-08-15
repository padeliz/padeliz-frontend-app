import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Tag";
import EventInfo from "@/components/EventInfo";
import EventCard from "@/components/EventCard";
import LocationPriceBox from "@/components/LocationPriceBox";
import Schedule from "@/components/Schedule";
import About from "@/components/About";
import PersonCard from "@/components/PersonCard";
import { EventDetails } from "@/types/types";
import UpcomingEventDetails from "@/components/UpcomingEventDetails";

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
                <LocationPriceBox location="Padel ONE" price="RON 45-75" />
                <Schedule activities={activities} times={times}></Schedule>
                <About text="Me gustan los puerco', bien perro, bien suelto
                    Que me dé sin miedo, que me coma hasta lo' hueso'
                    Yo no tomo perco (No) pero me le acerco (Sí)
                    Pa' que to'a esa vaina me anestesie todo el cuerpo"></About>
                <PersonCard image={source} name="Jenn Morel" title="Singer and Rapper"></PersonCard>
                <UpcomingEventDetails event={sampleEvent} />
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