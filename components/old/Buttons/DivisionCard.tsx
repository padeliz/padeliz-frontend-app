import { View, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { DivisionDetails } from "@/types/types";
import Button from "./Button";
import InactiveButton from "../TextBoxes/InactiveButton";

type Props = {
    details: DivisionDetails;
};

export default function DivisionCard({details}: Props) {
    const spots_text = (details.num_spots? details.num_spots.toString() + " spots left" : "Full");

    return (
        <View style={details.isActive? styles.activeContainer : styles.inactiveContainer}>
            <View style={styles.lineContainer}>
                <Text style={styles.name}>
                    {details.name}
                </Text>
                <Text style={details.isActive? [styles.price, {color: Colors.BLUE}] : [styles.price, {color: Colors.CREAM}]}>
                    RON {details.price}/player
                </Text>
            </View>
            <View style={[{maxWidth: 220}]}>
                <Text style={styles.description}>
                    {details.description}
                </Text>
            </View>
            <View style={styles.lineContainer}>
                <Text style={[styles.price, {color: Colors.CREAM_T}]}>
                    {spots_text}
                </Text>
                {details.isActive? 
                    <Button label="Register" color={Colors.BLUE} width={73} height={36} labelStyle={Fonts.REGULAR_STYLE}/> :
                    <InactiveButton label={details.isEligible? "Select" : "Not eligible"} height={36} />
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    activeContainer: {
        width: 358,
        // height: 136,
        backgroundColor: Colors.GRAY,
        borderRadius: 8,
        padding: 18,
        rowGap: 10,
        borderWidth: 2,
        borderColor: Colors.BLUE,
    },
    inactiveContainer: {
        width: 358,
        // height: 136,
        backgroundColor: Colors.GRAY,
        borderRadius: 8,
        padding: 18,
        rowGap: 10,
        opacity: 0.6,
    },
    lineContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    name: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.MEDIUM,
        fontSize: Fonts.BODY,
        color: Colors.WHITE,
        lineHeight: 24,
    },
    price: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.BODY_S,
    },
    description: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.BODY_XS,
        color: Colors.CREAM,
        lineHeight: 15,
    },
});