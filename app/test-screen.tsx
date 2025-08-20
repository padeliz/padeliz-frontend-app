import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Visuals/Tag";
import EventInfo from "@/components/TextBoxes/EventInfo";
import EventCard from "@/components/BigComponents/EventCard";
import { EventDetails } from "@/types/types";
import UpcomingEventDetails from "@/components/BigComponents/UpcomingEventDetails";
import Step from "@/components/Visuals/Step";
import Steps from "@/components/Visuals/Steps";
import * as Colors from "@/constants/Colors";
import StepNavigationButton from "@/components/Buttons/StepNavigationButton";
import FormNavigationContainer from "@/components/Visuals/FormNavigationContainer";
import Checkbox from "@/components/Visuals/Checkbox";
import FormCheckbox from "@/components/Buttons/FormCheckbox";
import TextInputBox from "@/components/Misc/TextInputBox";
import FormQuestion from "@/components/BigComponents/FormQuestion";
import Warning from "@/components/TextBoxes/Warning";

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

                <FormCheckbox iconName="check" label="whatever" />


                <TextInputBox isDate={false} label="first name" sublabel="(ex: Andreea)" />
                <TextInputBox isDate={true} label="" sublabel="" />

                <FormQuestion isCheckable={true} title="How did you discover us?"
                    subtitle="Select where you first heard about Padeliz" labels={["Instagram", "TikTok", "Facebook", "Friends"]}
                    sublabels={["", "", "", ""]}
                    icons={["check", "check", "check", "check"]}></FormQuestion>
                <FormQuestion isCheckable={false} title="Tell us more about you"
                    subtitle="It's nice having you here" labels={["first name", "last name", "phone number", "date"]}
                    sublabels={["ex: Andreea", "ex: Popescu", "ex: +40700000000", ""]}
                    icons={["check", "check", "check", "check"]}></FormQuestion>

                <Warning text="If no picture meets the criteria, the eligibility application will be rejected."></Warning>
                     
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