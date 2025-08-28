import { View, Image, ImageSourcePropType, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import EventInfo from "../TextBoxes/EventInfo";
import LocationPriceBox from "../Visuals/LocationPriceBox";
import Schedule from "../TextBoxes/Schedule";
import About from "../TextBoxes/About";
import PersonCard from "../TextBoxes/PersonCard";
import Button from "../Buttons/Button";
import { EventDetails } from "@/types/types";
import { BLUE, DARK_GRAY, GRAY } from "@/constants/Colors";

// TODO: maybe fix margins bc they are UGLY
type Props = {
    event: EventDetails;
};

export default function UpcomingEventDetails({event}: Props) {
    const router = useRouter();

    if (!event.isRegistered) {
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
                    onPress={() => router.push({ pathname: "../../eligibility-check", params: { eventId: event.id } })}
                />
            </SafeAreaView>
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
});