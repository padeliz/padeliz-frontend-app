import React, { useState } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import * as Colors from "@/constants/Colors";

export default function Checkbox() {
    const [checked, setChecked] = useState(false);

    return (
        <Pressable
            onPress={() => setChecked(!checked)}
            style={[styles.container, checked ? styles.boxChecked : styles.boxUnchecked]}
        >
        {checked && <Icon name="check" size={14} color={Colors.WHITE} />}
        </Pressable>
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