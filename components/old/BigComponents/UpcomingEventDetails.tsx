import { View, Image, ImageSourcePropType, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import EventInfo from "../TextBoxes/EventInfo";
import LocationPriceBox from "../Visuals/LocationPriceBox";
import Schedule from "../TextBoxes/Schedule";
import About from "../TextBoxes/About";
import PersonCard from "../TextBoxes/PersonCard";
import { EventDetails } from "@/types/types";
import { DARK_GRAY } from "@/constants/Colors";

// TODO: maybe fix margins bc they are UGLY
type Props = {
    event: EventDetails;
};

export default function UpcomingEventDetails({event}: Props) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollview}>
                {event.eventImage ? (
                    <Image source={event.eventImage} style={styles.image}></Image>
                ) : null}
                <EventInfo name={event.eventName} location={event.location} date={event.date} registered={true} mini={true} />
                <View style={styles.margin}>
                    <LocationPriceBox location={event.location} price={event.price} />
                    <Schedule activities={(event as any).activities} times={(event as any).times} />
                    <About text={event.eventDescription} />
                    {event.organizerName ? (
                        <PersonCard
                            image={event.organizerImage ?? { uri: '' }}
                            name={event.organizerName}
                            title=""
                        />
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: DARK_GRAY,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    margin: {
        alignItems: "center",
    },
    scrollview: {
        flex: 1,
    },
    image: {
        width: 384,
        height: 217,
    }
});