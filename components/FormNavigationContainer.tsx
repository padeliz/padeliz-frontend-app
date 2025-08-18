import { View, StyleSheet } from "react-native";
import StepNavigationButton from "./StepNavigationButton";

type Props = {
    isFirst: boolean;
    isActive: boolean;
    currentStep: number;
    stepList: string[];
    isFinal: boolean;
};

export default function FormNavigationContainer({isFirst, isActive, currentStep, stepList, isFinal}: Props) {
    if (isFirst) {
        return (
            <View style={[styles.container, {justifyContent: "flex-end"}]}>
                <View style={styles.container2}>
                    <View style={styles.container2} />
                    <StepNavigationButton isForward={true} isActive={isActive} isFinal={isFinal} label={stepList[1]} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.container2}>
                <StepNavigationButton isForward={false} isActive={true} isFinal={false} label={stepList[currentStep - 2]} />
                <View style={styles.container2}/>
                <StepNavigationButton isForward={true} isActive={isActive} isFinal={isFinal} label={stepList[currentStep]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 390,
        height: 88,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "flex-end",
        alignContent:"center",
    },
    container2: {
        flexDirection: "row",
        flex: 1,
    },
});