import { View, Text, Image, ImageSourcePropType, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import QuestionTitle from "../TextBoxes/QuestionTitle";

type Props = {
    image: ImageSourcePropType;
}

const defaultTitle = "We need a clear picture of you";
const defaultSubtitle = "A picture of you looking into the camera with a background as simple as possible"

export default function PictureDescription({image}: Props) {
    return (
        <View style={styles.container}>
            <QuestionTitle title={defaultTitle} subtitle={defaultSubtitle} />
            <View style={styles.imageContainer}>
                <Image source={image} style={styles.image} />
                <Text style={styles.body}>So you'll look beautiful in this format...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 390,
        backgroundColor: Colors.DARK_GRAY,
        padding: 15,
    },
    body: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.HEADING_3,
        color: Colors.CREAM,
    },
    imageContainer: {
        flexDirection: "row",
        columnGap: 15,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: 200,
        height: 93,
    },
});