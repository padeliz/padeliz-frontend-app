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

/** Dirty top-left back: discard, save, or stay. */
export type DirtyLeaveChoice = "discard" | "save" | "stay";

export function confirmDirtyLeaveAsync(
  title = "Unsaved changes",
  message = "You have unsaved changes on this step."
): Promise<DirtyLeaveChoice> {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: "Leave without saving",
        style: "destructive",
        onPress: () => resolve("discard"),
      },
      {
        text: "Save & leave",
        onPress: () => resolve("save"),
      },
      {
        text: "Continue editing",
        style: "cancel",
        onPress: () => resolve("stay"),
      },
    ]);
  });
}
