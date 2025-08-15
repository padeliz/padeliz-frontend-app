import { View, Text, StyleSheet } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    isCompleted: boolean;
    isCurrent: boolean;
    number: number;
    color: string;
    label: String
};

export default function({isCompleted, isCurrent, number, color, label}: Props) {
    const backgroundColor = color;
    if (isCompleted && !isCurrent) {
        return (
            <View style={styles.container}>
                <View style={[styles.circle, {backgroundColor}]}>
                    <FontAwesome name="check" size={Fonts.BODY_S} color={Colors.WHITE} />
                </View>
            </View>
        );
    }

    if (isCurrent) {
        return (
            <View style={styles.container}>
                <View style={[styles.circle, {backgroundColor}]}>
                    <Text style={[styles.text, {fontSize: Fonts.BODY_S, color: Colors.WHITE}]}>{number}</Text>
                </View>
            </View>
        );
    }

    return (
            <View style={styles.container}>
                <View style={[styles.circle, {backgroundColor: Colors.GRAY}]}>
                    <Text style={[styles.text, {fontSize: Fonts.BODY_S, color: Colors.WHITE}]}>{number}</Text>
                </View>
            </View>
        );
}

const styles = StyleSheet.create({
    container: {
        alignContent: "center",
        alignItems: "center",
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 9999,
        alignContent: "center",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 5,
        marginBottom: 5,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
    }
});