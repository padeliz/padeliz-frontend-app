import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/auth";
import { EventsProvider } from "@/context/events";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  // Auth gating is declarative: a false `guard` removes those screens from the navigator,
  // and expo-router falls back to the first remaining screen. Signing out (user -> null)
  // therefore tears down the tabs/event screens and lands on `index` (login) on its own —
  // no imperative redirect, so no navigation race or focus-effect loop.
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="event/eligibility-check" options={{ headerShown: false }} />
          <Stack.Screen name="event/registration" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Screen name="test-screen" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <EventsProvider>
        <RootNavigator />
      </EventsProvider>
    </AuthProvider>
  );
}
