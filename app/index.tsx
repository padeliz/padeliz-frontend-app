import { ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/auth";
import LoginScreen from "@/components/Login/LoginScreen";
import ProfileCard from "@/components/old/ProfileCard";
import ProtectedRequestCard from "@/components/old/ProtectedRequestCard";

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

    return (
        <ThemedView
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
            }}
        >
            <ProfileCard />
            <ProtectedRequestCard />
        </ThemedView>
    );
}
