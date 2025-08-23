import { View, Text, StyleSheet, Image, ImageSourcePropType } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    image: ImageSourcePropType;
    name: String;
    title: String;
};

export default function PersonCard({image, name, title}: Props) {
    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={[styles.text, {fontSize: Fonts.BODY, color: Colors.WHITE}]}>{name}</Text>
                <Text style={[styles.text, {fontSize: Fonts.BODY_S, color: Colors.CREAM}]}>{title}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.GRAY,
        width: 358,
        borderRadius: 8,
        flexDirection: "row",
        marginBottom: 12,
    },
    image: {
        width: 48,
        height: 48,
        borderRadius: 9999,
        marginVertical: 15,
        marginLeft: 15,
    },
    textContainer: {
        marginVertical: 15,
        marginLeft: 15,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        lineHeight: 24,
    },
});