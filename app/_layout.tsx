import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, usePathname, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter";

import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useState } from "react";
import { AppState, Platform, type AppStateStatus } from "react-native";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { createAppQueryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/context/auth";
import { handleReferralUrl } from "@/services/referralRouting";
import { ROOT_STACK_SCREENS } from "@/utils/rootStackScreens";

export { ROOT_STACK_SCREENS } from "@/utils/rootStackScreens";

SplashScreen.preventAutoHideAsync();

/** Native has no window focus: treat foregrounding the app as a focus event. */
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") focusManager.setFocused(status === "active");
}

function ReferralLinkListener() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const handleUrl = async (url: string | null) => {
      await handleReferralUrl({
        url,
        pathname,
        isAuthed: Boolean(user),
        navigate: (path) => router.push(path as any),
      });
    };

    void Linking.getInitialURL().then((url) => void handleUrl(url));
    const sub = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });
    return () => sub.remove();
  }, [user, isLoading, router, pathname]);

  return null;
}

function RootNavigator() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ReferralLinkListener />
      <Stack>
        {ROOT_STACK_SCREENS.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            options={screen.options}
          />
        ))}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_700Bold });
  const [queryClient] = useState(createAppQueryClient);

  useEffect(() => {
    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
