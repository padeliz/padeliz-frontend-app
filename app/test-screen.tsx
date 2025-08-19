import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Tag";
import EventInfo from "@/components/EventInfo";
import EventCard from "@/components/EventCard";
import { EventDetails } from "@/types/types";
import UpcomingEventDetails from "@/components/UpcomingEventDetails";
import Step from "@/components/Step";
import Steps from "@/components/Steps";
import * as Colors from "@/constants/Colors";
import StepNavigationButton from "@/components/StepNavigationButton";
import FormNavigationContainer from "@/components/FormNavigationContainer";
import Checkbox from "@/components/Checkbox";
import FormCheckbox from "@/components/FormCheckbox";

const source = require("../assets/images/estilo-cochino.png");
let activities = ["Arriving", "Lottery", "Finals"];
let times = ["11:30", "12:20 - 15:30", "15:45 - 15:59"];

export const sampleEvent: EventDetails = {
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
                <Steps labels={["Source", "Sports", "Details", "Photo", "Review"]} currentStep={3} color={Colors.ORANGE} />
                <Steps labels={["Division", "Payment", "Proof", "Pending"]} currentStep={3} color={Colors.BLUE} />

                <FormNavigationContainer isFirst={true} isActive={false} currentStep={1} isFinal={false}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>
                <FormNavigationContainer isFirst={false} isActive={false} currentStep={3} isFinal={false}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>
                <FormNavigationContainer isFirst={true} isActive={true} currentStep={1} isFinal={false}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>
                <FormNavigationContainer isFirst={false} isActive={true} currentStep={3} isFinal={false}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>
                <FormNavigationContainer isFirst={true} isActive={true} currentStep={1} isFinal={true}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>
                <FormNavigationContainer isFirst={false} isActive={true} currentStep={3} isFinal={true}stepList={["Source", "Sports", "Details", "Photo", "Review"]}/>

                <Checkbox checked={true}/>
                <Checkbox checked={false}/>
                <FormCheckbox iconName="check" label="whatever" />
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