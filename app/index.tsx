import { ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/auth";
import LoginForm from "@/components/LoginForm";
import ProfileCard from "@/components/ProfileCard";
import ProtectedRequestCard from "@/components/ProtectedRequestCard";

// Imports used for displaying components. For final version delete.
import { Link } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native"; 

import "@/styles/global.css";
import { createComponentForStaticNavigation } from "@react-navigation/native";

export default function HomeScreen() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator />
            </ThemedView>
        );
    }

    // Style used for displaying components. For final version delete.
    const styles = StyleSheet.create({
        button: {
            fontSize: 20,
            textDecorationLine: 'underline',
            color: '#fff',
        },
    });

    
    {/* Link used for displaying components.
        For final version uncomment block below this one. */}
    if (!user) {
        return (
            <View>
                <LoginForm />
                <View>
                    <Link href="/test-screen" style={styles.button}>See all components.</Link>
                    <Link href="/my-events" style={styles.button}>See My Events.</Link>
                </View>
            </View>
        );
    }

    // if (!user) {
    //     return <LoginForm />;
    // }

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
