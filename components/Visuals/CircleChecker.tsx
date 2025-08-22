import { View, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import { blue } from "react-native-reanimated/lib/typescript/Colors";

type Props = {
    checked: boolean;
};

export default function CircleChecker({checked}: Props) {
    return (
        <View style={[styles.container, {borderColor: checked? Colors.BLUE : Colors.CREAM + "40"}]}>
            {checked && 
                <View style={styles.middle} />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 20,
        height: 20,
        borderRadius: 9999,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    middle: {
        width: 10,
        height: 10,
        borderRadius: 9999,
        backgroundColor: Colors.BLUE,
    },
});