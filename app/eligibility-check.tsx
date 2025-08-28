import { SafeAreaView, StyleSheet } from "react-native";
import FormQuestion from "@/components/BigComponents/FormQuestion";
import Steps from "@/components/Visuals/Steps";
import * as Colors from "@/constants/Colors"
import { FullLabel } from "@/types/types";
import { EligibilityCheck } from "@/types/types";

const sampleLabel: FullLabel = {
    label: "Instagram",
    sublabel: "",
    icon: "check",
};

const labelVector = [sampleLabel, sampleLabel, sampleLabel];

const sampleQuestion: EligibilityCheck = {
    stepLabels: ["Source", "Sports", "Details", "Photo", "Review"],
    currentStep: 1,
    isCheckable: true,
    question: "How did you discover us?",
    description: "Select where you first heard about Padeliz",
    answers: labelVector,
};

// TODO: ADD NAVIGATION BUTTON

export default function EligibilityCheckScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Steps labels={sampleQuestion.stepLabels} currentStep={sampleQuestion.currentStep} color={Colors.ORANGE} />
            <FormQuestion
                isCheckable={sampleQuestion.isCheckable}
                title={sampleQuestion.question}
                subtitle={sampleQuestion.description}
                answers={sampleQuestion.answers}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.DARK_GRAY,
        padding: 16,
        alignItems: "center",
        rowGap: 16,
    },
});