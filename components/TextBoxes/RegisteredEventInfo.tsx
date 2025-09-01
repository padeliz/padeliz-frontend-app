import { View, Text, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/FontAwesome";
import Tag from "../Visuals/Tag";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    name: string,
    division: string,
    date: string,
};

export default function RegisteredEventInfo({name, division, date}: Props) {
    return (
        <View style={styles.container}>
            <View style={{rowGap: 12}}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.division}>{division}</Text>
            </View>
            <View style={{justifyContent: "space-between", flexDirection: "row", alignContent: "center"}}>
                <View style={{flexDirection: "row", columnGap: 12}}>
                    <Icon name="calendar-o" color={Colors.WHITE} size={14} />
                    <Text style={styles.date}>{date}</Text>
                </View>
                <Tag label="Registered" isTransparent={false} color={Colors.DARK_GRAY + "20"}></Tag>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.BLUE,
        width: 358,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        rowGap: 15,
    },
    title: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.BOLD,
        color: Colors.WHITE,
        fontSize: Fonts.HEADING_2,
    },
    division: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        color: "#ffffff80",
        fontSize: Fonts.BODY_S,
    },
    date: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
        color: "#ffffff90",
        fontSize: Fonts.BODY_S,
    },
});