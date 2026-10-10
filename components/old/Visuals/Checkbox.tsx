import { View, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import * as Colors from "@/constants/Colors";

type Props = {
    checked: boolean;
};

export default function Checkbox({checked}: Props) {
    return (
        <View style={[styles.container, checked ? styles.boxChecked : styles.boxUnchecked]}>
            {checked && <Icon name="check" size={14} color={Colors.WHITE} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 18,
        height: 18,
        borderRadius: 2,
        alignItems: "center",
        justifyContent: "center",
    },
    boxChecked: {
        backgroundColor: Colors.ORANGE,
    },
    boxUnchecked: {
        borderWidth: 2,
        borderColor: Colors.WHITE,
    }
});