import { View, Text, StyleSheet } from "react-native";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";
import Tag from "../Visuals/Tag";

type Props = {
    division: string;
    price: number;
    isDiscount: boolean;
    isStudent: boolean;
    isStep2: boolean;
};

export default function PaymentDetails({division, price, isDiscount, isStudent, isStep2}: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Payment Details
            </Text>
            <View style={styles.detailsContainer}>
                <View style={styles.feeContainer}>
                    <Text style={[styles.body, {color: Colors.CREAM, fontWeight: Fonts.REGULAR}]}>
                        {division}
                    </Text>
                    <Text style={[styles.body, {color: Colors.WHITE, fontWeight: Fonts.REGULAR}]}>
                        RON {price}
                    </Text>
                </View>

                {isStep2 && (
                    <View style={[{rowGap: 14}]}>
                        {isDiscount && (
                            <View style={styles.feeContainer}>
                                <Tag label={isStudent? "Student Discount" : "Discount"} color={Colors.GREEN} isTransparent={false} />
                                <Text style={[styles.body, { color: Colors.WHITE, fontWeight: Fonts.REGULAR }]}>
                                    - RON {10}
                                </Text>
                            </View>
                        )}
                        <View style={styles.line}/>
                        <View style={styles.feeContainer}>
                            <Text style={[styles.body, {color: Colors.WHITE, fontWeight: Fonts.MEDIUM}]}>
                                Total
                            </Text>
                            <Text style={[styles.body, {color: Colors.WHITE, fontWeight: Fonts.BOLD}]}>
                                RON {price}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 358,
        rowGap: 18,
    },
    detailsContainer: {
        backgroundColor: Colors.GRAY,
        padding: 17,
        rowGap: 14,
        borderRadius: 8,
    },
    feeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    line: {
        height: 1,
        backgroundColor: Colors.CREAM,
    },
    title: {
        color: Colors.WHITE,
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
        fontWeight: Fonts.MEDIUM,
    },
    body: {
        fontFamily: Fonts.NAME,
        fontSize: Fonts.BODY,
    },
});