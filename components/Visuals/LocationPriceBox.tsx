import { View, StyleSheet } from "react-native";
import Detail from "../TextBoxes/Detail";
import * as Colors from "@/constants/Colors";

type Props = {
    location: String,
    price: String,
};

export default function LocationPriceBox({location, price}: Props) {
    return (
        <View style={styles.container}>
            <Detail type="location" text={location} />
            <Detail type="price" text={price} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.DARK_GRAY,
        width: 358,
        flexDirection: "row",
        justifyContent: "space-between",
    },
});