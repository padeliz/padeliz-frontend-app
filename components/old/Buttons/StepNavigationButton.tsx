import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    isForward: boolean;
    isActive: boolean;
    isFinal: boolean;
    label: String;
};

export default function StepNavigationButton({isForward, isActive, isFinal, label}: Props) {
    const color = isActive? Colors.WHITE : Colors.INACTIVE;
    
    if (!isActive) {
        if (isForward) {
            return (
                <View style={[styles.defaultContainer, {borderColor: color, alignSelf: "flex-end"}]}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, {color}]}>Continue to</Text>
                        <Text style={[styles.body, {color}]}>{label}</Text>
                    </View>
                </View>
            );
        }
    }

    if (isActive && isForward) {
        if (isFinal) {
            return (
                <View style={[styles.defaultContainer, {backgroundColor: Colors.BLUE}]}>
                    <Pressable onPress={() => alert("You pressed a button.")}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.title, {color: Colors.CREAM}]}>Continue to</Text>
                            <Text style={[styles.body, {color}]}>{label}</Text>
                        </View>
                    </Pressable>
                </View>
            );
        }
        return (
            <View style={[styles.defaultContainer, {borderColor: color}]}>
                <Pressable onPress={() => alert("You pressed a button.")}>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, {color: Colors.CREAM}]}>Continue to</Text>
                        <Text style={[styles.body, {color}]}>{label}</Text>
                    </View>
                </Pressable>
            </View>
        );
    }

    return (
            <View style={[styles.defaultContainer, {borderColor: color}]}>
                <Pressable onPress={() => alert("You pressed a button.")}>
                    <View style={[styles.textContainer, {alignSelf: "flex-start"}]}>
                        <Text style={[styles.title, {color: Colors.CREAM}]}>Go back to</Text>
                        <Text style={[styles.body, {color}]}>{label}</Text>
                    </View>
                </Pressable>
            </View>
        );
}

const styles = StyleSheet.create({
    defaultContainer: {
        height: 48,
        borderRadius: 8,
        borderWidth: 2,
        paddingHorizontal: 5,
        paddingVertical: 5,
        maxWidth: 172,
        minWidth: 128,
        justifyContent: "center",
        // alignItems: "flex-end",
    },
    textContainer: {
        // alignItems: "flex-end",
        justifyContent: "center",
        flex: 1,
        // borderColor: "red",
        // borderWidth: 2,
        
    },
    title: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.MEDIUM,
        fontSize: 10,
        textAlign: "right",
    },
    body: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.MEDIUM,
        fontSize: Fonts.BODY,
        marginTop: 5,
        textAlign: "right",
    },
});