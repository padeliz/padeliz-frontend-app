import { View, Image, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Icon from "@expo/vector-icons/FontAwesome"
import EventInfo from "../TextBoxes/EventInfo";
import LocationPriceBox from "../Visuals/LocationPriceBox";
import Schedule from "../TextBoxes/Schedule";
import About from "../TextBoxes/About";
import PersonCard from "../TextBoxes/PersonCard";
import Button from "../Buttons/Button";
import { EventDetails } from "@/types/types";
import { BLUE, DARK_GRAY, GRAY, ORANGE, WHITE } from "@/constants/Colors";
import { BODY, HEADING_2, MEDIUM, NAME } from "@/constants/Fonts";
import RegisteredEventInfo from "../TextBoxes/RegisteredEventInfo";

// TODO: maybe fix margins bc they are UGLY
type Props = {
    event: EventDetails;
};

export default function UpcomingEventDetails({event}: Props) {
    const router = useRouter();

    if (event.registrationStatus == "not_registered" || event.registrationStatus == "eligible") {
        const pathname = (event.registrationStatus == "not_registered"? "../../eligibility-check" : "../../registration-process");
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollview}>
                    <Image source={event.eventImage} style={styles.image}></Image>
                    <EventInfo name={event.eventName} location={event.location} date={event.date} registered={true} mini={true} />
                    <View style={styles.margin}>
                        <LocationPriceBox location={event.location} price={event.price} />
                        <Schedule activities={event.activities} times={event.times} />
                        <About text={event.eventDescription} />
                        <PersonCard image={event.organizerImage} name={event.organizerName} title={event.organizerTitle} />
                    </View>
                </ScrollView>
                <View style={styles.line} />
                <Button
                    label="Register Now"
                    width={358}
                    height={56}
                    color={BLUE}
                    onPress={() => router.push({ pathname: pathname, params: { eventId: event.id } })}
                />
            </SafeAreaView>
        );
    }

    if (event.registrationStatus == "eligibility_pending" || event.registrationStatus == "registration_pending") {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollview}>
                    <Image source={event.eventImage} style={styles.image}></Image>
                    <EventInfo name={event.eventName} location={event.location} date={event.date} registered={true} mini={true} />
                    <View style={styles.margin}>
                        <LocationPriceBox location={event.location} price={event.price} />
                        <Schedule activities={event.activities} times={event.times} />
                        <About text={event.eventDescription} />
                        <PersonCard image={event.organizerImage} name={event.organizerName} title={event.organizerTitle} />
                    </View>
                </ScrollView>
                <View style={styles.line} />
                <View style={styles.buttonView}>
                    <View style={{flexDirection: "row", columnGap: 10, alignItems: "center", justifyContent: "center"}}>
                        <Icon name="clock-o" size={HEADING_2} color={WHITE} />
                        <Text style={styles.text}>
                            {event.registrationStatus == "registration_pending"? "Registration Review in Pending" :
                            "Eligibility Check in Pending"}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (event.division) {
        return (
            <View style={styles.container}>
                <RegisteredEventInfo name={event.eventName} division={event.division} date={event.date} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: DARK_GRAY,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 15,
        rowGap: 15,
    },
    margin: {
        alignItems: "center",
    },
    scrollview: {
        flex: 1,
    },
    line: {
        width: 1,
        backgroundColor: GRAY,
    },
    image: {
        width: 384,
        height: 217,
    },
    buttonView: {
        width: 358,
        height: 56,
        backgroundColor: ORANGE,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    text: {
        fontFamily: NAME,
        fontSize: BODY,
        color: WHITE,
        fontWeight: MEDIUM,
    },
});