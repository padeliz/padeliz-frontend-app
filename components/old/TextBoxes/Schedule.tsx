import { View, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    activities: string[];
    times: string[];
};

export default function Schedule({activities, times}: Props) {
    return (
        <View style={styles.container}>
            <Text style={[styles.text, {color: Colors.WHITE, fontSize: Fonts.HEADING_3}]}>Schedule</Text>
            <View style={styles.timeTable}>
                {activities.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <Text style={[styles.text, {color: Colors.WHITE, fontSize: Fonts.BODY}]}>{item}</Text>
                        <Text style={[styles.text, {color: Colors.CREAM, fontSize: Fonts.BODY}]}>{times[index]}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.DARK_GRAY,
        width: 358,
    },
    timeTable: {
        width: 358,
        borderRadius: 8,
        backgroundColor: Colors.GRAY,
        alignContent: "center",
        // alignItems: "center",
    },
    row: {
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: "row",
        justifyContent: "space-between",
        // marginVertical: 5,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        marginBottom: 15,
        marginTop: 15,
    },
});