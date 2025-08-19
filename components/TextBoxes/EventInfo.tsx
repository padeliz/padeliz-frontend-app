import { View, Text, StyleSheet } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from "@/components/Buttons/Button";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    name: String;
    location: String;
    date: String;
    registered: boolean;
    mini?: boolean;
};

export default function EventInfo({ name, location, date, registered, mini }: Props) {
    if (!registered) {
        return (
            <View style={styles.container}>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{ name }</Text>
                    <View style={styles.detailsContainer}>
                        <View style={styles.iconTextContainer}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="map-marker" size={ Fonts.BODY } color={ Colors.CREAM } />   
                            </View>
                            <Text style={styles.details}>{ location }</Text>
                        </View>
                        <View style={styles.iconTextContainer}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="calendar-o" size={ Fonts.BODY } color={ Colors.CREAM } />   
                            </View>
                            <Text style={styles.details}>{ date }</Text>
                        </View>
                    </View>
                </View>
                <Button label="See Event" />
            </View>
        );
    }

    return (mini?
        <View style={[styles.textContainer, {backgroundColor: Colors.DARK_GRAY}]}>
            <Text style={[styles.name, {fontSize: Fonts.HEADING_1}]}>{ name }</Text>
            <View style={[styles.detailsContainer, {backgroundColor: Colors.DARK_GRAY}]}>
                <View style={styles.iconTextContainer}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="calendar-o" size={ Fonts.BODY } color={ Colors.CREAM } />   
                    </View>
                    <Text style={styles.details}>{ date }</Text>
                </View>
            </View>
        </View>
        :
        <View style={[styles.textContainer, {backgroundColor: Colors.GRAY}]}>
            <Text style={styles.name}>{ name }</Text>
            <View style={styles.detailsContainer}>
                <View style={styles.iconTextContainer}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="map-marker" size={ Fonts.BODY } color={ Colors.CREAM } />   
                    </View>
                    <Text style={styles.details}>{ location }</Text>
                </View>
                <View style={styles.iconTextContainer}>
                    <View style={styles.iconContainer}>
                        <FontAwesome name="calendar-o" size={ Fonts.BODY } color={ Colors.CREAM } />   
                    </View>
                    <Text style={styles.details}>{ date }</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.GRAY,
        width: 358,
        alignContent: "center",
        alignItems: "center",
    },
    textContainer: {
        paddingLeft: 15,
        width: 358,
    },
    detailsContainer: {
        paddingBottom: 16,
        paddingTop: 8,
    },
    iconTextContainer: {
        width: 326,
        height: 24,
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 3,
    },
    iconContainer: {
        width: 14,
    },
    name: {
        color: Colors.WHITE,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.HEADING_3,
        fontWeight: Fonts.MEDIUM,
        paddingTop: 11,
    },
    details: {
        color: Colors.CREAM,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        fontWeight: Fonts.REGULAR,
        paddingLeft: 10,
    },
});
