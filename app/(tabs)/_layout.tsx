import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { AuthProvider } from "@/context/auth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Tabs>
          <Tabs.Screen name="my-events" options={{ headerTitle: "My Events", }} />
          <Tabs.Screen name="all-events" options={{ headerTitle: "All Events", }} />
          <Tabs.Screen name="account" options={{ headerTitle: "Account", }} />
          <Tabs.Screen name="+not-found" />
        </Tabs>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
