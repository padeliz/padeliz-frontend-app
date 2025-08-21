import { View, Text, StyleSheet } from 'react-native';
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    label: string;
    color: string;
    isTransparent: boolean;
    color2?: string;
};

export default function Tag({ label, color, color2, isTransparent }: Props) {

    if (isTransparent) { 
        return (
            <View style={[styles.container, {backgroundColor: color2, borderColor: color, borderWidth: 2}]}>
                <Text style={[styles.label, {color: color}]}>{ label }</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, {backgroundColor: color}]}>
            <Text style={[styles.label, {color: Colors.WHITE}]}>{ label }</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 9999,
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
    },
    label: {
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