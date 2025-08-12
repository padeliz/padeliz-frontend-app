import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Tag";
import EventInfo from "@/components/EventInfo";
import EventCard from "@/components/EventCard";

const source = require("../assets/images/estilo-cochino.png");

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
                <EventInfo name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" />
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} />
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} />
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