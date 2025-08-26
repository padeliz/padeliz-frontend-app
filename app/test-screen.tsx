import { StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Tag from "@/components/Visuals/Tag";
import EventInfo from "@/components/TextBoxes/EventInfo";
import EventCard from "@/components/BigComponents/EventCard";
import { DivisionDetails, EventDetails } from "@/types/types";
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
import PictureDescription from "@/components/Visuals/PictureDescription";
import ImageSelect from "@/components/Visuals/ImageSelect";
import Button from "@/components/Buttons/Button";
import InactiveButton from "@/components/TextBoxes/InactiveButton";
import DivisionCard from "@/components/Buttons/DivisionCard";
import ChooseDivision from "@/components/BigComponents/ChooseDivision";
import PaymentDetails from "@/components/TextBoxes/PaymentDetails";
import CircleChecker from "@/components/Visuals/CircleChecker";

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

export const sampleDivision: DivisionDetails = {
    isActive: true,
    isEligible: true,
    name: "Students Rookies",
    price: 45,
    description: "Nver played padel before or a few times only.",
    num_spots: 6,
}

export const sampleDivision2: DivisionDetails = {
    isActive: false,
    isEligible: false,
    name: "Students Rookies",
    price: 45,
    description: "Nver played padel before or a few times only.",
    num_spots: 6,
}

export const sampleDivision3: DivisionDetails = {
    isActive: false,
    isEligible: true,
    name: "Students Rookies",
    price: 45,
    description: "Nver played padel before or a few times only.",
    num_spots: 6,
}

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollview}>
                <Tag label="New" color={Colors.BLUE} isTransparent={false}/>
                <Tag label="Pending Payment" color={Colors.BLUE} isTransparent={false}/>
                <Tag label="Few Spots Remaining" color={Colors.BLUE} isTransparent={false}/>
                <Tag label="Registered" color={Colors.GREEN} isTransparent={false}/>
                <Tag label="Student Discount" color={Colors.GREEN} isTransparent={false}/>
                <Tag label="Pending Review" color={Colors.ORANGE} color2={Colors.ORANGE_T} isTransparent={true}/>
                <EventInfo name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" registered={true} mini={true}/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={true} tag="Estilo Cochino"/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false} tag="New"/>
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
                <PictureDescription image={source} />
                <ImageSelect></ImageSelect>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={true} tag="Estilo Cochino" isMini={true} />

                <DivisionCard details={sampleDivision} />
                <DivisionCard details={sampleDivision2} />
                <DivisionCard details={sampleDivision3} />
                <ChooseDivision divisions={[sampleDivision, sampleDivision2, sampleDivision3]} />
                <PaymentDetails division="Student Rookies" price={45} isDiscount={false} isStudent={true} isStep2={false} />
                <PaymentDetails division="Student Rookies" price={45} isDiscount={false} isStudent={true} isStep2={true} />
                <PaymentDetails division="Student Rookies" price={45} isDiscount={true} isStudent={false} isStep2={true} />
                <PaymentDetails division="Student Rookies" price={45} isDiscount={true} isStudent={true} isStep2={true} />
                <CircleChecker checked={true} />
                <CircleChecker checked={false} />
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