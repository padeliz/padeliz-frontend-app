import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/auth";
import LoginScreen from "@/components/Login/LoginScreen";

import "@/styles/global.css";

export default function HomeScreen() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </ThemedView>
        );
    }

    if (!user) {
        return <LoginScreen />;
    }

    return <Redirect href={{ pathname: "/(tabs)" }} />;
}
