import { View, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    title: string;
    subtitle: string;
};

export default function QuestionTitle({title, subtitle}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        paddingVertical: 15,
    },
    title: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.MEDIUM,
        fontSize: Fonts.HEADING_2,
        color: Colors.WHITE,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.BODY_S,
        color: Colors.CREAM,
    }
});