import { Redirect } from "expo-router";

import "@/styles/global.css";

/** Root `/` always lands on the Events tab (guest-capable). */
export default function HomeScreen() {
  return <Redirect href="/(tabs)" />;
}
