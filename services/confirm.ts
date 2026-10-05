import { Alert, Platform } from "react-native";

/** Promise wrapper around confirm/cancel. Native uses Alert; web uses window.confirm. */
export function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(
      typeof window !== "undefined" ? window.confirm(text) : false
    );
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Confirm", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
