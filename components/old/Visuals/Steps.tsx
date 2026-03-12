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
// TODO: make less ugly

// In order to make it look like it does, i encapsulated the step label in Step component.
// Separated Step from Line by using a blank view of variable size.
// PROBLEM: if the text is too long, spaces are of variable size and it looks ugly.

export default function Steps({labels, currentStep, color}: Props) {
    const backgroundColor = color;
    return (
        <View style={styles.container}>
            {labels.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber == currentStep;

                if (stepNumber < labels.length && isCompleted && !isCurrent) {   
                    return (
                        <View>
                            <View style={styles.stepView}>
                                <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                                <View style={styles.randomContainer} />
                                <View style={[styles.line, {backgroundColor}]} />
                                <View style={styles.randomContainer} />
                            </View>
                            
                        </View> 
                    );
                }

                if (stepNumber < labels.length) {   
                    return (
                        <View>
                            <View style={styles.stepView}>
                                <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                                <View style={styles.randomContainer} />
                                <View style={[styles.line, {backgroundColor: Colors.GRAY}]} />
                                <View style={styles.randomContainer} />
                            </View>
                            {/* <Text style={[styles.text, {fontSize: Fonts.BODY_XS, color: Colors.CREAM}]}>{label}</Text> */}
                        </View>
                    );
                }

                return (
                    <View>
                        <Step isCompleted={isCompleted} isCurrent={isCurrent} number={stepNumber} color={color} label={label}/>
                        {/* <Text style={[styles.text, {fontSize: Fonts.BODY_XS, color: Colors.CREAM}]}>{label}</Text> */}
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
        justifyContent: "center",
        paddingHorizontal: 15,
    },
    stepView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    randomContainer: {
        minWidth: 5,
        maxWidth: 20,
    },
    line: {
        width: 34,
        height: 2,
        flex: 1,
        marginBottom: 14,
    },
    text: {
        fontFamily: Fonts.NAME,
        fontWeight: Fonts.REGULAR,
    },
});