import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

// Signed-out users are redirected by the passive auth gate in app/_layout.tsx.
// We intentionally do NOT redirect here: expo-router's <Redirect> calls
// router.replace inside useFocusEffect with an un-memoized callback, which re-fires
// every render while focused and causes an infinite navigation loop on sign-out.
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.CARD_BG,
          borderTopWidth: 1,
          borderTopColor: Colors.CREAM_10,
          minHeight: 60,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.BLUE,
        tabBarInactiveTintColor: Colors.CREAM_60,
        tabBarLabelStyle: {
          fontFamily: Fonts.FONT_REGULAR,
          fontSize: Fonts.BODY_XS,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Events',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="all-events"
        options={{
          title: 'All Events',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="calendar-o" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
