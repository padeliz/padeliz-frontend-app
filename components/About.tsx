import { View, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    text: String;
};

// TODO: maybe change line height

export default function About({text}: Props) {
    return (
        <View style={styles.container}>
            <Text style={[styles.text, {fontSize: Fonts.HEADING_3, color: Colors.WHITE}]}>
                About the Event
            </Text>
            <Text style={[styles.text, {fontSize: Fonts.BODY_S, color: Colors.CREAM, lineHeight: 26}]}> 
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.DARK_GRAY,
        width: 358,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        textAlign: "justify",
        marginBottom: 12,
        marginTop: 12,
    },
});