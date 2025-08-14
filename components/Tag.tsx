import { View, Text, StyleSheet } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    label: String;
    style: String;
};

// TODO: add color within style, not stylesheet

export default function Tag({ label, style }: Props) {

    if (style == "blue") { 
        return (
            <View style={styles.blueContainer}>
                <Text style={styles.whiteLabel}>{ label }</Text>
            </View>
        );
    }

    if (style == "green") {
        return (
            <View style={styles.greenContainer}>
                <Text style={styles.whiteLabel}>{ label }</Text>
            </View>
        );
    }

    if (style == "orange") {
        return (
            <View style={styles.orangeContainer}>
                <Text style={styles.orangeLabel}>{ label }</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    blueContainer: {
        backgroundColor: Colors.BLUE,
        borderRadius: 9999,
        // height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        minWidth: 50,
        maxWidth: 200,
        alignSelf: "flex-start",
    },
    greenContainer: {
        backgroundColor: Colors.GREEN,
        borderRadius: 25,
        // height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        minWidth: 50,
        maxWidth: 200,
        alignSelf: "flex-start",
    },
    orangeContainer: {
        backgroundColor: Colors.ORANGE_T,
        borderRadius: 25,
        // height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        minWidth: 50,
        maxWidth: 200,
        alignSelf: "flex-start",
        opacity: 0.3,
    },
    whiteLabel: {
        color: Colors.WHITE,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY_S,
        fontWeight: Fonts.REGULAR,
    },
    orangeLabel: {
        color: Colors.ORANGE,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY_S,
        fontWeight: Fonts.REGULAR,
    },
});