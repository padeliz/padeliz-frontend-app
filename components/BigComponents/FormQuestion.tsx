import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import FormCheckbox from "../Buttons/FormCheckbox";
import TextInputBox from "../Misc/TextInputBox";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import QuestionTitle from "../TextBoxes/QuestionTitle";
import { FullLabel } from "@/types/types";

type Props = {
    isCheckable: boolean;
    title: string;
    subtitle: string;
    answers: FullLabel[],
};

export default function FormQuestion({isCheckable, title, subtitle, answers}: Props) {
    if (isCheckable) {
        return (
            <ScrollView style={styles.container}>
                <QuestionTitle title={title} subtitle={subtitle} />
                <View style={styles.itemsContainer}>  
                    {answers.map((item, index) => (
                        <FormCheckbox iconName={item.icon} label={item.label} />
                    ))};
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <QuestionTitle title={title} subtitle={subtitle} />
            <View style={styles.itemsContainer}>  
                {answers.map((item, index) => (
                    item.label == "date"? 
                        <TextInputBox isDate={true} label={item.label} sublabel={item.sublabel} /> :
                        <TextInputBox isDate={false} label={item.label} sublabel={item.sublabel} />
                ))};
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        backgroundColor: Colors.DARK_GRAY,
    },
    textContainer: {
        justifyContent: "center",
        paddingVertical: 15,
    },
    itemsContainer: {
        flex: 1,
        justifyContent: "space-between",
        rowGap: 14,
    },
    title: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.MEDIUM,
        fontSize: Fonts.HEADING_2,
        color: Colors.WHITE,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        fontSize: Fonts.BODY_S,
        color: Colors.CREAM,
    }
});