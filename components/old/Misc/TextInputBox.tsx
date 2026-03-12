import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = { 
    isDate: boolean;
    label: string;
    sublabel: string;
};

// TODO: STYLE PLACEHOLDER

export default function TextInputBox({isDate, label, sublabel}: Props) {
    if (isDate) {
        const [day, setDay] = useState("");
        const [month, setMonth] = useState("");
        const [year, setYear] = useState("");

        return (
            <View style={styles.mainDateContainer}>
                <View style={styles.dateContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="birth day"
                        placeholderTextColor={Colors.CREAM}
                        keyboardType="numeric"
                        value={day}
                        onChangeText={setDay}
                    />
                </View>
                <View style={styles.dateContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="birth month"
                        placeholderTextColor={Colors.CREAM}
                        keyboardType="numeric"
                        value={month}
                        onChangeText={setMonth}
                    />
                </View><View style={styles.dateContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="birth year"
                        placeholderTextColor={Colors.CREAM}
                        keyboardType="numeric"
                        value={year}
                        onChangeText={setYear}
                    />
                </View>
            </View>
        );
    }

    const [text, setText] = useState("");
    return (
        <View style={styles.container}>
            <TextInput
                        style={styles.input}
                        placeholder={label + " " + sublabel}
                        placeholderTextColor={Colors.CREAM}
                        value={text}
                        onChangeText={setText}
                    />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        height: 56,
        borderRadius: 8,
        backgroundColor: Colors.GRAY,
        alignContent: "center",
        justifyContent: "center",
        paddingLeft: 15,
    },
    mainDateContainer: {
        width: 358,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dateContainer: {
        width: 111,
        height: 56,
        borderRadius: 8,
        justifyContent: "center",
        backgroundColor: Colors.GRAY,
    },
    contentsContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    mainText: {
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        color: Colors.CREAM,
        fontWeight: Fonts.REGULAR,
    },
    input: {
        width: "100%",
        height: "100%",
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        color: Colors.WHITE,
        fontWeight: Fonts.REGULAR,
        paddingHorizontal: 8,
    }
});