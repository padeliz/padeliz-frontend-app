import { View, Text, StyleSheet } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    text: string;
}

export default function Warning({text}: Props) {
    return (
        <View style={styles.container}>
            <FontAwesome name="warning" size={20} color={Colors.YELLOW} />
            <Text style={styles.text}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        padding: 15,
        backgroundColor: Colors.YELLOW_T,
        borderWidth: 1,
        borderColor: Colors.YELLOW,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        columnGap: 15,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: 400,
        fontSize: Fonts.BODY,
        color: Colors.YELLOW,
    }
});
