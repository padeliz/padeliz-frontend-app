import { View, Text, StyleSheet } from "react-native";
import Step from "./Step";
import * as Colors from "@/constants/Colors";
import * as Fonts from "@/constants/Fonts";

type Props = {
    labels: string[];
    currentStep: number;
    color: string;
}

// TODO: maybe add flag for final step

export default function Steps({labels, currentStep, color}: Props) {
    const backgroundColor = color;
    return (
        <View style={styles.container}>
            {labels.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber == currentStep;

                const flex = 1 / labels.length;

                if (stepNumber < labels.length && isCompleted && !isCurrent) {   
                    return (
                        <View>
                        <View style={styles.stepView}>
                            <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                            <View style={[styles.line, {backgroundColor}]} />
                        </View>
                        <Text style={[styles.text, {fontSize: Fonts.BODY_XS, color: Colors.CREAM}]}>{label}</Text>
                        </View> 
                    );
                }

                if (stepNumber < labels.length) {   
                    return (
                        <View>
                            <View style={styles.stepView}>
                                <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                                <View style={[styles.line, {backgroundColor: Colors.GRAY}]} />
                            </View>
                            <Text style={[styles.text, {fontSize: Fonts.BODY_XS, color: Colors.CREAM}]}>{label}</Text>
                        </View>
                    );
                }

                return (
                    <View>
                        <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                        <Text style={[styles.text, {fontSize: Fonts.BODY_XS, color: Colors.CREAM}]}>{label}</Text>
                    </View>
                );

            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 384,
        height: 76,
        flexDirection: "row",
        alignItems: "center",
        alignContent: "center",
        justifyContent: "space-between",
    },
    stepView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    line: {
        width: 34,
        height: 2,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
    },
});