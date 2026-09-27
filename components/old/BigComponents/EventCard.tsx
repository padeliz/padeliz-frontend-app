import { View, StyleSheet, ImageBackground, Image, ImageSourcePropType } from "react-native";
import Tag from "@/components/old/Visuals/Tag";
import EventInfo from "@/components/old/TextBoxes/EventInfo";
import { BLUE, GRAY } from "@/constants/Colors";

type Props = {
    name: String;
    location: String;
    date: String;
    image: ImageSourcePropType;
    registered: boolean;
    tag: string;
    isMini?: boolean;
};

export default function EventCard({ name, location, date, image, registered, tag, isMini }: Props) {
    if (isMini) {
        return (
            <View style={styles.miniContainer}>
                <Image source={image} style={styles.imageMini} />
                <EventInfo name={name} location={location} date={date} registered={true}/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ImageBackground source={image} style={styles.image}> 
                <View style={styles.tagContainer}>
                    <Tag label={tag} color={BLUE} isTransparent={false} />
                </View>
            </ImageBackground>
            <EventInfo name={name} location={location} date={date} registered={registered}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        borderRadius: 8,
        overflow: "hidden",
    },
    miniContainer: {
        backgroundColor: GRAY,
        width: 358,
        height: 110,
        borderRadius: 8,
        flexDirection: "row",
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "flex-start",
        columnGap: 10,
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
    imageMini: {
        width: 88,
        height: 88,
    },
});