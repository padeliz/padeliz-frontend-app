import { View, Text, StyleSheet } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    type: String;
    text: String;
}

// TODO: ADD DICTIONARY FOR TYPE
// TODO: IMPLEMENT LOGIC FOR PRICE

export default function Detail({type, text}: Props) {
    if (type == "location") { 
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Location</Text>
                <View style={styles.iconTextContainer}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="map-marker" size={Fonts.BODY} color={Colors.WHITE} />   
                    </View>
                    <Text style={styles.text}>{text}</Text>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Price per player</Text>
            <View style={styles.iconTextContainer}>
                <View style={styles.iconContainer}>
                    <FontAwesome name="tag" size={Fonts.BODY} color={Colors.WHITE} />   
                </View>
                <Text style={styles.text}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.GRAY,
        width: 171,
        paddingVertical: 20,
        paddingLeft: 15,
        borderRadius: 8,
    },
    iconContainer: {
        backgroundColor: Colors.GRAY,
        width: 18,
    },
    iconTextContainer: {
        backgroundColor: Colors.GRAY,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
    },
    title: {
        color: Colors.CREAM,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY_S,
        fontWeight: Fonts.REGULAR,
    },
    text: {
        color: Colors.WHITE,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        fontWeight: Fonts.REGULAR,
    }
});