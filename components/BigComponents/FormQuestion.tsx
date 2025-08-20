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
    icons?: React.ComponentProps<typeof FontAwesome>["name"];
};

export default function FormQuestion({isCheckable, title, subtitle, labels, icons}: Props) {
    if (isCheckable) {
        return (
            <View>
                
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {

    }
});