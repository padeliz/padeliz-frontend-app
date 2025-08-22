import { View, Text, StyleSheet, ScrollView } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import { DivisionDetails } from "@/types/types";
import DivisionCard from "../Buttons/DivisionCard";

type Props = {
    divisions: DivisionDetails[];
}

export default function ChooseDivision({divisions}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Choose division
            </Text>
            <ScrollView style={styles.container} contentContainerStyle={{ rowGap: 16 }}>
                {divisions.map((item, index) => (
                    <DivisionCard key={index} details={item} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.DARK_GRAY,
        width: 358,
        rowGap: 16,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.HEADING_3,
        color: Colors.WHITE,
    },
})