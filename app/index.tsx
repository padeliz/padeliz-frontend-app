import { ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/auth";
import LoginScreen from "@/components/Login/LoginScreen";

import "@/styles/global.css";

// Only reachable when signed out — the `guard` in app/_layout.tsx removes this screen
// once a user exists. While the persisted session is still being restored we show a
// spinner so a returning user never flashes the login screen.
export default function HomeScreen() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </ThemedView>
        );
    }

    return <LoginScreen />;
}
