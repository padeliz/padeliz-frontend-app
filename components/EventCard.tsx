import { View, StyleSheet, ImageBackground, ImageSourcePropType } from "react-native";
// import { ImageSource } fr
import Tag from "@/components/Tag";
import EventInfo from "@/components/EventInfo";

type Props = {
    name: String;
    location: String;
    date: String;
    image: ImageSourcePropType;
};

export default function EventCard({ name, location, date, image}: Props) {
    return (
        <View style={styles.container}>
            <ImageBackground source={image} style={styles.image}> 
                <View style={styles.tagContainer}>
                    <Tag label="Estilo Cochino!" style="blue"/>
                </View>
            </ImageBackground>
            <EventInfo name={name} location={location} date={date} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        height: 316,
        borderRadius: 8,
        overflow: "hidden",
    },
    tagContainer: {
        position: "absolute",
        top: 7,
        right: 7,
    },
    image: {
        width: 358,
        height: 200
    },
    // eventInfoContainer: {
    //     flex:
    // }
});