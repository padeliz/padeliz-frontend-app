import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Logo } from '@/components/common/Logo';

const HeaderLogo = () => <Logo />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleContainerStyle: {
        left: 0,
        right: 0,
        paddingHorizontal: 0,
      },
      headerTitle: HeaderLogo,
      tabBarStyle: {
        backgroundColor: '#fff',
      },
    }}>
      <Tabs.Screen
        name="my-events"
        options={{
          title: 'My Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-account" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="upcoming-events"
        options={{
          title: 'All Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
