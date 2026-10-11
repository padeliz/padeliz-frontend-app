import { Redirect } from "expo-router";

import "../global.css";

/** Root `/` always lands on the Events tab (guest-capable). */
export default function HomeScreen() {
  return <Redirect href="/(tabs)" />;
}
