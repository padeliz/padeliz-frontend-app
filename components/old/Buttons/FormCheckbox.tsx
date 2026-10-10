import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Checkbox from "../Visuals/Checkbox";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
    label: string; 
};

export default function FormCheckbox({iconName, label}: Props) {
    const [checked, setChecked] = useState(false);

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setChecked(!checked)} style={{flex: 1, paddingLeft: 15, paddingRight: 20}}>
                <View style={styles.contentsContainer}>
                    <View style={[styles.contentsContainer, {justifyContent: "flex-start"}]}>
                        <View style={{padding: 5}}>
                            <MaterialCommunityIcons name={iconName} size={Fonts.BODY} color={Colors.WHITE} />
                        </View>
                        <Text style={styles.text}>{label}</Text>
                    </View>
                    <Checkbox checked={checked} />
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        height: 56,
        borderRadius: 8,
        backgroundColor: Colors.GRAY,
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
    },
    contentsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    text: {
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        color: Colors.WHITE,
        fontWeight: Fonts.REGULAR,
    }
});