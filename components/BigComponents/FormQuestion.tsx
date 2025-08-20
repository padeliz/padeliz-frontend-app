import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import FormCheckbox from "../Buttons/FormCheckbox";
import TextInputBox from "../Misc/TextInputBox";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    isCheckable: boolean;
    title: string;
    subtitle: string;
    labels: string[];
    sublabels: string[];
    icons: React.ComponentProps<typeof FontAwesome>["name"][];
};

export default function FormQuestion({isCheckable, title, subtitle, labels,sublabels, icons}: Props) {
    if (isCheckable) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
                <View style={styles.itemsContainer}>  
                    {labels.map((item, index) => (
                        <FormCheckbox iconName={icons[index]} label={item} />
                    ))};
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <View style={styles.itemsContainer}>  
                {labels.map((item, index) => (
                    item == "date"? 
                        <TextInputBox isDate={true} label={item} sublabel={sublabels[index]} /> :
                        <TextInputBox isDate={false} label={item} sublabel={sublabels[index]} />
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
        // alignItems: "center",
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
        // lineHeight: 18,
    }
});